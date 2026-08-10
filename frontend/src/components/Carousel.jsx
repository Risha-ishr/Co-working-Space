import { useEffect, useState } from 'react';

const INTERVAL_MS = 10000;

export default function Carousel({ slides }) {
  const [index, setIndex] = useState(0);

  const goToNext = () => setIndex((i) => (i + 1) % slides.length);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setTimeout(goToNext, INTERVAL_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slides.length]);

  return (
    <div className="carousel">
      {slides.map((slide, i) => (
        <img
          key={i}
          src={slide.src}
          alt={slide.alt}
          className={`carousel__slide ${i === index ? 'carousel__slide--active' : ''}`}
          onClick={goToNext}
        />
      ))}
      {slides.length > 1 && (
        <div className="carousel__dots">
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              className={`carousel__dot ${i === index ? 'carousel__dot--active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
