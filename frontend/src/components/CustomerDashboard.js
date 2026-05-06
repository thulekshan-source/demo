import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching my bookings:', error);
      }
    };
    fetchMyBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <div className="header-text">
          <h1>My Dashboard</h1>
          <p>Welcome back! Here's what's happening with your bookings.</p>
        </div>
        <button className="book-new-btn" onClick={() => window.location.href='/'}>
          <span>+</span> Book New Service
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{bookings.length}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-info">
            <span className="stat-value">
              {bookings.filter(b => new Date(b.date) >= new Date()).length}
            </span>
            <span className="stat-label">Upcoming</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-info">
            <span className="stat-value">Member</span>
            <span className="stat-label">Status</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        <section className="bookings-section">
          <div className="section-header">
            <h3>Recent Bookings</h3>
            <span className="badge">{bookings.length} Found</span>
          </div>
          
          {bookings.length > 0 ? (
            <div className="booking-cards">
              {bookings.map((booking, index) => (
                <div key={index} className="booking-card-item">
                  <div className="service-badge">
                    {booking.service.includes('Hair') ? '✂️' : 
                     booking.service.includes('Spa') ? '🧖' : 
                     booking.service.includes('Massage') ? '💆' : '✨'}
                  </div>
                  <div className="booking-details">
                    <h4>{booking.service}</h4>
                    <div className="booking-meta">
                      <span><i className="icon">📅</i> {booking.date}</span>
                      <span><i className="icon">⏰</i> {booking.time}</span>
                    </div>
                  </div>
                  <div className="booking-status">
                    <span className="status-indicator confirmed">Confirmed</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>You have no upcoming bookings.</p>
              <button className="book-btn" onClick={() => window.location.href='/'}>Start Booking</button>
            </div>
          )}
        </section>

        <aside className="sidebar-section">
          <div className="dashboard-card profile-preview">
            <h3>Quick Actions</h3>
            <div className="action-list">
              <button className="action-item">
                <span>👤</span> Edit Profile
              </button>
              <button className="action-item">
                <span>⚙️</span> Settings
              </button>
              <button className="action-item danger" onClick={handleLogout}>
                <span>🚪</span> Logout
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CustomerDashboard;
