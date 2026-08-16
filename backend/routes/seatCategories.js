const express = require('express');
const SeatCategory = require('../models/SeatCategory');

const router = express.Router();

const DISPLAY_ORDER = ['individual-desk', 'two-seater-desk', 'common-area', 'manager-cabin'];

router.get('/', async (req, res) => {
  const categories = await SeatCategory.find();
  categories.sort((a, b) => DISPLAY_ORDER.indexOf(a.key) - DISPLAY_ORDER.indexOf(b.key));
  res.json(categories);
});

module.exports = router;
