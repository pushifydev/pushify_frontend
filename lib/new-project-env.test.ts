import { describe, expect, it } from 'vitest';
import { wizardEnvVarsToCreate } from './new-project-env';

const row = (key: string, value: string, isSecret = false) => ({ id: key, key, value, isSecret });

describe('wizardEnvVarsToCreate', () => {
  it('keeps filled rows in order with their secret flag', () => {
    expect(
      wizardEnvVarsToCreate([row('DATABASE_URL', 'postgres://db', true), row('NODE_ENV', 'production')])
    ).toEqual([
      { key: 'DATABASE_URL', value: 'postgres://db', isSecret: true },
      { key: 'NODE_ENV', value: 'production', isSecret: false },
    ]);
  });

  it('drops rows whose key or value is blank', () => {
    expect(
      wizardEnvVarsToCreate([row('', ''), row('', 'orphan'), row('API_KEY', '   '), row('PORT', '3000')])
    ).toEqual([{ key: 'PORT', value: '3000', isSecret: false }]);
  });

  it('trims the key and value', () => {
    expect(wizardEnvVarsToCreate([row('  API_KEY ', ' sk-123\t', true)])).toEqual([
      { key: 'API_KEY', value: 'sk-123', isSecret: true },
    ]);
  });

  it('does not send the row id to the API', () => {
    expect(wizardEnvVarsToCreate([row('A', '1')])[0]).not.toHaveProperty('id');
  });

  it('returns nothing for an empty step', () => {
    expect(wizardEnvVarsToCreate([])).toEqual([]);
  });
});
