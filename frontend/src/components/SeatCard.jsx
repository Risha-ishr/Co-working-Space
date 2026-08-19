import { Link } from 'react-router-dom';

export default function SeatCard({ category }) {
  const isCabin = category.key === 'manager-cabin';

  return (
    <div className="seat-card">
      <h3>{category.name}</h3>
      <p className="seat-card__desc">{category.smalldescription}</p>
      <p className="seat-card__capacity">
        Capacity: {category.capacity}
        {isCabin && ' (1 manager + 2 guests)'}
      </p>
      <Link to={`/book/${category.key}`} className="btn btn--primary">
        Book Now
      </Link>
    </div>
  );
}
