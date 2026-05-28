import { AxiosError } from 'axios';
import { appT } from '@/lib/i18n/app-translate';
import { appendDocsHint } from './error-hints';

const API_ERROR_MESSAGE_KEYS: Record<
  string,
  { category: 'errors' | 'billing' | 'servers'; key: string }
> = {
  RATE_LIMITED: { category: 'errors', key: 'rateLimited' },
  STRIPE_NOT_CONFIGURED: { category: 'billing', key: 'stripeNotConfigured' },
  PLAN_NO_MANAGED_SERVERS: { category: 'servers', key: 'managedNotAllowedOnPlan' },
  PLAN_SERVER_VCPU_EXCEEDED: { category: 'servers', key: 'sizeExceedsPlan' },
  PLAN_SERVER_MEMORY_EXCEEDED: { category: 'servers', key: 'sizeExceedsPlan' },
  PLAN_SERVER_PRICE_EXCEEDED: { category: 'servers', key: 'sizeExceedsPlan' },
  INSUFFICIENT_WALLET: { category: 'servers', key: 'infraInsufficientForStart' },
};

function localizedByCode(code: string | undefined): string | null {
  if (!code) return null;
  const mapping = API_ERROR_MESSAGE_KEYS[code];
  if (!mapping) return null;
  return appT(mapping.category, mapping.key as never);
}

/**
 * Extracts a user-facing message from thrown errors (Axios, Error, API `{ error: { message } }`).
 */
function extractErrorCode(error: unknown): string | undefined {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { error?: { code?: string } } | undefined;
    if (data?.error?.code) return data.error.code;
  }
  if (error instanceof Error && error.message) {
    const code = error.message.trim();
    if (API_ERROR_MESSAGE_KEYS[code]) return code;
  }
  return undefined;
}

export function getApiErrorMessage(error: unknown): string {
  const errorCode = extractErrorCode(error);
  const byCode = localizedByCode(errorCode);
  if (byCode) return appendDocsHint(byCode, errorCode);

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as {
      error?: { message?: string; code?: string };
      message?: string;
    } | undefined;
    const code =
      errorCode ?? (data?.error?.code && typeof data.error.code === 'string' ? data.error.code : undefined);

    if (data && typeof data === 'object') {
      const nested = data.error?.message;
      if (typeof nested === 'string' && nested.trim()) {
        return appendDocsHint(nested, code);
      }
      if (typeof data.message === 'string' && data.message.trim()) {
        return appendDocsHint(data.message, code);
      }
    }
    const status = error.response?.status;
    if (status === 429) {
      return appendDocsHint(appT('errors', 'rateLimited'), code ?? 'RATE_LIMITED');
    }
    if (status === 413) {
      return appT('errors', 'payloadTooLarge');
    }
    if (error.code === 'ECONNABORTED') {
      return appT('errors', 'requestTimeout');
    }
    if (!error.response) {
      return appT('errors', 'networkUnavailable');
    }
    if (typeof error.message === 'string' && error.message !== 'Error') {
      return error.message;
    }
    return appT('errors', 'requestFailed');
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return appT('errors', 'unknownError');
}
