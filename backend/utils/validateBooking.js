const Booking = require('../models/Booking');
const {
  OPENING_TIME,
  CLOSING_TIME,
  BUFFER_MINUTES,
  MAX_CABIN_GUESTS,
} = require('./constants');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Validates static booking input (not availability). Returns an error string, or null if valid.
function validateFields({ category, name, email, date, startTime, endTime, guests }, categoryDoc) {
  if (!name || !name.trim()) return 'Name is required.';
  if (!email || !EMAIL_RE.test(email)) return 'A valid email is required.';
  if (!categoryDoc) return 'Unknown seat category.';
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'A valid date is required.';
  if (date < todayStr()) return 'Date must be today or later.';
  if (!startTime || !endTime || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    return 'Start and end time are required.';
  }
  if (toMinutes(startTime) < toMinutes(OPENING_TIME) || toMinutes(endTime) > toMinutes(CLOSING_TIME)) {
    return `Bookings are only allowed between ${OPENING_TIME} and ${CLOSING_TIME}.`;
  }
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    return 'End time must be after start time.';
  }
  if (category === 'manager-cabin') {
    const g = Number(guests) || 0;
    if (g < 0 || g > MAX_CABIN_GUESTS) {
      return `Manager Cabin allows up to ${MAX_CABIN_GUESTS} guests.`;
    }
  }
  return null;
}

function occupancyOf(booking) {
  const seats = booking.seatCount || 1;
  return booking.category === 'manager-cabin' ? seats + (booking.guests || 0) : seats;
}

// Checks remaining capacity for a category/date/time window, applying a buffer after each
// existing booking's end time so a seat can't be rebooked immediately after it frees up.
async function checkAvailability({ category, date, startTime, endTime }, categoryDoc) {
  const newStart = toMinutes(startTime);
  const newEnd = toMinutes(endTime);

  const existing = await Booking.find({ category, date });

  let occupied = 0;
  for (const b of existing) {
    const blockedStart = toMinutes(b.startTime);
    const blockedEnd = toMinutes(b.endTime) + BUFFER_MINUTES;
    const overlaps = newStart < blockedEnd && newEnd > blockedStart;
    if (overlaps) occupied += occupancyOf(b);
  }

  const remaining = categoryDoc.capacity - occupied;
  return { remaining, capacity: categoryDoc.capacity };
}

module.exports = {
  toMinutes,
  todayStr,
  validateFields,
  occupancyOf,
  checkAvailability,
};
