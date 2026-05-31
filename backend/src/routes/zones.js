// src/routes/zones.js
const express = require('express');
const prisma = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, requireAdmin(), async (req, res) => {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json(zones);
});

router.post('/', authenticate, requireAdmin('SUPER_ADMIN', 'LOGISTICS_MANAGER'), async (req, res) => {
  try {
    const { id, createdAt, updatedAt, ...data } = req.body;
    const zone = await prisma.deliveryZone.create({ data });
    res.status(201).json(zone);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireAdmin('SUPER_ADMIN', 'LOGISTICS_MANAGER'), async (req, res) => {
  try {
    const { id, createdAt, updatedAt, ...data } = req.body;
    const zone = await prisma.deliveryZone.update({ where: { id: req.params.id }, data });
    res.json(zone);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireAdmin('SUPER_ADMIN'), async (req, res) => {
  await prisma.deliveryZone.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
