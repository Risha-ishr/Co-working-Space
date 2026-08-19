const express = require('express');
const SeatCategory = require('../models/SeatCategory');
const { validateFields, checkAvailability } = require('../utils/validateBooking');

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

module.exports = router;
