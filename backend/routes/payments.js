const express = require('express');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Booking = require('../models/Booking');
const SeatCategory = require('../models/SeatCategory');
const { validateFields, checkAvailability, occupancyOf } = require('../utils/validateBooking');
const { computeAmount } = require('../utils/pricing');

const router = express.Router();

// Creates a Razorpay order for a not-yet-existing booking. The booking itself is only
// created once payment is verified (see POST /verify), so unpaid slots never hold capacity.
router.post('/order', async (req, res) => {
  const { category, planKey, seatCount, name, email, date, startTime, endTime, guests } = req.body;

  const categoryDoc = await SeatCategory.findOne({ key: category });
  const fieldError = validateFields({ category, name, email, date, startTime, endTime, guests }, categoryDoc);
  if (fieldError) return res.status(400).json({ error: fieldError });

  const count = Number(seatCount) || 1;
  if (!Number.isInteger(count) || count < 1 || count > categoryDoc.capacity) {
    return res.status(400).json({ error: 'Invalid seat count.' });
  }

  const amount = computeAmount(planKey, category, count);
  if (!amount) return res.status(400).json({ error: 'Invalid pricing plan for this seat category.' });

  const candidate = { category, guests: Number(guests) || 0, seatCount: count };
  const { remaining } = await checkAvailability({ category, date, startTime, endTime }, categoryDoc);
  if (remaining < occupancyOf(candidate)) {
    return res.status(409).json({ error: 'Selected time slot is full. Please choose another time.' });
  }

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt: `cw_${Date.now()}`,
    notes: {
      category,
      planKey,
      seatCount: String(count),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      date,
      startTime,
      endTime,
      guests: String(Number(guests) || 0),
    },
  });

  res.json({ orderId: order.id, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID });
});

// Verifies the Razorpay signature, re-checks availability to guard against a race between
// order creation and payment completion, then creates the paid booking.
router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields.' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed.' });
  }

  const existing = await Booking.findOne({ razorpayOrderId: razorpay_order_id });
  if (existing) return res.status(200).json(existing);

  const order = await razorpay.orders.fetch(razorpay_order_id);
  const notes = order.notes || {};
  const { category, planKey, seatCount, name, email, date, startTime, endTime, guests } = notes;

  const categoryDoc = await SeatCategory.findOne({ key: category });
  const count = Number(seatCount) || 1;
  const candidate = { category, guests: Number(guests) || 0, seatCount: count };
  const { remaining } = await checkAvailability({ category, date, startTime, endTime }, categoryDoc);
  if (remaining < occupancyOf(candidate)) {
    return res.status(409).json({
      error: 'Payment succeeded but the slot filled up in the meantime. Please contact support for a refund.',
    });
  }

  const booking = await Booking.create({
    category,
    planKey,
    seatCount: count,
    name,
    email,
    date,
    startTime,
    endTime,
    guests: category === 'manager-cabin' ? Number(guests) || 0 : 0,
    amount: Number(order.amount) / 100,
    currency: order.currency,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  res.status(201).json(booking);
});

module.exports = router;
