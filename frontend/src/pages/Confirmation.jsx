import { useLocation, Link, Navigate } from 'react-router-dom';

export default function Confirmation() {
  const { state } = useLocation();

  if (!state?.booking) {
    return <Navigate to="/" replace />;
  }

  const { booking, categoryName } = state;

  return (
    <div className="confirmation">
      <h2>Booking confirmed!</h2>
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
          <strong>Amount paid:</strong> ₹{booking.amount}
        </li>
        <li>
          <strong>Payment ID:</strong> {booking.razorpayPaymentId}
        </li>
      </ul>
      <Link to="/" className="btn btn--primary">
        Book another seat
      </Link>
    </div>
  );
}
