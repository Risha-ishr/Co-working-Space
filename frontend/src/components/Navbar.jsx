import { Link, useNavigate } from 'react-router-dom';
import logo from '../../public/logo.png';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        <img src={logo} className="navbar__logo" alt="The Dialogue House 101 logo"  />
        <span className="navbar__brand-text">
          <span className="navbar__brand-name">
            The Dialogue
            <br />
            House 101
          </span>
          <span className="navbar__brand-tag">Less Noise. More Thought.</span>
        </span>
      </Link>

      <div className="navbar__visit">
        <span>Open daily · 8:00 AM – 7:00 PM</span>
        <button className="btn btn--navy navbar__visit-btn" onClick={() => navigate('/visit')}>
          Visit Us
        </button>
      </div>
    </header>
  );
}
