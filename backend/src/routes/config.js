// src/routes/config.js
const express = require('express');
const prisma = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/config/public — public config (GST rate, company info etc)
router.get('/public', async (req, res) => {
  const publicKeys = ['GST_RATE', 'COMPANY_NAME', 'COMPANY_PHONE', 'COMPANY_ADDRESS', 'WHATSAPP_NUMBER'];
  const configs = await prisma.systemConfig.findMany({ where: { key: { in: publicKeys } } });
  const result = {};
  configs.forEach(c => { result[c.key] = c.value; });
  res.json(result);
});

// GET /api/config — all config (admin)
router.get('/', authenticate, requireAdmin(), async (req, res) => {
  const configs = await prisma.systemConfig.findMany();
  const result = {};
  configs.forEach(c => { result[c.key] = c.value; });
  res.json(result);
});

// PUT /api/config — bulk update
router.put('/', authenticate, requireAdmin('SUPER_ADMIN', 'ACCOUNTS'), async (req, res) => {
  try {
    const updates = Object.entries(req.body).map(([key, value]) =>
      prisma.systemConfig.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );
    await Promise.all(updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
