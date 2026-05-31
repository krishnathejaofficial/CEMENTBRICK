// src/services/pricing.js
/**
 * BRICKYARD PRICING ENGINE
 * Calculates complete order cost: material + transport + labour + food + GST
 */

const prisma = require('../config/db');
const mapsService = require('./maps');

/**
 * Main entry point — calculates full order price breakdown
 * @param {Array} items          [{productId, quantity}]
 * @param {Object} delivery      {lat, lng, pincode}
 * @param {Object} options       {includeLabour, includeLabourFood, labourOverride}
 * @returns {Object} Full price breakdown
 */
async function calculateOrderPrice(items, delivery, options = {}) {
  const [materialResult, labourSettings, gstRate] = await Promise.all([
    calculateMaterialCost(items),
    prisma.labourSettings.findFirst(),
    getConfigValue('GST_RATE', 18),
  ]);

  const { materialCost, productDetails, totalWeight } = materialResult;

  // Select vehicle based on total weight
  const vehicle = await selectVehicle(totalWeight);

  // Calculate transport cost
  const transportResult = await calculateTransportCost(delivery, vehicle);
  const { transportCost, distanceKm, zoneId, zoneName } = transportResult;

  // Calculate labour cost
  const totalBricks = getTotalBricks(productDetails);
  const labourResult = options.includeLabour
    ? calculateLabourCost(totalBricks, labourSettings)
    : { labourCost: 0, labourCount: 0 };

  // Labour food cost
  const labourFoodCost = (options.includeLabourFood && options.includeLabour)
    ? labourResult.labourCount * (labourSettings?.foodChargePerPerson ?? 150)
    : 0;

  const subtotal = materialCost + transportCost + labourResult.labourCost + labourFoodCost;
  // Guard against NaN from bad geocoding — should never happen after maps.js fix
  const safeMaterial   = isNaN(materialCost) ? 0 : materialCost;
  const safeTransport  = isNaN(transportCost) ? 0 : transportCost;
  const safeLabour     = isNaN(labourResult.labourCost) ? 0 : labourResult.labourCost;
  const safeFood       = isNaN(labourFoodCost) ? 0 : labourFoodCost;
  const safeSubtotal   = safeMaterial + safeTransport + safeLabour + safeFood;
  const gstAmount = parseFloat(((safeSubtotal * gstRate) / 100).toFixed(2));
  const totalAmount = parseFloat((safeSubtotal + gstAmount).toFixed(2));

  return {
    materialCost: round(safeMaterial),
    transportCost: round(safeTransport),
    labourCost: round(safeLabour),
    labourFoodCost: round(safeFood),
    gstRate,
    gstAmount,
    totalAmount,
    labourCount: labourResult.labourCount,
    distanceKm,
    zoneId,
    zoneName,
    vehicleType: vehicle?.name ?? 'Standard',
    vehicleTypeId: vehicle?.id,
    productDetails,
    breakdown: {
      material: `₹${round(safeMaterial)}`,
      transport: `₹${round(safeTransport)} (${distanceKm ? distanceKm.toFixed(1) + ' km' : zoneName})`,
      labour: options.includeLabour ? `₹${round(safeLabour)} (${labourResult.labourCount} labourers)` : 'Not included',
      food: options.includeLabourFood ? `₹${round(safeFood)}` : 'Not included',
      gst: `₹${gstAmount} (${gstRate}%)`,
      total: `₹${totalAmount}`,
    },
  };
}

/**
 * Step 1: Material cost with tiered pricing
 */
async function calculateMaterialCost(items) {
  let materialCost = 0;
  let totalWeight = 0;
  const productDetails = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { pricingTiers: { orderBy: { minQty: 'asc' } } },
    });

    if (!product) throw new Error(`Product not found: ${item.productId}`);

    const unitPrice = getTieredPrice(product.pricingTiers, product.basePrice, item.quantity);
    const subtotal = unitPrice * item.quantity;
    const weight = product.weight * item.quantity;

    materialCost += subtotal;
    totalWeight += weight;
    productDetails.push({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantity: item.quantity,
      unitPrice,
      subtotal,
      weight,
      isBrick: product.unit === 'brick',
    });
  }

  return { materialCost, totalWeight, productDetails };
}

/**
 * Tiered pricing lookup
 */
