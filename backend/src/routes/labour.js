// src/routes/labour.js
const express = require('express');
const prisma = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, requireAdmin(), async (req, res) => {
  const settings = await prisma.labourSettings.findFirst();
  res.json(settings);
});

router.put('/', authenticate, requireAdmin('SUPER_ADMIN', 'LOGISTICS_MANAGER'), async (req, res) => {
  try {
    const { id, updatedAt, ...data } = req.body;
    const existing = await prisma.labourSettings.findFirst();
    const settings = existing
      ? await prisma.labourSettings.update({ where: { id: existing.id }, data })
      : await prisma.labourSettings.create({ data });
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
