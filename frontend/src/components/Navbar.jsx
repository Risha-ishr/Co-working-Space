import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        The Dialogue House 101
      </Link>
      <span className="navbar__hours">Open daily · 8:00 AM – 7:00 PM</span>
    </header>
  );
}
