import type { LLMProvider, UsageSnapshot } from './types';

export const anthropicProvider: LLMProvider = {
  id: 'anthropic',
  name: 'Anthropic',
  authMethod: 'api_key',

  async validateKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-20250514',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });

      if (res.status === 401 || res.status === 403) {
        return { valid: false, error: 'Invalid API key' };
      }

      if (res.status === 429) {
        return { valid: true }; // Rate limited but key is valid
      }

      if (!res.ok) {
        return { valid: false, error: `HTTP ${res.status}` };
      }

      return { valid: true };
    } catch (error) {
      const err = error as Error;
      return { valid: false, error: err.message };
    }
  },

  async fetchUsage(apiKey: string, from: Date, to: Date): Promise<UsageSnapshot[]> {
    // TODO: Implement Anthropic Admin API usage reporting
    // Endpoint: GET /v1/organizations/{org_id}/usage_report/messages
    // Requires: x-api-key header, organization-level API key
    // Query params: start_date (YYYY-MM-DD), end_date (YYYY-MM-DD)
    //
    // Admin API access requires organization-level permissions
    // Placeholder returns empty array until Admin API key is available
    //
    // Reference: https://docs.anthropic.com/en/api/admin-api (access restricted)
    return [];
  },
};
