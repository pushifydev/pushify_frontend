import { AxiosError } from 'axios';
import { api, setTokens, getRefreshToken, clearTokens } from '../client';
import type { ApiResponse, User, AuthResponse, LoginInput, RegisterInput, ApiError } from '../types';

// ============ Types ============

export interface TwoFactorRequired {
  requiresTwoFactor: true;
  twoFactorToken: string;
}

/**
 * Present when an OAuth login was started by the mobile app. The web callback page is
 * only a bridge in that case: it hands the session to the app over this deep link
 * instead of entering the dashboard.
 */
export interface MobileHandoff {
  appRedirect: string;
  accessToken?: string;
  refreshToken?: string;
  twoFactorToken?: string;
}

export type LoginResponse = (AuthResponse | TwoFactorRequired) & {
  mobileHandoff?: MobileHandoff;
};

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  hasBackupCodes: boolean;
}

// ============ Auth Functions ============

export const login = async (input: LoginInput): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await api.post<
      | { data: { user: User; organization: { id: string; name: string; slug: string } }; accessToken: string; refreshToken: string }
      | { requiresTwoFactor: true; twoFactorToken: string }
    >('/auth/login', input);

    // Check if 2FA is required
    if ('requiresTwoFactor' in response.data) {
      return {
        data: {
          requiresTwoFactor: true,
          twoFactorToken: response.data.twoFactorToken,
        },
      };
    }

    const { data, accessToken, refreshToken } = response.data;
    setTokens(accessToken, refreshToken);

    return { data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const verifyLogin2fa = async (
  twoFactorToken: string,
  code: string
): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await api.post<{
      data: AuthResponse;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login/2fa', { twoFactorToken, code });

    const { data, accessToken, refreshToken } = response.data;
    setTokens(accessToken, refreshToken);

    return { data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const register = async (input: RegisterInput): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await api.post<{
      data: AuthResponse;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', input);

    const { data, accessToken, refreshToken } = response.data;
    setTokens(accessToken, refreshToken);

    return { data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore logout errors
    }
  }
  clearTokens();
};

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await api.get<{ data: User }>('/auth/me');
    return { data: response.data.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

// ============ 2FA Functions ============

export const setup2fa = async (): Promise<ApiResponse<TwoFactorSetup>> => {
  try {
    const response = await api.post<TwoFactorSetup>('/auth/2fa/setup');
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const enable2fa = async (
  code: string,
  backupCodes: string[]
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<{ message: string }>('/auth/2fa/enable', { code, backupCodes });
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const disable2fa = async (
  credentials: TwoFactorCredentials
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<{ message: string }>('/auth/2fa/disable', credentials);
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const regenerateBackupCodes = async (
  credentials: TwoFactorCredentials
): Promise<ApiResponse<{ backupCodes: string[] }>> => {
  try {
    const response = await api.post<{ backupCodes: string[] }>(
      '/auth/2fa/backup-codes/regenerate',
      credentials
    );
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const get2faStatus = async (): Promise<ApiResponse<TwoFactorStatus>> => {
  try {
    const response = await api.get<TwoFactorStatus>('/auth/2fa/status');
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

// ============ Profile Functions ============

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string | null;
}

export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export const updateProfile = async (
  input: UpdateProfileInput
): Promise<ApiResponse<ProfileUser>> => {
  try {
    const response = await api.patch<{ data: ProfileUser }>('/auth/me', input);
    return { data: response.data.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export interface ChangePasswordInput {
  /** Omitted when an OAuth-only account sets its first password */
  currentPassword?: string;
  newPassword: string;
}

/** Password accounts confirm with password; OAuth-only accounts with a 2FA/backup code */
export interface TwoFactorCredentials {
  password?: string;
  twoFactorCode?: string;
}

export const changePassword = async (
  input: ChangePasswordInput
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<{ message: string }>('/auth/me/change-password', input);
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

// ============ Session Functions ============

export interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
}

export const getSessions = async (): Promise<ApiResponse<Session[]>> => {
  try {
    const response = await api.get<{ data: Session[] }>('/auth/me/sessions');
    return { data: response.data.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const terminateSession = async (
  sessionId: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.delete<{ message: string }>(`/auth/me/sessions/${sessionId}`);
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const terminateOtherSessions = async (
  refreshToken: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<{ message: string }>('/auth/me/sessions/terminate-others', {
      refreshToken,
    });
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

// ============ Email Verification ============

export const sendVerificationEmail = async (): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<{ message: string }>('/auth/verify-email/send');
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const verifyEmail = async (token: string): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<{ message: string }>('/auth/verify-email/confirm', { token });
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

// ============ GitHub OAuth Login ============

export const getGithubLoginUrl = async (): Promise<ApiResponse<{ url: string; state: string }>> => {
  try {
    const response = await api.get<{ url: string; state: string }>('/auth/github/login-url');
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const githubLoginCallback = async (
  code: string,
  state: string,
): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await api.post<
      | { data: AuthResponse; accessToken: string; refreshToken: string; appRedirect?: string }
      | { requiresTwoFactor: true; twoFactorToken: string; appRedirect?: string }
    >('/auth/github/login-callback', { code, state });

    const appRedirect = response.data.appRedirect;

    // 2FA-enabled account: no tokens yet — surface the challenge to the caller
    if ('requiresTwoFactor' in response.data) {
      return {
        data: {
          requiresTwoFactor: true,
          twoFactorToken: response.data.twoFactorToken,
          ...(appRedirect
            ? { mobileHandoff: { appRedirect, twoFactorToken: response.data.twoFactorToken } }
            : {}),
        },
      };
    }

    const { data, accessToken, refreshToken } = response.data;

    // Mobile flow: this browser is a throwaway bridge, so don't leave a web session
    // behind in it — the tokens travel to the app over the deep link instead.
    if (appRedirect) {
      return { data: { ...data, mobileHandoff: { appRedirect, accessToken, refreshToken } } };
    }

    setTokens(accessToken, refreshToken);

    return { data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

// ============ Google OAuth Login ============

export const getGoogleLoginUrl = async (): Promise<ApiResponse<{ url: string; state: string }>> => {
  try {
    const response = await api.get<{ url: string; state: string }>('/auth/google/login-url');
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const googleLoginCallback = async (
  code: string,
  state: string,
): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await api.post<
      | { data: AuthResponse; accessToken: string; refreshToken: string; appRedirect?: string }
      | { requiresTwoFactor: true; twoFactorToken: string; appRedirect?: string }
    >('/auth/google/login-callback', { code, state });

    const appRedirect = response.data.appRedirect;

    // 2FA-enabled account: no tokens yet — surface the challenge to the caller
    if ('requiresTwoFactor' in response.data) {
      return {
        data: {
          requiresTwoFactor: true,
          twoFactorToken: response.data.twoFactorToken,
          ...(appRedirect
            ? { mobileHandoff: { appRedirect, twoFactorToken: response.data.twoFactorToken } }
            : {}),
        },
      };
    }

    const { data, accessToken, refreshToken } = response.data;

    // Mobile flow: this browser is a throwaway bridge, so don't leave a web session
    // behind in it — the tokens travel to the app over the deep link instead.
    if (appRedirect) {
      return { data: { ...data, mobileHandoff: { appRedirect, accessToken, refreshToken } } };
    }

    setTokens(accessToken, refreshToken);

    return { data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

// ============ Forgot / Reset Password ============

export const forgotPassword = async (email: string): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const resetPassword = async (
  token: string,
  password: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post<{ message: string }>('/auth/reset-password', { token, password });
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

// ============ Export as namespace for backward compatibility ============

export const authService = {
  login,
  verifyLogin2fa,
  register,
  logout,
  getCurrentUser,
  setup2fa,
  enable2fa,
  disable2fa,
  regenerateBackupCodes,
  get2faStatus,
  updateProfile,
  changePassword,
  getSessions,
  terminateSession,
  terminateOtherSessions,
  forgotPassword,
  resetPassword,
  getGithubLoginUrl,
  githubLoginCallback,
  sendVerificationEmail,
  verifyEmail,
};

// ============ Notification preferences ============

export interface NotificationPrefs {
  deploymentAlerts: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
  /** Onboarding/lifecycle email sequence (maps to server-side opt-out) */
  onboardingEmails: boolean;
}

export const getNotificationPrefs = async (): Promise<ApiResponse<NotificationPrefs>> => {
  try {
    const response = await api.get<{ data: NotificationPrefs }>('/auth/me/notification-prefs');
    return { data: response.data.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};

export const updateNotificationPrefs = async (
  input: Partial<NotificationPrefs>
): Promise<ApiResponse<NotificationPrefs>> => {
  try {
    const response = await api.put<{ data: NotificationPrefs }>(
      '/auth/me/notification-prefs',
      input
    );
    return { data: response.data.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    return {
      error: axiosError.response?.data?.error || {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server',
      },
    };
  }
};
