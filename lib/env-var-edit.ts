import type { EnvVar } from '@/lib/api/types';

/**
 * Text the inline edit box opens with. The API returns secret values masked (`ab****yz`),
 * so a secret starts empty: saving the mask, or a partial edit of it, would overwrite the
 * real value.
 */
export function initialEditValue(envVar: Pick<EnvVar, 'value' | 'isSecret'>): string {
  return envVar.isSecret ? '' : envVar.value;
}

/**
 * What saving the edit box should do: `empty` keeps it open (a value is required),
 * `unchanged` closes it without a request, `update` sends the new value.
 */
export function editSaveAction(
  envVar: Pick<EnvVar, 'value'>,
  editValue: string
): 'empty' | 'unchanged' | 'update' {
  if (editValue.trim() === '') return 'empty';
  if (editValue === envVar.value) return 'unchanged';
  return 'update';
}
