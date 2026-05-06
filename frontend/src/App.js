import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Bookingform from './components/Bookingform';
import AdminDashboard from './components/AdminDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css';

// Route guard: redirect to /login if not authenticated, or wrong role
const PrivateRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />

        <main>
          <Routes>
            <Route path="/" element={
              <div className="home-page">
                <header className="App-header">
                  <h1>Elevate Your Lifestyle</h1>
                  <p className="hero-subtitle">Premium services at your fingertips. Book your next experience in seconds.</p>
                </header>
                <Bookingform />
              </div>
            } />
            {/* Fix: /booking alias so CustomerDashboard button works */}
            <Route path="/booking" element={<Navigate to="/" replace />} />
            <Route path="/customer" element={
              <PrivateRoute role="customer"><CustomerDashboard /></PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2026 Aura Booking. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
