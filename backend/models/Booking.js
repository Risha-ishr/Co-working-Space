const mongoose = require('mongoose');
const { SEAT_CATEGORIES } = require('../utils/constants');

const CATEGORY_KEYS = SEAT_CATEGORIES.map((c) => c.key);

const bookingSchema = new mongoose.Schema({
  category: { type: String, required: true, enum: CATEGORY_KEYS },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  date: { type: String, required: true }, // stored as YYYY-MM-DD
  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true }, // HH:mm
  guests: { type: Number, default: 0 },
  additionalSeat: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
