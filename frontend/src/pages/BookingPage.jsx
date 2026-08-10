import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client.js';

const todayStr = () => new Date().toISOString().slice(0, 10);

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

  return (
    <div className="booking-page">
      <Link to="/" className="back-link">
        ← Back to seating options
      </Link>
      <h2>Book: {category.name}</h2>
      <p className="seat-card__desc">{category.description}</p>

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

        <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
          {submitting ? 'Booking…' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}
