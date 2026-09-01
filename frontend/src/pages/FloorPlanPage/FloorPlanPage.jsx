import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FloorPlanPage.scss';

// Positions are percentages of the floor-plan frame (based on a 900 x 1600 grid).
const DESKS = [
  { id: 'D1', label: 'D1', left: 60, top: 5.4, width: 10.7, height: 9.8 },
  { id: 'D6', label: 'D6', left: 30.9, top: 18, width: 11.8, height: 9.4 },
  { id: 'D2', label: 'D2', left: 65.9, top: 18.9, width: 14.2, height: 8.4 },
  { id: 'RND', label: 'R&D', left: 9.2, top: 31.4, width: 12.4, height: 8.9 },
  { id: 'D5', label: 'D5', left: 30.9, top: 32, width: 11.8, height: 9.1 },
  { id: 'D3', label: 'D3', left: 65.9, top: 38.8, width: 14.2, height: 7.5 },
  { id: '4-SEATER', label: '4-\nSEATER', left: 24, top: 60.5, width: 15.6, height: 20.1 },
  { id: '2-SEATER', label: '2-\nSEAT\nER', left: 63.3, top: 60.9, width: 12.9, height: 19.8 },
];

const UTILITY = [
  { label: 'WC', left: 10.6, top: 5.4, width: 10.7, height: 7.6 },
  { label: 'Basin', left: 10.6, top: 15.6, width: 8.4, height: 3.6 },
  { label: 'Sink', left: 10.6, top: 20.9, width: 8.4, height: 3.6 },
];

// Each chair belongs to a desk and can be clicked to pick that seat.
const CHAIRS = [
  { id: 'D1-1', desk: 'D1', left: 75.8, top: 9.8 },
  { id: 'D6-1', desk: 'D6', left: 46.4, top: 22.1 },
  { id: 'D2-1', desk: 'D2', left: 83.3, top: 22.4 },
  { id: 'RND-1', desk: 'R&D', left: 25.1, top: 35.1 },
  { id: 'D5-1', desk: 'D5', left: 46, top: 35.5 },
  { id: 'D3-1', desk: 'D3', left: 83.3, top: 42.3 },
  { id: '4S-1', desk: '4-Seater', left: 20.2, top: 66.8 },
  { id: '4S-2', desk: '4-Seater', left: 20.2, top: 76.8 },
  { id: '4S-3', desk: '4-Seater', left: 43.3, top: 66.8 },
  { id: '4S-4', desk: '4-Seater', left: 43.3, top: 76.8 },
  { id: '2S-1', desk: '2-Seater', left: 80, top: 67.5 },
  { id: '2S-2', desk: '2-Seater', left: 80, top: 77 },
];

export default function FloorPlanPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const selectedChair = CHAIRS.find((c) => c.id === selected);

  return (
    <div className="floor-plan-page">
      <a className="back-link" onClick={() => navigate('/seat')}>
        ← Back to seating options
      </a>

      <h2 className="floor-plan-page__title">Office Floor Plan</h2>
      <p className="floor-plan-page__subtitle">
        Tap a chair to pick a seat, then book it.
      </p>

      <div className="floor-plan">
        <div className="floor-plan__utility">
          {UTILITY.map((u) => (
            <div
              key={u.label}
              className="floor-plan__box floor-plan__box--muted"
              style={{ left: `${u.left}%`, top: `${u.top}%`, width: `${u.width}%`, height: `${u.height}%` }}
            >
              <span>{u.label}</span>
            </div>
          ))}
        </div>

        {DESKS.map((d) => (
          <div
            key={d.id}
            className="floor-plan__box floor-plan__box--desk"
            style={{ left: `${d.left}%`, top: `${d.top}%`, width: `${d.width}%`, height: `${d.height}%` }}
          >
            <span>{d.label}</span>
          </div>
        ))}

        <div
          className="floor-plan__box floor-plan__box--reception"
          style={{ left: '48%', top: '81.25%', width: '13.1%', height: '4.5%' }}
        >
          <span>Rec</span>
        </div>

        <div
          className="floor-plan__zone"
          style={{ left: '8.9%', top: '84.75%', width: '21.3%', height: '7.25%' }}
        >
          <span>Meeting &amp; Discuss</span>
        </div>

        <div className="floor-plan__entrance" style={{ left: '72%', top: '91%' }}>
          ENTRANCE
        </div>

        {CHAIRS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`floor-plan__chair${selected === c.id ? ' floor-plan__chair--selected' : ''}`}
            style={{ left: `${c.left}%`, top: `${c.top}%` }}
            aria-label={`Seat at ${c.desk}`}
            aria-pressed={selected === c.id}
            onClick={() => setSelected((prev) => (prev === c.id ? null : c.id))}
          />
        ))}
      </div>

      <p className="floor-plan-page__note">
        All desks, labels, chairs and zones are separate movable objects.
      </p>

      <div className="floor-plan-page__actions">
        {selectedChair ? (
          <>
            <span className="floor-plan-page__selection">
              Selected: seat at <strong>{selectedChair.desk}</strong>
            </span>
            <a className="btn btn--navy" onClick={() => navigate('/seat')}>
              Book this seat
            </a>
          </>
        ) : (
          <a className="btn btn--navy" onClick={() => navigate('/seat')}>
            Book a Seat
          </a>
        )}
      </div>
    </div>
  );
}
