// src/routes/admin.js
const express = require('express');
const prisma = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/admin/dashboard — KPI summary
router.get('/dashboard', authenticate, requireAdmin(), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      pendingOrders,
      totalCustomers,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
      prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    res.json({
      kpis: {
        totalOrders,
        todayOrders,
        totalRevenue: totalRevenue._sum.totalAmount ?? 0,
        pendingOrders,
        totalCustomers,
      },
      recentOrders,
      ordersByStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/reports/sales?from=&to=
router.get('/reports/sales', authenticate, requireAdmin(), async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 86400000);
    const to = req.query.to ? new Date(req.query.to) : new Date();

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: {
        createdAt: true,
        totalAmount: true,
        materialCost: true,
        transportCost: true,
        labourCost: true,
        status: true,
        paymentStatus: true,
      },
    });

    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const paidRevenue = orders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + o.totalAmount, 0);

    res.json({ orders, totalRevenue, paidRevenue, orderCount: orders.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/customers
router.get('/customers', authenticate, requireAdmin(), async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        _count: { select: { orders: true } },
        orders: { select: { totalAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers.map(c => ({
      ...c,
      totalBusiness: c.orders.reduce((s, o) => s + o.totalAmount, 0),
      orders: undefined,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
