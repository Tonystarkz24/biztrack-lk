import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    closeMenu();
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="brand-link" onClick={closeMenu}>
          <span className="brand-badge">LK</span>
          <span>BizTrack LK</span>
        </NavLink>

        <button
          className="nav-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${isOpen ? 'open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            🏠 Home
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/inventory"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            📦 Inventory
          </NavLink>
          <NavLink
            to="/sales"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            🧾 Sales
          </NavLink>
          <NavLink
            to="/expenses"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            💸 Expenses
          </NavLink>
          <NavLink
            to="/agent-workflows"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            🤖 AI Workflows
          </NavLink>

          <div className="nav-auth-section">
            {user ? (
              <div className="user-profile-badge">
                <span className="user-name">{user.username}</span>
                <span className="role-tag">{user.role}</span>
                <button className="btn-logout" onClick={handleLogout} title="Sign Out">
                  🚪
                </button>
              </div>
            ) : (
              <NavLink to="/login" className="btn btn-outline btn-sm" onClick={closeMenu}>
                Sign In
              </NavLink>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
