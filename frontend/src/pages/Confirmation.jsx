import { useEffect, useRef } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { trackBookingConversion } from '../analytics.js';

export default function Confirmation() {
  const { state } = useLocation();
  const tracked = useRef(false);

  useEffect(() => {
    if (!state?.booking || tracked.current) return;
    tracked.current = true;
    trackBookingConversion({ value: state.amount, transactionId: state.booking._id });
  }, [state]);

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
          <strong>Additional Seat:</strong> {booking.additionalSeat ? 'Seat Selected' : 'Not selected'}
        </li>
      </ul>
      <Link to="/" className="btn btn--primary">
        Book another space
      </Link>
    </div>
  );
}
