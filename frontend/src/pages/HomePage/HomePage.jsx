import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🛡️', title: 'Premium & Private', desc: 'Quiet, professional and interview-ready spaces.' },
  { icon: '👥', title: 'Built for Business', desc: 'Ideal for meetings, consulting, HR and remote teams.' },
  { icon: '📍', title: 'Prime Location', desc: 'In the heart of Viman Nagar, close to everything.' },
  { icon: '📶', title: 'Ready to Work', desc: 'High-speed WiFi, open daily 7:30 AM – 9:30 PM.' },
];

const LANDMARKS = [
  { icon: '✈️', name: 'Pune Airport', time: '8 min', distance: '3.2 km' },
  { icon: '🎓', name: 'Symbiosis Law College', time: '6 min', distance: '2.1 km' },
  { icon: '🚇', name: 'Ramwadi Metro', time: '4 min', distance: '1.2 km' },
  { icon: '🏫', name: 'Bishop School Kalyani Nagar', time: '5 min', distance: '1.6 km' },
  { icon: '📍', name: 'Kalyani Nagar – Koregaon Park', time: '5 min', distance: '1.3 km' },
];

const GALLERY_IMAGES = [1, 2, 3, 4, 5].map((n) => `/gallery-${n}.jpg`);

const HomePage = () => {
  return (
    <div>
      <h2>Welcome to the Quiet Space</h2>
      <section className="hero-banner" id="home">
        <div className="hero-banner__content">
          <p className="hero-banner__eyebrow">Executive Workspace near Pune Airport</p>
          <h1 className="hero-banner__title">
            Work. Meet.
            <br />
            <span>Interview. Grow.</span>
          </h1>
          <p className="hero-banner__desc">
            Premium workspaces and meeting rooms for consultants, recruiters, founders and business
            leaders who value privacy, comfort and professionalism.
          </p>
          <div className="hero-banner__ctas">
            <Link className="btn btn--navy" to="/seat">
              📅 Book Your Space
            </Link>
            <Link className="btn btn--outline" to="/visit">
              👤 Schedule a Meeting
            </Link>
            <Link className="btn btn--outline" to="/floor-plan">
              🗺️ View Floor Plan
            </Link>
          </div>
        </div>

        <div className="hero-banner__media">
          <img src="/hero-building.jpg" alt="DNK Square, home of QUIET WORK 101" />
        </div>

        <aside className="hero-banner__landmarks">
          {LANDMARKS.map((l) => (
            <div className="landmark" key={l.name}>
              <span className="landmark__icon">{l.icon}</span>
              <div>
                <p className="landmark__name">{l.name}</p>
                <p className="landmark__meta">
                  {l.time} &nbsp;|&nbsp; {l.distance}
                </p>
              </div>
            </div>
          ))}
        </aside>
      </section>

      <section className="location-strip" id="location">
        <div className="location-strip__address">
          <span className="location-strip__pin">📍</span>
          <div>
            <p className="location-strip__label">Office:</p>
            <p className="location-strip__lines">
              <strong>101 DNK SQUARE by Dugad Group</strong>
              <br />
              SNo 30, DNK SQUARE, 111-112,
              <br />
              Airport Road, Viman Nagar
              <br />
              Pune, Maharashtra 411014, India
            </p>
          </div>
        </div>

        <div className="location-strip__gallery">
          {GALLERY_IMAGES.map((src) => (
            <img key={src} src={src} alt="QUIET WORK 101 interiors" />
          ))}
        </div>
      </section>

      <section className="feature-strip" id="amenities">
        {FEATURES.map((f) => (
          <div className="feature-strip__item" key={f.title}>
            <span className="feature-strip__icon">{f.icon}</span>
            <div>
              <p className="feature-strip__title">{f.title}</p>
              <p className="feature-strip__desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="seat-section" id="spaces">
        <h2 className="seat-section__title">Find your space at QUIET WORK 101</h2>
        <p className="seat-section__subtitle">Space for thought & clarity. Choose your space now</p>
        <Link className="btn btn--navy" to="/seat">
          Book Your Space
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
