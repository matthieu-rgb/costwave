import { z } from 'zod';

export const ProviderTypeSchema = z.enum([
  'anthropic',
  'openai',
  'groq',
  'mistral',
  'google',
]);

export type ProviderType = z.infer<typeof ProviderTypeSchema>;

export interface UsageSnapshot {
  periodStart: Date;
  periodEnd: Date;
  model?: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  costUsd: string; // decimal as string to preserve precision
  raw: Record<string, unknown>; // original API response
}

export interface LLMProvider {
  id: ProviderType;
  name: string;
  authMethod: 'api_key';
  scopes?: string[];

  /**
   * Validates API key by making a minimal dry-run request.
   * Cost: ~$0.0001 for validation call
   *
   * @param apiKey - API key to validate
   * @returns { valid: true } or { valid: false, error: string }
   */
  validateKey(apiKey: string): Promise<{ valid: boolean; error?: string }>;

  /**
   * Fetches usage data for the specified period.
   *
   * @param apiKey - Decrypted API key (ephemeral, never logged)
   * @param from - Period start date
   * @param to - Period end date
   * @returns Array of usage snapshots (may be empty for no usage)
   */
  fetchUsage(apiKey: string, from: Date, to: Date): Promise<UsageSnapshot[]>;
}
