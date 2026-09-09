import { useEffect, useState } from 'react';
import { useLocation, Link, Navigate, useNavigate } from 'react-router-dom';
import client from '../api/client.js';

export default function Confirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(state?.booking ?? null);
  const [redirectIn, setRedirectIn] = useState(null);

  const bookingId = state?.booking?._id;
  const isPaid = booking?.paymentStatus === 'paid';
  const needsPayment = Boolean(booking && !isPaid && booking.paymentLink);

  // While the invoice is unpaid, poll the backend for the payment status.
  useEffect(() => {
    if (!bookingId || !needsPayment) return undefined;

    const check = async () => {
      try {
        const { data } = await client.get(`/payments/status/${bookingId}`);
        setBooking((b) => ({
          ...b,
          paymentStatus: data.paymentStatus,
          paymentLink: data.paymentLink || b.paymentLink,
        }));
      } catch {
        /* transient — keep polling */
      }
    };

    check();
    const id = setInterval(check, 5000);
    return () => clearInterval(id);
  }, [bookingId, needsPayment]);

  // Once paid, count down and send the user to the home page.
  useEffect(() => {
    if (!isPaid) return undefined;
    setRedirectIn(5);
    const id = setInterval(() => {
      setRedirectIn((n) => {
        if (n <= 1) {
          clearInterval(id);
          navigate('/', { replace: true });
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPaid, navigate]);

  if (!state?.booking) {
    return <Navigate to="/" replace />;
  }

  const { categoryName } = state;

  return (
    <div className="confirmation">
      <h2>Booking Confirmed!</h2>
      <ul className="confirmation__details">
        <li>
          <strong>Seat:</strong> {categoryName}
        </li>
        <li>
          <strong>Date:</strong> {booking.date}
        </li>
        <li>
          <strong>Time:</strong> {booking.startTime} – {booking.endTime}
        </li>
        <li>
          <strong>Name:</strong> {booking.name}
        </li>
        <li>
          <strong>Email:</strong> {booking.email}
        </li>
        {booking.guests > 0 && (
          <li>
            <strong>Guests:</strong> {booking.guests}
          </li>
        )}
        <li>
          <strong>Additional Seat:</strong> {booking.additionalSeat ? 'Seat Selected' : 'Not selected'}
        </li>
        {booking.planName && (
          <li>
            <strong>Plan:</strong> {booking.planName}
          </li>
        )}
        {booking.amount > 0 && (
          <li>
            <strong>Amount:</strong> ₹{booking.amount}
          </li>
        )}
        <li>
          <strong>Payment:</strong>{' '}
          <span className={isPaid ? 'payment-status--paid' : 'payment-status--pending'}>
            {isPaid ? 'Paid' : 'Pending'}
          </span>
        </li>
      </ul>

      {isPaid ? (
        <div className="confirmation__paid">
          <p className="payment-status--paid">✅ Payment received — thank you!</p>
          {redirectIn != null && redirectIn > 0 && (
            <p className="hint">Taking you to the home page in {redirectIn}s…</p>
          )}
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate('/', { replace: true })}
          >
            Go to Home
          </button>
        </div>
      ) : needsPayment ? (
        <div className="confirmation__pay">
          <a
            href={booking.paymentLink}
            className="btn btn--primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pay Now — ₹{booking.amount}
          </a>
          <p className="hint">
            The FreshBooks payment page opens in a new tab. After you pay, return to this
            tab — it detects the payment automatically and sends you back to the home page.
          </p>
        </div>
      ) : null}

      <Link
        to="/"
        className="btn btn--secondary"
        style={{ marginTop: '0.75rem', display: 'inline-block' }}
      >
        Book another seat
      </Link>
    </div>
  );
}
