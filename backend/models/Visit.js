const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  date: { type: String, required: true }, // stored as YYYY-MM-DD
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Visit', visitSchema);
