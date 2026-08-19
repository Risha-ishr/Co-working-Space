import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import SeatPage from './pages/SeatPage/SeatPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import BookingPage from './pages/BookPage/BookingPage.jsx';
import Confirmation from './pages/Confirmation.jsx';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/seat" element={<SeatPage />} />
          <Route path="/book/:categoryKey" element={<BookingPage />} />
          <Route path="/confirmation" element={<Confirmation />} />
        </Routes>
      </main>
    </div>
  );
}
