// src/routes/payments.js
const express = require('express');
const prisma = require('../config/db');
const { authenticate, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// POST /api/payments/create-order — initiate Razorpay order
router.post('/create-order', optionalAuth, async (req, res) => {
  try {
    // Dynamic import only when keys are set
    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(503).json({ error: 'Payment gateway not configured' });
    }
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const rzOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // paise
      currency: 'INR',
      receipt: order.orderNumber,
    });

    res.json({ rzOrderId: rzOrder.id, amount: rzOrder.amount, currency: rzOrder.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/verify — verify Razorpay payment
router.post('/verify', optionalAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID', paymentId: razorpay_payment_id, status: 'CONFIRMED' },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
