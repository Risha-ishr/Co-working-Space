import { Link } from 'react-router-dom';

export default function SeatCard({ category }) {
  return (
    <div className="seat-card">
      <h3>{category.name}</h3>
      <p className="seat-card__desc">{category.description}</p>
      <p className="seat-card__capacity">Capacity: {category.capacity}</p>
      <Link to={`/book/${category.key}`} className="btn btn--primary">
        Book Now
      </Link>
    </div>
  );
}
