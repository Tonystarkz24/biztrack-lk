import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';

describe('ProtectedRoute RBAC and Access Guards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects unauthenticated users to /login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('shows 403 Forbidden message when user lacks required role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { username: 'cashier_user', role: 'Cashier' },
      isAuthenticated: true,
      loading: false
    });

    render(
      <MemoryRouter initialEntries={['/expenses']}>
        <Routes>
          <Route
            path="/expenses"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <div>Admin Expense Ledger</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Restricted (403)')).toBeInTheDocument();
    expect(screen.getByText(/Cashier/)).toBeInTheDocument();
    expect(screen.queryByText('Admin Expense Ledger')).not.toBeInTheDocument();
  });

  it('renders child component when user has required role', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { username: 'admin_user', role: 'Admin' },
      isAuthenticated: true,
      loading: false
    });

    render(
      <MemoryRouter initialEntries={['/expenses']}>
        <Routes>
          <Route
            path="/expenses"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <div>Admin Expense Ledger</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Expense Ledger')).toBeInTheDocument();
    expect(screen.queryByText('Access Restricted (403)')).not.toBeInTheDocument();
  });
});
