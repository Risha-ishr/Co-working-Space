const express = require('express');
const Booking = require('../models/Booking');
const SeatCategory = require('../models/SeatCategory');
const { validateFields, checkAvailability, occupancyOf } = require('../utils/validateBooking');
const { findOrCreateClient, createInvoice } = require('../utils/freshbooks');

const router = express.Router();

router.get('/availability', async (req, res) => {
  const { category, date, startTime, endTime, guests } = req.query;

  const categoryDoc = await SeatCategory.findOne({ key: category });
  const fieldError = validateFields(
    { category, name: 'x', email: 'x@x.com', date, startTime, endTime, guests },
    categoryDoc
  );
  if (fieldError) return res.status(400).json({ error: fieldError });

  const { remaining, capacity } = await checkAvailability({ category, date, startTime, endTime }, categoryDoc);
  res.json({ available: remaining > 0, remaining: Math.max(remaining, 0), capacity });
});

router.post('/', async (req, res) => {
  const { category, name, email, date, startTime, endTime, guests, additionalSeat, planKey, planName, seatCount, amount } = req.body;

  const categoryDoc = await SeatCategory.findOne({ key: category });
  const fieldError = validateFields({ category, name, email, date, startTime, endTime, guests }, categoryDoc);
  if (fieldError) return res.status(400).json({ error: fieldError });

  const candidate = { category, guests: Number(guests) || 0 };
  const { remaining } = await checkAvailability({ category, date, startTime, endTime }, categoryDoc);
  if (remaining < occupancyOf(candidate)) {
    return res.status(409).json({ error: 'Selected time slot is full. Please choose another time.' });
  }

  const booking = await Booking.create({
    category,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    date,
    startTime,
    endTime,
    guests: category === 'manager-cabin' ? Number(guests) || 0 : 0,
    additionalSeat: Boolean(additionalSeat),
    planKey: planKey || '',
    planName: planName || '',
    seatCount: Number(seatCount) || 1,
    amount: Number(amount) || 0,
    paymentStatus: 'pending',
  });

  // Create FreshBooks invoice (non-blocking on failure so booking always saves)
  if (process.env.FRESHBOOKS_ACCOUNT_ID && Number(amount) > 0) {
    try {
      const clientId = await findOrCreateClient(name.trim(), email.trim().toLowerCase());
      const description = `${planName || planKey || 'Booking'} — ${categoryDoc.name} | ${date} ${startTime}–${endTime}`;
      const { invoiceId, paymentLink } = await createInvoice({
        clientId,
        description,
        amount: Number(amount),
        date,
      });
      await Booking.findByIdAndUpdate(booking._id, {
        freshbooksClientId: clientId,
        freshbooksInvoiceId: invoiceId,
        paymentLink,
      });
      return res.status(201).json({ ...booking.toObject(), freshbooksClientId: clientId, freshbooksInvoiceId: invoiceId, paymentLink });
    } catch (err) {
      console.error('FreshBooks invoice creation failed:', err.message);
      // Respond with the booking even if FreshBooks fails
    }
  }

  res.status(201).json(booking);
});

module.exports = router;
