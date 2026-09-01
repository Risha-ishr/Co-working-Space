import { useNavigate } from 'react-router-dom';
const HomePage = () => {
    const navigate = useNavigate();
    const FEATURES = [
  { icon: '🛡️', title: 'Premium & Private', desc: 'Quiet, professional and interview-ready spaces.' },
  { icon: '👥', title: 'Built for Business', desc: 'Ideal for meetings, consulting, HR and remote teams.' },
  { icon: '📍', title: 'Prime Location', desc: 'In the heart of Viman Nagar, close to everything.' },
  { icon: '🏅', title: 'Velorises', desc: 'Trusted by businesses for recruitment and growth.' },
];
const LANDMARKS = [
  { icon: '✈️', name: 'Pune Airport', time: '8 min', distance: '3.2 km' },
  { icon: '🎓', name: 'Symbiosis Law College', time: '6 min', distance: '2.1 km' },
  { icon: '🚇', name: 'Ramwadi Metro', time: '4 min', distance: '1.2 km' },
  { icon: '🏫', name: 'Bishop School Kalyani Nagar', time: '5 min', distance: '1.6 km' },
  { icon: '📍', name: 'Kalyani Nagar – Koregaon Park', time: '5 min', distance: '1.3 km' },
];

const GALLERY_IMAGES = [1, 2, 3, 4, 5].map((n) => `/gallery-${n}.jpg`);
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the home page content.</p>
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
            <a className="btn btn--navy" onClick={() =>  navigate('/seat')}>
              📅 Book a Seat
            </a>
            <a className="btn btn--outline" onClick={() =>  navigate('/visit')}>
              👤 Schedule a Meeting
            </a>
            <a className="btn btn--outline" onClick={() => navigate('/floor-plan')}>
              🗺️ View Floor Plan
            </a>
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
              Airport road, Viman Nagar
              <br />
              Pune MAHARASTRA 411014, India
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
        <h2 className="seat-section__title">Find your space at QUIETWORK101</h2>
        <p className="seat-section__subtitle">Space for thought & clarity. Choose your space now</p>
        <a className="btn btn--navy" onClick={() => navigate('/seat')}>
          Book Seat
        </a>
      </section>
    </div>
  );
};

export default HomePage;