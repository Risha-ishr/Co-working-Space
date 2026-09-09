import { useLocation, Link, Navigate } from 'react-router-dom';

export default function Confirmation() {
  const { state } = useLocation();

  if (!state?.booking) {
    return <Navigate to="/" replace />;
  }

  const { booking, categoryName } = state;
  const isPaid = booking.paymentStatus === 'paid';

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

      {!isPaid && booking.paymentLink && (
        <a
          href={booking.paymentLink}
          className="btn btn--primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Pay Now — ₹{booking.amount}
        </a>
      )}

      <Link to="/" className="btn btn--secondary" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
        Book another seat
      </Link>
    </div>
  );
}
