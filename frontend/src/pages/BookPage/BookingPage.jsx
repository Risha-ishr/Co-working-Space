import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../../api/client.js';
import PRICING_PLANS from '../../pricing/index.js';
import PERKS_BY_CATEGORY from '../../pricing/perks.js';
import IMAGE_BY_CATEGORY from '../../pricing/images.js';
import './BookingPage.scss';
const todayStr = () => new Date().toISOString().slice(0, 10);

function groupPlansByName(plans) {
  const groups = [];
  const byName = new Map();
  for (const plan of plans) {
    let group = byName.get(plan.name);
    if (!group) {
      group = { name: plan.name, plans: [] };
      byName.set(plan.name, group);
      groups.push(group);
    }
    group.plans.push(plan);
  }
  return groups;
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
  const [additionalSeat, setAdditionalSeat] = useState(false);

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
      const res = await client.post('/bookings', { category: categoryKey, ...form, additionalSeat });
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
  const estimatedPrice = selectedRate * seatCount;
  const perks = PERKS_BY_CATEGORY[category.key] || [];

  function renderPlanGroups(group) {
    const groupPlans = PRICING_PLANS.filter((p) => p.group === group);
    const planGroups = groupPlansByName(groupPlans);

    return planGroups.map((g) => {
      const isMulti = g.plans.length > 1;
      const defaultPlan = g.plans.find((p) => p.featured) || g.plans[g.plans.length - 1];
      const isSelected = g.plans.some((p) => p.key === selectedPlanKey);

      if (isMulti) {
        return (
          <div
            key={g.name}
            className={`pricing-plan pricing-plan--group${isSelected ? ' pricing-plan--selected' : ''}${defaultPlan.featured ? ' pricing-plan--featured' : ''}`}
          >
            {defaultPlan.featured && <span className="pricing-plan__ribbon">Best Value</span>}
            <span className="pricing-plan__header">{g.name}</span>
            <div className="pricing-plan__options">
              {g.plans.map((p) => (
                <div
                  key={p.key}
                  role="button"
                  tabIndex={0}
                  className={`pricing-plan__option${p.key === selectedPlanKey ? ' pricing-plan__option--selected' : ''}`}
                  onClick={() => setSelectedPlanKey(p.key)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPlanKey(p.key);
                    }
                  }}
                >
                  <span className="pricing-plan__option-price">₹{p.rates[category.key] || 0}</span>
                  <span className="pricing-plan__option-note">{p.basis}</span>
                  <span className="pricing-plan__option-cta">Get Started</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <button
          type="button"
          key={g.name}
          className={`pricing-plan${isSelected ? ' pricing-plan--selected' : ''}${defaultPlan.featured ? ' pricing-plan--featured' : ''}`}
          onClick={() => setSelectedPlanKey(defaultPlan.key)}
        >
          {defaultPlan.featured && <span className="pricing-plan__ribbon">Best Value</span>}
          <span className="pricing-plan__header">{g.name}</span>
          <span className="pricing-plan__price">₹{defaultPlan.rates[category.key] || 0}</span>
          <span className="pricing-plan__note">{defaultPlan.basis}</span>
          {defaultPlan.featured && <span className="pricing-plan__star">★</span>}
          <span className="pricing-plan__cta">Get Started</span>
        </button>
      );
    });
  }

  return (
    <div className="booking-page">
      <Link to="/seat" className="back-link">
        ← Back to seating options
      </Link>
      <h2>Book: {category.name}</h2>

      <p className="seat-detail__desc">{category.description}</p>

      <img
        src={(IMAGE_BY_CATEGORY[category.key] || { src: '/hero-office.png' }).src}
        alt={category.name}
        className="seat-detail__image"
        style={{ objectPosition: (IMAGE_BY_CATEGORY[category.key] || { position: 'center' }).position }}
      />

      <section className="pricing-section">
        <h2 className="pricing-section__title">Workspace Access Plans</h2>
        <p className="pricing-section__subtitle">Choose the perfect plan for your professional needs</p>

        <div className="pricing-group">
          <h3 className="pricing-group__title">Long-Term Memberships [ {category.name} ]</h3>
          <div className="pricing-plans">{renderPlanGroups('long-term')}</div>
          {perks.length > 0 && (
            <div className="pricing-perks">
              <h3 className="pricing-perks__title">Included in All Membership Plans:</h3>
              <ul className="pricing-perks__list">
                {perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pricing-group">
          <h3 className="pricing-group__title">Short-Term Passes [ {category.name} ]</h3>
          <div className="pricing-plans">{renderPlanGroups('short-term')}</div>
          {perks.length > 0 && (
            <div className="pricing-perks">
              <h3 className="pricing-perks__title">Included in All Multi-Hour Plans (3H+):</h3>
              <ul className="pricing-perks__list">
                {perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

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
        <button
          type="button"
          className={additionalSeat ? "add-seat-selected" : "add-seat-btn"}
          onClick={() => setAdditionalSeat((v) => !v)}
        >
          {additionalSeat ? 'Seat Selected' : 'Book Additional Seat'}
        </button>

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

        {form.startTime && form.endTime && (
          <div className="booking-total">
            <span className="booking-total__label">
              Final Amount ({selectedPlan.name} — {selectedPlan.basis}) — {seatCount} seat{seatCount === 1 ? '' : 's'}
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
