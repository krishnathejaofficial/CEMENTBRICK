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

// POST /api/orders — create order
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, delivery, options, customerName, customerPhone, customerEmail, deliveryDate, notes } = req.body;

    // Recalculate price server-side (never trust client price)
    const pricing = await calculateOrderPrice(items, delivery, options);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user?.id,
        customerName,
        customerPhone,
        customerEmail,
        deliveryLine1: delivery.line1 || '',
        deliveryLine2: delivery.line2,
        deliveryCity: delivery.city || '',
        deliveryPincode: delivery.pincode,
        deliveryLat: delivery.lat,
        deliveryLng: delivery.lng,
        materialCost: pricing.materialCost,
        transportCost: pricing.transportCost,
        labourCost: pricing.labourCost,
        labourFoodCost: pricing.labourFoodCost,
        gstAmount: pricing.gstAmount,
        totalAmount: pricing.totalAmount,
        vehicleTypeId: pricing.vehicleTypeId,
        labourCount: pricing.labourCount,
        includeLabourFood: options?.includeLabourFood ?? false,
        deliveryDistanceKm: pricing.distanceKm,
        zoneId: pricing.zoneId,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes,
        items: {
          create: pricing.productDetails.map(p => ({
            productId: p.productId,
            productName: p.name,
            unit: p.unit,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            subtotal: p.subtotal,
          })),
        },
        statusHistory: {
          create: { status: 'PENDING', note: 'Order placed' },
        },
      },
      include: { items: true, vehicleType: true },
    });

    res.status(201).json({ order, pricing });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders/my — customer's own orders
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

// GET /api/orders/:orderNumber — track by order number (public)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // Return limited info publicly
    const { customerEmail, deliveryLat, deliveryLng, ...safe } = order;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — admin: all orders
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
      prisma.order.findMany({ where, include: { items: true, vehicleType: true }, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status — admin update status
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
