import type { TranslationKeys } from '@/lib/i18n';

type ServersKey = keyof TranslationKeys['servers'];

const MESSAGE_CODE_TO_KEY: Record<string, ServersKey> = {
  infra_credits_stopped: 'statusInfraCreditsStopped',
  billing_suspended: 'statusBillingSuspended',
};

/** Legacy English strings stored before i18n codes */
const LEGACY_ENGLISH: Record<string, ServersKey> = {
  'Stopped: insufficient infrastructure credits. Add credits in Billing to start again.':
    'statusInfraCreditsStopped',
};

export function isInfraCreditsStoppedMessage(message: string | null | undefined): boolean {
  if (!message?.trim()) return false;
  if (message === 'infra_credits_stopped') return true;
  return LEGACY_ENGLISH[message] === 'statusInfraCreditsStopped';
}

export function resolveServerStatusMessage(
  message: string | null | undefined,
  t: (namespace: 'servers', key: ServersKey) => string,
): string | null {
  if (!message?.trim()) return null;
  const key = MESSAGE_CODE_TO_KEY[message] ?? LEGACY_ENGLISH[message];
  return key ? t('servers', key) : message;
}
