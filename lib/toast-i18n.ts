import { toast } from 'sonner';
import { appT } from '@/lib/i18n/app-translate';
import { formatMessage } from '@/lib/i18n/format-message';
import type { ToastsKeys } from '@/lib/i18n/locales/toasts';

type ToastKey = keyof ToastsKeys;

export function showSuccessToast(
  titleKey: ToastKey,
  descKey?: ToastKey,
  vars?: Record<string, string | number | undefined>,
) {
  const title = appT('toasts', titleKey);
  if (!descKey) {
    toast.success(title);
    return;
  }
  toast.success(title, {
    description: formatMessage(appT('toasts', descKey), vars ?? {}),
  });
}

export function showErrorToast(
  titleKey: ToastKey,
  descKey?: ToastKey,
  vars?: Record<string, string | number | undefined>,
) {
  const title = appT('toasts', titleKey);
  if (!descKey) {
    toast.error(title);
    return;
  }
  toast.error(title, {
    description: formatMessage(appT('toasts', descKey), vars ?? {}),
  });
}