function getTieredPrice(tiers, basePrice, quantity) {
  if (!tiers?.length) return basePrice;
  const applicableTier = tiers
    .filter(t => quantity >= t.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0];
  return applicableTier ? applicableTier.pricePerUnit : basePrice;
}

/**
 * Step 2: Transport cost
 */
async function calculateTransportCost(delivery, vehicle) {
  // 1. Check if delivery location is in a fixed-price zone
  const zone = await findMatchingZone(delivery.pincode, delivery.lat, delivery.lng);

  if (zone) {
    return {
      transportCost: zone.flatCharge,
      distanceKm: null,
      zoneId: zone.id,
      zoneName: zone.name,
    };
  }

  // 2. Not in fixed zone → calculate per-km rate
  if (!delivery.lat || !delivery.lng) {
    // Try geocoding the pincode
    const coords = await mapsService.geocodePincode(delivery.pincode);
    if (coords) {
      delivery.lat = coords.lat;
      delivery.lng = coords.lng;
    } else {
      throw new Error('Could not determine delivery location. Please enter a complete address.');
    }
  }

  const distanceKm = await mapsService.getDistanceKm(
    { lat: parseFloat(process.env.COMPANY_LAT), lng: parseFloat(process.env.COMPANY_LNG) },
    { lat: delivery.lat, lng: delivery.lng }
  );

  const perKmPricing = vehicle
    ? await prisma.perKmPricing.findFirst({ where: { vehicleTypeId: vehicle.id } })
    : null;

  const ratePerKm = perKmPricing?.ratePerKm ?? 15;
  const baseFare = perKmPricing?.baseFare ?? 500;

  const transportCost = baseFare + (distanceKm * ratePerKm);

  return { transportCost, distanceKm, zoneId: null, zoneName: 'Per-KM Rate' };
}

/**
 * Find matching delivery zone for pincode/coordinates
 */
async function findMatchingZone(pincode, lat, lng) {
  const zones = await prisma.deliveryZone.findMany({ where: { isActive: true } });

  for (const zone of zones) {
    if (zone.type === 'pincode' && zone.pincodes.includes(pincode)) return zone;

    if (zone.type === 'radius' && lat && lng && zone.centerLat && zone.centerLng) {
      const dist = haversineDistance(lat, lng, zone.centerLat, zone.centerLng);
      if (dist <= zone.radiusKm) return zone;
    }

    if (zone.type === 'polygon' && lat && lng && zone.polygonPoints) {
      if (pointInPolygon({ lat, lng }, zone.polygonPoints)) return zone;
    }
  }

  return null;
}

/**
 * Step 3: Labour cost
 */
function calculateLabourCost(totalBricks, settings) {
  if (!totalBricks || !settings) return { labourCost: 0, labourCount: 0 };

  const ratePerThousand = settings.ratePerThousand ?? 200;
  const minimumCount = settings.minimumLabourCount ?? 2;
  const bricksPerLabourer = settings.bricksPerLabourer ?? 1000;

  const labourCount = Math.max(minimumCount, Math.ceil(totalBricks / bricksPerLabourer));
  const labourCost = Math.ceil(totalBricks / 1000) * ratePerThousand;

  return { labourCost, labourCount };
}

/**
 * Select appropriate vehicle type based on total weight
 */
async function selectVehicle(totalWeightKg) {
  const vehicles = await prisma.vehicleType.findMany({
    where: { isActive: true },
    orderBy: { maxWeightKg: 'asc' },
  });
  return vehicles.find(v => v.maxWeightKg >= totalWeightKg) ?? vehicles[vehicles.length - 1];
}

/**
 * Helper: count total bricks across order items
 */
function getTotalBricks(productDetails) {
  return productDetails
    .filter(p => p.isBrick)
    .reduce((sum, p) => sum + p.quantity, 0);
}

/**
 * Helper: Haversine distance in km
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * Math.PI / 180; }

/**
 * Helper: Ray-casting point-in-polygon
 */
function pointInPolygon(point, polygon) {
  let inside = false;
  const x = point.lng, y = point.lat;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

async function getConfigValue(key, defaultValue) {
  const config = await prisma.systemConfig.findUnique({ where: { key } });
  return config ? parseFloat(config.value) : defaultValue;
}

function round(n) { return Math.round(n * 100) / 100; }

module.exports = { calculateOrderPrice, calculateMaterialCost, calculateTransportCost };
