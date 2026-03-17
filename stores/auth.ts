import { create } from 'zustand';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  getAccessToken,
  clearTokens,
  type User,
  type Organization,
} from '@/lib/api';
import { verifyLogin2fa as apiVerifyLogin2fa } from '@/lib/api/services/auth.service';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  // 2FA state
  requiresTwoFactor: boolean;
  twoFactorToken: string | null;
  login: (email: string, password: string) => Promise<boolean | 'requires_2fa'>;
  verifyLogin2fa: (code: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  clearTwoFactor: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  requiresTwoFactor: false,
  twoFactorToken: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null, requiresTwoFactor: false, twoFactorToken: null });

    const result = await apiLogin({ email, password });

    if (result.error) {
      set({ isLoading: false, error: result.error.message });
      return false;
    }

    if (result.data) {
      // Check if 2FA is required
      if ('requiresTwoFactor' in result.data && result.data.requiresTwoFactor) {
        set({
          requiresTwoFactor: true,
          twoFactorToken: result.data.twoFactorToken,
          isLoading: false,
          error: null,
        });
        return 'requires_2fa';
      }

      // Normal login - cast to AuthResponse type
      const authData = result.data as { user: User; organization: Organization };
      set({
        user: authData.user,
        organization: authData.organization,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    }

    set({ isLoading: false, error: 'Unknown error' });
    return false;
  },

  verifyLogin2fa: async (code) => {
    const { twoFactorToken } = get();
    if (!twoFactorToken) {
      set({ error: '2FA session expired' });
      return false;
    }

    set({ isLoading: true, error: null });

    const result = await apiVerifyLogin2fa(twoFactorToken, code);

    if (result.error) {
      set({ isLoading: false, error: result.error.message });
      return false;
    }

    if (result.data) {
      set({
        user: result.data.user,
        organization: result.data.organization,
        isAuthenticated: true,
        isLoading: false,
        requiresTwoFactor: false,
        twoFactorToken: null,
        error: null,
      });
      return true;
    }

    set({ isLoading: false, error: 'Unknown error' });
    return false;
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });

    const result = await apiRegister({ email, password, name });

    if (result.error) {
      set({ isLoading: false, error: result.error.message });
      return false;
    }

    if (result.data) {
      set({
        user: result.data.user,
        organization: result.data.organization,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    }

    set({ isLoading: false, error: 'Unknown error' });
    return false;
  },

  logout: async () => {
    await apiLogout();
    set({
      user: null,
      organization: null,
      isAuthenticated: false,
      error: null,
      requiresTwoFactor: false,
      twoFactorToken: null,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });

    const token = getAccessToken();
    if (!token) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    const result = await getCurrentUser();

    if (result.data) {
      set({
        user: result.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  clearTwoFactor: () => set({ requiresTwoFactor: false, twoFactorToken: null }),
}));
