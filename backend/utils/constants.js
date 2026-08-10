const SEAT_CATEGORIES = [
  {
    key: 'common-area',
    name: 'Common Area',
    capacity: 4,
    description: 'Shared open seating area, great for casual work and networking.',
  },
  {
    key: 'individual-desk',
    name: 'Individual Desk',
    capacity: 2,
    description: 'Dedicated single-person desks for focused, quiet work.',
  },
  {
    key: 'two-seater-desk',
    name: '2-Seater Desk',
    capacity: 4,
    description: 'Shared desks for two, ideal for pair work or partners.',
  },
  {
    key: 'manager-cabin',
    name: 'Manager Cabin',
    capacity: 3,
    description: 'Private cabin with 1 manager desk and seating for up to 2 guests.',
  },
];

const OPENING_TIME = '08:00';
const CLOSING_TIME = '19:00';
const BUFFER_MINUTES = 30;
const MAX_CABIN_GUESTS = 2;

module.exports = {
  SEAT_CATEGORIES,
  OPENING_TIME,
  CLOSING_TIME,
  BUFFER_MINUTES,
  MAX_CABIN_GUESTS,
};
