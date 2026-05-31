// src/utils/seed.js
require('dotenv').config({ path: '../../.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminHash = await bcrypt.hash('Admin@123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@brickyard.com' },
    update: {},
    create: { name: 'Super Admin', email: 'admin@brickyard.com', passwordHash: adminHash, role: 'SUPER_ADMIN' },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'solid-bricks' }, update: {}, create: { name: 'Solid Bricks', slug: 'solid-bricks', description: 'Standard solid clay and fly ash bricks', sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'hollow-blocks' }, update: {}, create: { name: 'Hollow Blocks', slug: 'hollow-blocks', description: 'Lightweight hollow concrete blocks', sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'cement-bags' }, update: {}, create: { name: 'Cement Bags', slug: 'cement-bags', description: 'OPC and PPC cement bags', sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: 'sand-aggregates' }, update: {}, create: { name: 'Sand & Aggregates', slug: 'sand-aggregates', description: 'River sand, M-sand, blue metal aggregates', sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: 'pavers' }, update: {}, create: { name: 'Pavers & Tiles', slug: 'pavers', description: 'Interlocking pavers, kerb stones', sortOrder: 5 } }),
  ]);

  const [solidBricks, hollowBlocks, cementBags, sandAgg] = categories;

  // Products
  await prisma.product.upsert({
    where: { slug: 'standard-red-brick' },
    update: {},
    create: {
      categoryId: solidBricks.id, name: 'Standard Red Brick', slug: 'standard-red-brick',
      description: 'Traditional red clay brick, 9"x4.5"x3", high compressive strength',
      unit: 'brick', basePrice: 8.5, weight: 3.2, stockStatus: 'IN_STOCK', isFeatured: true, sortOrder: 1,
      specifications: { dimensions: '228x114x76 mm', weight: '3.2 kg', strength: '7.5 N/mm²', waterAbsorption: '< 20%' },
      pricingTiers: {
        create: [
          { minQty: 1, maxQty: 1000, pricePerUnit: 8.5 },
          { minQty: 1001, maxQty: 5000, pricePerUnit: 7.8 },
          { minQty: 5001, maxQty: null, pricePerUnit: 7.2 },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: 'fly-ash-brick' },
    update: {},
    create: {
      categoryId: solidBricks.id, name: 'Fly Ash Brick', slug: 'fly-ash-brick',
      description: 'Eco-friendly fly ash brick, lighter and stronger',
      unit: 'brick', basePrice: 7.5, weight: 2.8, stockStatus: 'IN_STOCK', sortOrder: 2,
      pricingTiers: {
        create: [
          { minQty: 1, maxQty: 1000, pricePerUnit: 7.5 },
          { minQty: 1001, maxQty: null, pricePerUnit: 6.8 },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: 'hollow-block-6inch' },
    update: {},
    create: {
      categoryId: hollowBlocks.id, name: 'Hollow Block 6"', slug: 'hollow-block-6inch',
      description: 'Standard 6 inch hollow concrete block',
      unit: 'brick', basePrice: 32, weight: 10, stockStatus: 'IN_STOCK', sortOrder: 1,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'opc-53-cement-bag' },
    update: {},
    create: {
      categoryId: cementBags.id, name: 'OPC 53 Grade Cement (50 kg)', slug: 'opc-53-cement-bag',
      description: 'Ordinary Portland Cement 53 Grade, 50 kg bag',
      unit: 'bag', basePrice: 380, weight: 50, stockStatus: 'IN_STOCK', sortOrder: 1,
    },
  });

  // Vehicle types
  const vehicles = await Promise.all([
    prisma.vehicleType.upsert({ where: { id: 'vt-tata-ace' }, update: {}, create: { id: 'vt-tata-ace', name: 'Tata Ace (Mini Truck)', maxWeightKg: 750 } }),
    prisma.vehicleType.upsert({ where: { id: 'vt-6-wheeler' }, update: {}, create: { id: 'vt-6-wheeler', name: '6-Wheeler Truck', maxWeightKg: 10000 } }),
    prisma.vehicleType.upsert({ where: { id: 'vt-10-wheeler' }, update: {}, create: { id: 'vt-10-wheeler', name: '10-Wheeler Truck', maxWeightKg: 25000 } }),
  ]);

  // Per-km pricing
  await prisma.perKmPricing.deleteMany({});
  await prisma.perKmPricing.createMany({
    data: [
      { vehicleTypeId: 'vt-tata-ace', ratePerKm: 12, baseFare: 300 },
      { vehicleTypeId: 'vt-6-wheeler', ratePerKm: 18, baseFare: 700 },
      { vehicleTypeId: 'vt-10-wheeler', ratePerKm: 25, baseFare: 1200 },
    ],
  });

  // Delivery zones
  await prisma.deliveryZone.upsert({
    where: { id: 'zone-local' },
    update: {},
    create: {
      id: 'zone-local', name: 'Madanapalle Town', type: 'pincode',
      pincodes: ['517325', '517326', '517327'], flatCharge: 500, sortOrder: 1,
    },
  });

  await prisma.deliveryZone.upsert({
    where: { id: 'zone-nearby' },
    update: {},
    create: {
      id: 'zone-nearby', name: 'Nearby Towns (20 km)', type: 'radius',
      centerLat: 13.5504, centerLng: 78.5027, radiusKm: 20, flatCharge: 1200, sortOrder: 2,
    },
  });

  // Labour settings
  const ls = await prisma.labourSettings.findFirst();
  if (!ls) {
    await prisma.labourSettings.create({
      data: { ratePerThousand: 200, minimumLabourCount: 2, bricksPerLabourer: 1000, foodChargePerPerson: 150, overtimeRatePerHr: 100 },
    });
  }

  // System config
  const configs = [
    { key: 'GST_RATE', value: '18' },
    { key: 'COMPANY_NAME', value: 'BrickYard Pro' },
    { key: 'COMPANY_ADDRESS', value: '123 Industrial Area, Madanapalle, AP 517325' },
    { key: 'COMPANY_PHONE', value: '+91 9999999999' },
    { key: 'WHATSAPP_NUMBER', value: '919999999999' },
    { key: 'INVOICE_PREFIX', value: 'BY' },
  ];

  for (const c of configs) {
    await prisma.systemConfig.upsert({ where: { key: c.key }, update: { value: c.value }, create: c });
  }

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin login: admin@brickyard.com / Admin@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
