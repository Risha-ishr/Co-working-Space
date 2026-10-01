import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client.js';
import SeatCard from '../../components/SeatCard.jsx';
import Carousel from '../../components/Carousel.jsx';

const HERO_SLIDES = [
  { src: '/entrance.jpg', alt: 'QUIET WORK 101 entrance' },
  { src: '/hero-office.png', alt: 'QUIET WORK 101 seating area' },
  { src: '/FourSeatView.jpeg', alt: 'QUIET WORK 101 four-seat workspace' },
  { src: '/TwoSeatBackView.jpeg', alt: 'QUIET WORK 101 two-seat workspace' },
];

export default function SeatPage() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get('/seat-categories')
      .then((res) => setCategories(res.data))
      .catch(() =>
        setError('Seating options are temporarily unavailable. Please call +91 91755 36918 to book.')
      );
  }, []);

  return (
    <div className="home">
      <Link className="back-link" to="/">
        ← Back to Home
      </Link>
      <div className="seat-page__floor-plan-cta" style={{ margin: '12px 0' }}>
        <Link className="btn btn--navy" to="/floor-plan">
          🗺️ View Floor Plan
        </Link>
      </div>
      <section className="hero">
        <Carousel slides={HERO_SLIDES} />
        <h1 className="seat-section__title">Find your space at QUIET WORK 101</h1>
        <p>Pick a seating category, choose your time, and you&apos;re set.</p>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="seat-grid">
        {categories.map((category) => (
          <SeatCard key={category.key} category={category} />
        ))}
      </section>
    </div>
  );
}
