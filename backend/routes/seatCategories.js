const express = require('express');
const SeatCategory = require('../models/SeatCategory');

const router = express.Router();

router.get('/', async (req, res) => {
  const categories = await SeatCategory.find().sort({ key: 1 });
  res.json(categories);
});

module.exports = router;
