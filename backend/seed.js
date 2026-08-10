require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const SeatCategory = require('./models/SeatCategory');
const { SEAT_CATEGORIES } = require('./utils/constants');

async function seed() {
  await connectDB();
  for (const cat of SEAT_CATEGORIES) {
    await SeatCategory.findOneAndUpdate({ key: cat.key }, cat, { upsert: true, new: true });
    console.log(`Seeded: ${cat.name} (capacity ${cat.capacity})`);
  }
  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
