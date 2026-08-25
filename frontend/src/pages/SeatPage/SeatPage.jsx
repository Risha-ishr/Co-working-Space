import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client.js';
import SeatCard from '../../components/SeatCard.jsx';
import Carousel from '../../components/Carousel.jsx';

const HERO_SLIDES = [
  { src: '/entrance.jpg', alt: 'QUIET WORK 101 entrance' },
  { src: '/hero-office.png', alt: 'QUIET WORK 101 seating area' },
  { src: '/FourSeatView.jpeg', alt: 'QUIET WORK 101 entrance' },
  { src: '/TwoSeatBackView.jpeg', alt: 'QUIET WORK 101 seating area' },
  // { src: '/WindowView.jpeg', alt: 'QUIET WORK 101 seating area' },
];

export default function SeatPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get('/seat-categories')
      .then((res) => setCategories(res.data))
      .catch(() => setError('Could not load seating options. Is the backend running?'));
  }, []);

  return (
    <div className="home">
      <a className="back-link" onClick={() => navigate('/')}>
        ← Back to Home
      </a>
      <section className="hero">
        <Carousel slides={HERO_SLIDES} />
        <h1 className='seat-section__title'>Find your space at QUIETWORK101</h1>
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
