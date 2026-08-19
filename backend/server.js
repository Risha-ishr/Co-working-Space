require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seatCategoriesRouter = require('./routes/seatCategories');
const bookingsRouter = require('./routes/bookings');
const paymentsRouter = require('./routes/payments');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/seat-categories', seatCategoriesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
