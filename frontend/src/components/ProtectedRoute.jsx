import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p className="text-muted">Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
        <h2>Access Restricted (403)</h2>
        <p className="text-muted" style={{ margin: '1rem 0' }}>
          Your current account role (<strong>{user?.role || 'User'}</strong>) does not have permission to access this page.
        </p>
        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#475569' }}>
          Required role(s): <strong>{allowedRoles.join(', ')}</strong>
        </div>
        <div>
          <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Return to Dashboard / Home
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
