const express = require('express');
const Visit = require('../models/Visit');
const { sendVisitNotification } = require('../utils/mailer');

const router = express.Router();

router.get('/', async (req, res) => {
  const visits = await Visit.find().sort({ createdAt: -1 });
  res.json(visits);
});

router.post('/', async (req, res) => {
  const { name, date } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' });
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'A valid date is required.' });
  }

  const visit = await Visit.create({ name: name.trim(), date });

  try {
    await sendVisitNotification(visit);
  } catch (err) {
    console.error('Failed to send visit notification email:', err.message);
  }

  res.status(201).json(visit);
});

module.exports = router;
