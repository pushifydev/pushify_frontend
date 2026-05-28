/** Replace `{key}` placeholders in translated strings. */
export function formatMessage(
  template: string,
  vars: Record<string, string | number | undefined>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) continue;
    result = result.replaceAll(`{${key}}`, String(value));
  }
  return result;
}
