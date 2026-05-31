// src/routes/products.js
const express = require('express');
const prisma = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products — public catalog
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(featured === 'true' && { isFeatured: true }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, pricingTiers: true },
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:slug — single product
router.get('/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { category: true, pricingTiers: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — admin only
router.post('/', authenticate, requireAdmin('SUPER_ADMIN', 'INVENTORY_MANAGER'), async (req, res) => {
  try {
    const { pricingTiers, category, createdAt, updatedAt, id, ...data } = req.body;
    const product = await prisma.product.create({
      data: {
        ...data,
        pricingTiers: pricingTiers ? { create: pricingTiers } : undefined,
      },
      include: { pricingTiers: true },
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id — admin only
router.put('/:id', authenticate, requireAdmin('SUPER_ADMIN', 'INVENTORY_MANAGER'), async (req, res) => {
  try {
    const { pricingTiers, category, createdAt, updatedAt, id, ...data } = req.body;
    // Delete old tiers and recreate
    await prisma.pricingTier.deleteMany({ where: { productId: req.params.id } });

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...data,
        pricingTiers: pricingTiers ? { create: pricingTiers } : undefined,
      },
      include: { category: true, pricingTiers: true },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, requireAdmin('SUPER_ADMIN'), async (req, res) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
