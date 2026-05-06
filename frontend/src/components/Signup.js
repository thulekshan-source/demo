import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    category: 'Haircut'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          category: formData.category
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      console.log('Signup successful:', data);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>I am a:</label>
            <div className="role-grid single-option">
              <div className="role-option selected">
                <div className="role-icon">👤</div>
                <div className="role-text">
                  <strong>Customer</strong>
                  <span>Book services</span>
                </div>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>I am interested in:</label>
            <div className="role-grid category-grid">
              <div 
                className={`role-option ${formData.category === 'Haircut' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, category: 'Haircut' })}
              >
                <div className="role-icon">✂️</div>
                <div className="role-text">
                  <strong>Haircut</strong>
                </div>
              </div>
              <div 
                className={`role-option ${formData.category === 'Styling' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, category: 'Styling' })}
              >
                <div className="role-icon">🎨</div>
                <div className="role-text">
                  <strong>Styling</strong>
                </div>
              </div>
              <div 
                className={`role-option ${formData.category === 'Spa' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, category: 'Spa' })}
              >
                <div className="role-icon">🧖</div>
                <div className="role-text">
                  <strong>Spa</strong>
                </div>
              </div>
              <div 
                className={`role-option ${formData.category === 'Massage' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, category: 'Massage' })}
              >
                <div className="role-icon">💆</div>
                <div className="role-text">
                  <strong>Massage</strong>
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="auth-btn">Sign Up</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;
