import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (user, pass) => {
    setUsername(user);
    setPassword(pass);
    try {
      setLoading(true);
      setError('');
      await login(user, pass);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-badge">LK</div>
          <h2>Sign in to BizTrack LK</h2>
          <p className="subtitle">Secure ASP.NET Core & Role-Based Access Control</p>
        </div>

        {error && <div className="alert-banner alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin, manager, cashier"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="quick-roles-section">
          <p className="quick-roles-title">Demo Quick Login (3 Distinct Roles):</p>
          <div className="quick-role-buttons">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => quickLogin('admin', 'Admin123!')}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => quickLogin('manager', 'Manager123!')}
            >
              📦 Inventory Mgr
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => quickLogin('cashier', 'Cashier123!')}
            >
              🧾 Cashier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
