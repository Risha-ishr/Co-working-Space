// Mirrors frontend/src/pricing/*.js — keep rates in sync on both sides.
const PRICING_PLANS = {
  hourly: {
    name: 'Hourly',
    basis: '1 hour access',
    rates: {
      'common-area': 199,
      'two-seater-desk': 229,
      'individual-desk': 249,
      'manager-cabin': 269,
    },
  },
  'three-hours': {
    name: '3 Hours',
    basis: '3 hours access',
    rates: {
      'common-area': 499,
      'two-seater-desk': 574,
      'individual-desk': 624,
      'manager-cabin': 674,
    },
  },
  'six-hours': {
    name: '6 Hours',
    basis: '6 hours access',
    rates: {
      'common-area': 799,
      'two-seater-desk': 919,
      'individual-desk': 999,
      'manager-cabin': 1079,
    },
  },
  'full-day': {
    name: 'Full Day',
    basis: '1 working day access',
    rates: {
      'common-area': 999,
      'two-seater-desk': 1149,
      'individual-desk': 1249,
      'manager-cabin': 1349,
    },
  },
  weekly: {
    name: 'Weekly',
    basis: '5 working days',
    rates: {
      'common-area': 4444,
      'two-seater-desk': 5111,
      'individual-desk': 5555,
      'manager-cabin': 5999,
    },
  },
  'monthly-22': {
    name: 'Monthly',
    basis: '22 working days',
    rates: {
      'common-area': 14444,
      'two-seater-desk': 16611,
      'individual-desk': 18055,
      'manager-cabin': 19499,
    },
  },
  'monthly-26': {
    name: 'Monthly',
    basis: '26 working days',
    rates: {
      'common-area': 16666,
      'two-seater-desk': 19166,
      'individual-desk': 20833,
      'manager-cabin': 22499,
    },
  },
  'quarterly-5': {
    name: 'Quarterly',
    basis: '5 working days/week',
    rates: {
      'common-area': 57776,
      'two-seater-desk': 66442,
      'individual-desk': 72220,
      'manager-cabin': 77998,
    },
  },
  'quarterly-6': {
    name: 'Quarterly',
    basis: '6 working days/week',
    rates: {
      'common-area': 66664,
      'two-seater-desk': 76664,
      'individual-desk': 83330,
      'manager-cabin': 89996,
    },
  },
};

// Returns the amount in rupees, or null if the plan/category combination is invalid.
function computeAmount(planKey, categoryKey, seatCount) {
  const plan = PRICING_PLANS[planKey];
  if (!plan) return null;
  const rate = plan.rates[categoryKey];
  if (!rate) return null;
  return rate * seatCount;
}

module.exports = { PRICING_PLANS, computeAmount };
