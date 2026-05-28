import type { ServerSizeOption } from '@/lib/api/services/servers.service';

type ServersT = (
  category: 'servers',
  key: 'sizeExceedsPlan' | 'managedNotAllowedOnPlan',
) => string;

export function getSizeDisallowLabel(
  t: ServersT,
  option: Pick<ServerSizeOption, 'disallowCode' | 'disallowReason'>,
): string {
  if (option.disallowCode === 'managedNotAllowed') {
    return t('servers', 'managedNotAllowedOnPlan');
  }
  if (option.disallowCode === 'serverTierExceeded') {
    return t('servers', 'sizeExceedsPlan');
  }
  const reason = option.disallowReason ?? '';
  if (/paid plan|ücretli plan|BYOS/i.test(reason)) {
    return t('servers', 'managedNotAllowedOnPlan');
  }
  return t('servers', 'sizeExceedsPlan');
}
