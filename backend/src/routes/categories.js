// src/routes/categories.js
const express = require('express');
const prisma = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  res.json(categories);
});

router.post('/', authenticate, requireAdmin('SUPER_ADMIN', 'INVENTORY_MANAGER'), async (req, res) => {
  try {
    const cat = await prisma.category.create({ data: req.body });
    res.status(201).json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireAdmin('SUPER_ADMIN', 'INVENTORY_MANAGER'), async (req, res) => {
  try {
    const cat = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
    res.json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireAdmin('SUPER_ADMIN'), async (req, res) => {
  await prisma.category.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true });
});

module.exports = router;
