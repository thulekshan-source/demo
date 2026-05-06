import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Bookingfrom.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Bookingform = () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    date: '',
    time: '',
    service: 'Consultation'
  });

  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // FIX: redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    setStatus('loading');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/bookings`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Booking confirmed! We will be in touch shortly.');
      setStatus('success');
      setFormData({ name: user?.name || '', email: user?.email || '', date: '', time: '', service: 'Consultation' });
    } catch (error) {
      if (error.response?.status === 401) {
        setMessage('Please log in to make a booking.');
        setStatus('error');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setMessage('Something went wrong. Please try again.');
        setStatus('error');
      }
    }
  };

  return (
    <div className="booking-section">
      <div className="booking-content">
        <h2>Experience the Future of Booking</h2>
        <p>Select your service and choose a time that fits your schedule.</p>

        {!user && (
          <div className="auth-notice">
            <p>Please <a href="/login">log in</a> or <a href="/signup">sign up</a> to make a booking.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required disabled={!!user} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Preferred Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label>Preferred Time</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Service Category</label>
            <select name="service" value={formData.service} onChange={handleChange}>
              <option value="Consultation">Consultation</option>
              <option value="Haircut">Haircut &amp; Styling</option>
              <option value="Spa">Luxury Spa Experience</option>
              <option value="Massage">Deep Tissue Massage</option>
            </select>
          </div>

          <button type="submit" className={`submit-btn ${status}`} disabled={status === 'loading'}>
            {status === 'loading' ? 'Processing...' : user ? 'Reserve Now' : 'Login to Book'}
          </button>

          {message && <div className={`feedback-message ${status}`}>{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default Bookingform;
