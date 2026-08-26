import { Link } from 'react-router-dom';
import { IMAGE_BY_CATEGORY_SEATER } from '../pricing/images.js';

export default function SeatCard({ category }) {
  const isCabin = category.key === 'manager-cabin';
  const image = IMAGE_BY_CATEGORY_SEATER[category.key] || { src: '/hero-office.png', position: 'center' };

  return (
    <div className="seat-card">
      <div
        className="seat-card__image"
        style={{ backgroundImage: `url(${image.src})`, backgroundPosition: image.position }}
      >
        <h3 className="seat-card__title">{category.name}</h3>
      </div>
      <div className="seat-card__body">
        <p className="seat-card__desc">{category.smalldescription}</p>
        <p className="seat-card__capacity">
          Capacity: {category.capacity}
          {isCabin && ' (1 manager + 2 guests)'}
        </p>
        <Link to={`/book/${category.key}`} className="seat-card__cta">
          Book Now
        </Link>
      </div>
    </div>
  );
}
