// src/routes/vehicles.js
const express = require('express');
const prisma = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  const vehicles = await prisma.vehicleType.findMany({ where: { isActive: true }, include: { perKmPricing: true } });
  res.json(vehicles);
});

router.post('/', authenticate, requireAdmin('SUPER_ADMIN', 'LOGISTICS_MANAGER'), async (req, res) => {
  try {
    const { perKmPricing, id, createdAt, ...vehicleData } = req.body;
    const vehicle = await prisma.vehicleType.create({
      data: { ...vehicleData, perKmPricing: perKmPricing ? { create: perKmPricing } : undefined },
      include: { perKmPricing: true },
    });
    res.status(201).json(vehicle);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireAdmin('SUPER_ADMIN', 'LOGISTICS_MANAGER'), async (req, res) => {
  try {
    const { perKmPricing, id, createdAt, ...vehicleData } = req.body;
    await prisma.perKmPricing.deleteMany({ where: { vehicleTypeId: req.params.id } });
    const vehicle = await prisma.vehicleType.update({
      where: { id: req.params.id },
      data: { ...vehicleData, perKmPricing: perKmPricing ? { create: perKmPricing } : undefined },
      include: { perKmPricing: true },
    });
    res.json(vehicle);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
