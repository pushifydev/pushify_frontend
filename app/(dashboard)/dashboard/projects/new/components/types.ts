export type Step = 'source' | 'configure' | 'environment' | 'review';

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}
