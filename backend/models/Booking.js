const mongoose = require('mongoose');
const { SEAT_CATEGORIES } = require('../utils/constants');

const CATEGORY_KEYS = SEAT_CATEGORIES.map((c) => c.key);

const bookingSchema = new mongoose.Schema({
  category: { type: String, required: true, enum: CATEGORY_KEYS },
  planKey: { type: String, required: true },
  seatCount: { type: Number, default: 1 },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  date: { type: String, required: true }, // stored as YYYY-MM-DD
  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true }, // HH:mm
  guests: { type: Number, default: 0 },
  amount: { type: Number, required: true }, // rupees
  currency: { type: String, default: 'INR' },
  paymentStatus: { type: String, enum: ['paid'], default: 'paid' },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, required: true },
  razorpaySignature: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
