// src/routes/orders.js
const express = require('express');
const prisma = require('../config/db');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { calculateOrderPrice } = require('../services/pricing');

const router = express.Router();

function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `BY-${year}-${rand}`;
}

function safeCoord(val, max) {
  const n = Number(val);
  return (val != null && isFinite(n) && Math.abs(n) <= max) ? n : null;
}

// POST /api/orders — create order (no login required)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      items, delivery, options,
      // Accept both naming conventions from frontend
      customerName: cn, name: n,
      customerPhone: cp, phone: p,
      customerEmail: ce, email: e,
      deliveryDate, notes,
    } = req.body;

    const customerName = cn || n || '';
    const customerPhone = cp || p || '';
    const customerEmail = ce || e || null;

    // Validate required fields
    if (!customerName?.trim()) return res.status(400).json({ error: 'Customer name is required' });
    if (!customerPhone?.trim()) return res.status(400).json({ error: 'Customer phone number is required' });
    if (!items?.length) return res.status(400).json({ error: 'At least one product item is required' });
    if (!delivery?.pincode) return res.status(400).json({ error: 'Delivery PIN code is required' });

    // Recalculate price server-side (never trust client price)
    const pricing = await calculateOrderPrice(items, delivery, options || {});

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        // Use Prisma relation connect syntax — avoids "Unknown argument userId" error
        ...(req.user?.id ? { user: { connect: { id: req.user.id } } } : {}),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail,
        deliveryLine1: delivery.line1 || '',
        deliveryLine2: delivery.line2 || null,
        deliveryCity: delivery.city || '',
        deliveryPincode: delivery.pincode,
        // Only store valid geographic coordinates
        deliveryLat: safeCoord(delivery.lat, 90),
        deliveryLng: safeCoord(delivery.lng, 180),
        materialCost: pricing.materialCost,
        transportCost: pricing.transportCost,
        labourCost: pricing.labourCost,
        labourFoodCost: pricing.labourFoodCost,
        gstAmount: pricing.gstAmount,
        totalAmount: pricing.totalAmount,
        vehicleTypeId: pricing.vehicleTypeId || null,
        labourCount: pricing.labourCount || 0,
        includeLabourFood: options?.includeLabourFood ?? false,
        deliveryDistanceKm: pricing.distanceKm || null,
        zoneId: pricing.zoneId || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes: notes || null,
        items: {
          create: pricing.productDetails.map(pd => ({
            productId: pd.productId,
            productName: pd.name,
            unit: pd.unit,
            quantity: pd.quantity,
            unitPrice: pd.unitPrice,
            subtotal: pd.subtotal,
          })),
        },
        statusHistory: {
          create: { status: 'PENDING', note: 'Order placed by customer' },
        },
      },
      include: { items: true, vehicleType: true },
    });

    res.status(201).json({ order, pricing });
  } catch (err) {
    console.error('Order creation error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders/my — customer's own orders (requires login)
router.get('/my', authenticate, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true, vehicleType: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/track/:orderNumber — public order tracking by number
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
    });
    if (!order) return res.status(404).json({ error: 'Order not found. Please check the order number.' });
    // Strip private fields before returning publicly
    const { customerEmail, deliveryLat, deliveryLng, userId, ...safe } = order;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — admin: list all orders with search & pagination
router.get('/', authenticate, requireAdmin(), async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerPhone: { contains: search } },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, vehicleType: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status — admin update order status
router.patch('/:id/status', authenticate, requireAdmin(), async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        statusHistory: { create: { status, note } },
      },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
