const mongoose = require('mongoose');

const seatCategorySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  description: { type: String, default: '' },
});

module.exports = mongoose.model('SeatCategory', seatCategorySchema);
