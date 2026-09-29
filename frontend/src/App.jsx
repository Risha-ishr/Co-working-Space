import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import SeatPage from './pages/SeatPage/SeatPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import BookingPage from './pages/BookPage/BookingPage.jsx';
import Confirmation from './pages/Confirmation.jsx';
import VisitPage from './pages/VisitPage/VisitPage.jsx';
import FloorPlanPage from './pages/FloorPlanPage/FloorPlanPage.jsx';
import { trackPageView } from './analytics.js';

export default function App() {
  const location = useLocation();

  useEffect(() => {
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
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
