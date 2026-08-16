import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client.js';
import PRICING_PLANS from '../pricing';

const todayStr = () => new Date().toISOString().slice(0, 10);

const LOREM_IPSUM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor ' +
  'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud ' +
  'exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

function hoursBetween(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const minutes = (eh * 60 + em) - (sh * 60 + sm);
  return minutes > 0 ? minutes / 60 : 0;
}

export default function BookingPage() {
  const { categoryKey } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    date: todayStr(),
    startTime: '',
    endTime: '',
    name: '',
    email: '',
    guests: 0,
  });

  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanKey, setSelectedPlanKey] = useState(PRICING_PLANS[0].key);
  const [seatCount, setSeatCount] = useState(1);

  useEffect(() => {
    client
      .get('/seat-categories')
      .then((res) => {
        const found = res.data.find((c) => c.key === categoryKey);
        if (found) setCategory(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [categoryKey]);

  useEffect(() => {
    if (!form.date || !form.startTime || !form.endTime) {
      setAvailability(null);
      return;
    }
    const timer = setTimeout(() => {
      setCheckingAvailability(true);
      client
        .get('/bookings/availability', {
          params: {
            category: categoryKey,
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            guests: form.guests,
          },
        })
        .then((res) => setAvailability(res.data))
        .catch((err) => {
          setAvailability(null);
          if (err.response?.data?.error) setSubmitError(err.response.data.error);
        })
        .finally(() => setCheckingAvailability(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [categoryKey, form.date, form.startTime, form.endTime, form.guests]);

  function updateField(field, value) {
    setSubmitError('');
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await client.post('/bookings', { category: categoryKey, ...form });
      navigate('/confirmation', { state: { booking: res.data, categoryName: category.name } });
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <div className="booking-page">
        <p className="error">Unknown seating category.</p>
        <Link to="/">Back to seating options</Link>
      </div>
    );
  }

  if (!category) return <p>Loading…</p>;

  const isCabin = category.key === 'manager-cabin';
  const canSubmit = availability?.available && !submitting;

  const selectedPlan = PRICING_PLANS.find((p) => p.key === selectedPlanKey) || PRICING_PLANS[0];
  const selectedRate = selectedPlan.rates[category.key] || 0;
  const bookedHours = hoursBetween(form.startTime, form.endTime);
  const estimatedPrice = Math.round(bookedHours * selectedRate * seatCount);

  return (
    <div className="booking-page">
      <Link to="/" className="back-link">
        ← Back to seating options
      </Link>
      <h2>Book: {category.name}</h2>

      <p className="seat-detail__desc">{LOREM_IPSUM}</p>

      <img src="/hero-office.png" alt={category.name} className="seat-detail__image" />

      <div className="pricing-plans">
        {PRICING_PLANS.map((plan) => (
          <button
            type="button"
            key={plan.key}
            className={`pricing-plan${plan.key === selectedPlanKey ? ' pricing-plan--selected' : ''}`}
            onClick={() => setSelectedPlanKey(plan.key)}
          >
            <span className="pricing-plan__name">{plan.name}</span>
            <span className="pricing-plan__price">
              ₹{plan.rates[category.key] || 0}<span className="pricing-plan__unit">/hour</span>
            </span>
            {plan.savingsNote && <span className="pricing-plan__savings">{plan.savingsNote}</span>}
            {plan.validity && <span className="pricing-plan__note">{plan.validity}</span>}
            <ul className="pricing-plan__features">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <label>
          Date
          <input
            type="date"
            min={todayStr()}
            value={form.date}
            onChange={(e) => updateField('date', e.target.value)}
            required
          />
        </label>

        <div className="time-row">
          <label>
            Start time
            <input
              type="time"
              min="08:00"
              max="19:00"
              value={form.startTime}
              onChange={(e) => updateField('startTime', e.target.value)}
              required
            />
          </label>
          <label>
            End time
            <input
              type="time"
              min="08:00"
              max="19:00"
              value={form.endTime}
              onChange={(e) => updateField('endTime', e.target.value)}
              required
            />
          </label>
        </div>
        <p className="hint">Open 8:00 AM – 7:00 PM, every day. A 30-minute gap is kept after each booking.</p>

        <label>
          Number of seats
          <select value={seatCount} onChange={(e) => setSeatCount(Number(e.target.value))}>
            {Array.from({ length: category.capacity }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        {isCabin && (
          <label>
            Guests (up to 2)
            <select value={form.guests} onChange={(e) => updateField('guests', Number(e.target.value))}>
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </label>
        )}

        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />
        </label>

        {form.date && form.startTime && form.endTime && (
          <p className={`availability ${availability?.available === false ? 'availability--full' : ''}`}>
            {checkingAvailability && 'Checking availability…'}
            {!checkingAvailability && availability && availability.available && `${availability.remaining} spot(s) available for this time.`}
            {!checkingAvailability && availability && !availability.available && 'This time slot is fully booked. Please choose another time.'}
          </p>
        )}

        {submitError && <p className="error">{submitError}</p>}

        {bookedHours > 0 && (
          <div className="booking-total">
            <span className="booking-total__label">
              Final Amount ({selectedPlan.name}) — {seatCount} seat{seatCount === 1 ? '' : 's'} × {bookedHours % 1 === 0 ? bookedHours : bookedHours.toFixed(1)} hour{bookedHours === 1 ? '' : 's'}
            </span>
            <span className="booking-total__value">₹{estimatedPrice}</span>
          </div>
        )}

        <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
          {submitting ? 'Booking…' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}
