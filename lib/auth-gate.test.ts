import { describe, it, expect } from 'vitest';
import { dashboardGate } from './auth-gate';

describe('dashboardGate', () => {
  it('waits while checkAuth is running', () => {
    expect(dashboardGate({ isLoading: true, isAuthenticated: false, hasToken: true })).toBe('loading');
    expect(dashboardGate({ isLoading: true, isAuthenticated: false, hasToken: false })).toBe('loading');
  });

  it('renders the dashboard for a signed-in user', () => {
    expect(dashboardGate({ isLoading: false, isAuthenticated: true, hasToken: true })).toBe('ready');
  });

  it('does not redirect when the token was kept (server unreachable)', () => {
    expect(dashboardGate({ isLoading: false, isAuthenticated: false, hasToken: true })).toBe('unreachable');
  });

  it('sends the user to login when there is no token left', () => {
    expect(dashboardGate({ isLoading: false, isAuthenticated: false, hasToken: false })).toBe('login');
  });
});
