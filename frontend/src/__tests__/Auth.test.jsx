import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn()
  }
}));

const TestAuthConsumer = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Guest'}</div>
      <div data-testid="user-name">{user ? user.username : 'None'}</div>
      <div data-testid="user-role">{user ? user.role : 'None'}</div>
      <button onClick={() => login('admin', 'Admin123!')}>Login Button</button>
      <button onClick={logout}>Logout Button</button>
    </div>
  );
};

describe('AuthContext and Protected Identity Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts unauthenticated when no token is present', () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
    expect(screen.getByTestId('user-name')).toHaveTextContent('None');
  });

  it('restores authenticated state if user exists in localStorage', () => {
    localStorage.setItem('biztrack_token', 'valid_jwt_mock');
    localStorage.setItem(
      'biztrack_user',
      JSON.stringify({
        username: 'manager_user',
        role: 'InventoryManager',
        fullName: 'Inventory Manager'
      })
    );

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('manager_user');
    expect(screen.getByTestId('user-role')).toHaveTextContent('InventoryManager');
  });

  it('updates state on successful login and persists credentials', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        token: 'new_token_123',
        username: 'admin',
        role: 'Admin',
        fullName: 'System Administrator',
        email: 'admin@biztrack.lk'
      }
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login Button').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('admin');
    expect(screen.getByTestId('user-role')).toHaveTextContent('Admin');
    expect(localStorage.getItem('biztrack_token')).toBe('new_token_123');
  });

  it('clears state on logout', () => {
    localStorage.setItem('biztrack_token', 'token_to_remove');
    localStorage.setItem('biztrack_user', JSON.stringify({ username: 'cashier', role: 'Cashier' }));

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');

    act(() => {
      screen.getByText('Logout Button').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
    expect(localStorage.getItem('biztrack_token')).toBeNull();
  });
});
