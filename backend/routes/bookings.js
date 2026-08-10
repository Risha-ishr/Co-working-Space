const express = require('express');
const Booking = require('../models/Booking');
const SeatCategory = require('../models/SeatCategory');
const { validateFields, checkAvailability, occupancyOf } = require('../utils/validateBooking');

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
  const { category, name, email, date, startTime, endTime, guests } = req.body;

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
  });

  res.status(201).json(booking);
});

module.exports = router;
