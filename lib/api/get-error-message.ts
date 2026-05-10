import { AxiosError } from 'axios';

/**
 * Extracts a user-facing message from thrown errors (Axios, Error, API `{ error: { message } }`).
 */
export function getApiErrorMessage(error: unknown): string {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as { error?: { message?: string }; message?: string } | undefined;
    if (data && typeof data === 'object') {
      const nested = data.error?.message;
      if (typeof nested === 'string' && nested.trim()) {
        return nested;
      }
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
    }
    const status = error.response?.status;
    if (status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (status === 413) {
      return 'Request payload is too large.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out.';
    }
    if (!error.response) {
      return 'Unable to reach the server. Check your connection and API URL.';
    }
    if (typeof error.message === 'string' && error.message !== 'Error') {
      return error.message;
    }
    return 'Request failed.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong.';
}
