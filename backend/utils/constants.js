const SEAT_CATEGORIES = [
  {
    key: 'common-area',
    name: '4-Seater Desk - Non View',
    capacity: 4,
    smalldescription: '4 seats facing each other.',
    description: 'A quiet, professional shared workspace designed for focused work. Ideal for consultants, remote professionals and small teams who need a productive desk without the distractions of a large coworking floor.',
  },
  {
    key: 'individual-desk',
    name: 'Individual Window View',
    capacity: 2,
    smalldescription: 'A private desk by the window, just for you.',
    description: 'Your own dedicated workspace with a window view, giving you privacy, natural light and a focused environment. Ideal for long work sessions, confidential calls and professionals who prefer working independently.',
  },
  {
    key: 'two-seater-desk',
    name: '2-Seater Window View',
    capacity: 4,
    smalldescription: 'Two desks by the window, with room to spread out.',
    description: 'Enjoy a more relaxed work setting with natural light and a window-side view.With a wall behind for complete privacy. Perfect for professionals looking for a quieter, comfortable workspace with a little more openness and visual breathing room.Enjoy quiet work along side a walking passage, a glimpse of international business news, an in house coffee/snack station.'
  },
  {
    key: 'manager-cabin',
    name: 'Solo Corner Desk',
    capacity: 3,
    smalldescription: 'A quiet corner cabin for focused, private work.',
    description: 'Our most private and exclusive workspace, tucked into a quiet corner for maximum focus. Designed for deep work, important calls, creative thinking and anyone who values personal space over the energy of a busy coworking environment.'
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
