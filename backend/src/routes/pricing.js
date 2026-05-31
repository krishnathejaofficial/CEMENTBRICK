// src/routes/pricing.js
const express = require('express');
const { calculateOrderPrice } = require('../services/pricing');

const router = express.Router();

/**
 * POST /api/pricing/estimate
 * Body: { items: [{productId, quantity}], delivery: {lat, lng, pincode}, options: {includeLabour, includeLabourFood} }
 */
router.post('/estimate', async (req, res) => {
  try {
    const { items, delivery, options = {} } = req.body;

    if (!items?.length) return res.status(400).json({ error: 'At least one item required' });
    if (!delivery?.pincode && (!delivery?.lat || !delivery?.lng)) {
      return res.status(400).json({ error: 'Delivery pincode or coordinates required' });
    }

    const result = await calculateOrderPrice(items, delivery, options);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
