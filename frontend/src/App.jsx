import { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import SeatPage from './pages/SeatPage/SeatPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import BookingPage from './pages/BookPage/BookingPage.jsx';
import Confirmation from './pages/Confirmation.jsx';
import VisitPage from './pages/VisitPage/VisitPage.jsx';
import FloorPlanPage from './pages/FloorPlanPage/FloorPlanPage.jsx';
import { trackPageView } from './analytics.js';

const SITE = 'https://www.101quiet.work';

// Each route gets its own title, description and self-referencing canonical,
// so no page claims to be a copy of the homepage.
const PAGE_META = {
  '/': {
    title: 'QUIET WORK 101 | Coworking Space & Meeting Rooms in Viman Nagar, Pune',
    description:
      'QUIET WORK 101 is a professional coworking space in Viman Nagar, Pune offering individual coworking seats, private workspaces and meeting rooms.',
  },
  '/seat': {
    title: 'Book a Seat | QUIET WORK 101, Viman Nagar, Pune',
    description:
      'Book an individual desk, private cabin or meeting room at QUIET WORK 101 in Viman Nagar, Pune.',
  },
  '/visit': {
    title: 'Schedule a Meeting | QUIET WORK 101, Viman Nagar, Pune',
    description:
      'Schedule a meeting or visit at QUIET WORK 101, DNK Square, Airport Road, Viman Nagar, Pune.',
  },
  '/floor-plan': {
    title: 'Floor Plan | QUIET WORK 101, Viman Nagar, Pune',
    description:
      'See the QUIET WORK 101 floor plan: individual desks and private workspaces at DNK Square, Viman Nagar, Pune.',
  },
};

function getMeta(pathname) {
  if (PAGE_META[pathname]) return { ...PAGE_META[pathname], noindex: false };
  if (pathname.startsWith('/book/')) {
    return {
      title: 'Book Your Workspace | QUIET WORK 101',
      description: 'Choose your date and time to book a workspace at QUIET WORK 101, Viman Nagar, Pune.',
      noindex: false,
    };
  }
  if (pathname === '/confirmation') {
    return { title: 'Booking Confirmed | QUIET WORK 101', noindex: true };
  }
  return { title: 'Page not found | QUIET WORK 101', noindex: true };
}

function setMetaTag(name, content) {
  let el = document.head.querySelector('meta[name="' + name + '"]');
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function applyMeta(rawPath) {
  const pathname = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
  const meta = getMeta(pathname);

  document.title = meta.title;
  if (meta.description) setMetaTag('description', meta.description);
  setMetaTag('robots', meta.noindex ? 'noindex' : 'index, follow');

  let link = document.head.querySelector('link[rel="canonical"]');
  if (meta.noindex) {
    if (link) link.remove();
    return;
  }
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', SITE + pathname);
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn--navy">
        Go to Home
      </Link>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    applyMeta(location.pathname);
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return (
    <div className="app">
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/seat" element={<SeatPage />} />
          <Route path="/book/:categoryKey" element={<BookingPage />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/visit" element={<VisitPage />} />
          <Route path="/floor-plan" element={<FloorPlanPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
