/** A variable of the new-project wizard's Environment step (rows may carry more, like an id). */
export interface WizardEnvVar {
  key: string;
  value: string;
  isSecret: boolean;
}

/**
 * The wizard rows to save on the new project, in order: key and value trimmed, and a row whose
 * key or value is blank (one added but never filled in) dropped, since the API needs both.
 */
export function wizardEnvVarsToCreate(rows: readonly WizardEnvVar[]): WizardEnvVar[] {
  return rows
    .map((row) => ({ key: row.key.trim(), value: row.value.trim(), isSecret: row.isSecret }))
    .filter((row) => row.key !== '' && row.value !== '');
}
