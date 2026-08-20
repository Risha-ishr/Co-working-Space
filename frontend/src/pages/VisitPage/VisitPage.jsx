import { useState } from 'react';
import client from '../../api/client.js';

export default function VisitPage() {
  const [form, setForm] = useState({ name: '', date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function updateField(field, value) {
    setSubmitError('');
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await client.post('/visits', form);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="modal">
        <h2 className="modal__title">Thanks, {form.name}!</h2>
        <p>We&apos;ve received your visit request for {form.date}. Our team will reach out to confirm.</p>
      </div>
    );
  }

  return (
    <div className="modal">
      <h2 className="modal__title">Plan Your Visit</h2>
      <form className="visit-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Your name"
            required
          />
        </label>
        <label>
          Preferred Date
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField('date', e.target.value)}
            required
          />
        </label>
        {submitError && <p className="error">{submitError}</p>}
        <button type="submit" className="btn btn--navy visit-form__whatsapp" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
