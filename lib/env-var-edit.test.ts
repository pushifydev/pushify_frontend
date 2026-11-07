import { describe, expect, it } from 'vitest';
import { editSaveAction, initialEditValue } from './env-var-edit';

describe('initialEditValue', () => {
  it('opens a secret empty instead of with its masked value', () => {
    expect(initialEditValue({ value: 'p****l', isSecret: true })).toBe('');
  });

  it('opens a plain variable with its current value', () => {
    expect(initialEditValue({ value: 'production', isSecret: false })).toBe('production');
  });
});

describe('editSaveAction', () => {
  it('does not send the masked value back when a secret is saved untouched', () => {
    expect(editSaveAction({ value: 'p****l' }, 'p****l')).toBe('unchanged');
  });

  it('does not send a request for an unchanged plain value', () => {
    expect(editSaveAction({ value: 'production' }, 'production')).toBe('unchanged');
  });

  it('requires a value', () => {
    expect(editSaveAction({ value: 'p****l' }, '')).toBe('empty');
    expect(editSaveAction({ value: 'p****l' }, '  \n')).toBe('empty');
  });

  it('sends a changed value as typed, multi-line included', () => {
    expect(editSaveAction({ value: 'p****l' }, 'new-secret')).toBe('update');
    expect(editSaveAction({ value: 'a' }, 'line1\nline2')).toBe('update');
  });
});
