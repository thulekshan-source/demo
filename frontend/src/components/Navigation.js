import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">Aura<span>.</span></Link>
        <ul>
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Book Now</Link></li>
          
          {user && user.role === 'customer' && (
            <li><Link to="/customer" className={location.pathname === '/customer' ? 'active' : ''}>My Dashboard</Link></li>
          )}
          
          {user && user.role === 'admin' && (
            <li><Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link></li>
          )}

          {!user ? (
            <>
              <li className="nav-divider"></li>
              <li><Link to="/login" className="login-link">Login</Link></li>
              <li><Link to="/signup" className="signup-btn">Sign Up</Link></li>
            </>
          ) : (
            <>
              <li className="nav-divider"></li>
              <li className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">({user.role})</span>
              </li>
              <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
