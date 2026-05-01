import type { LLMProvider, UsageSnapshot } from './types';

export const openaiProvider: LLMProvider = {
  id: 'openai',
  name: 'OpenAI',
  authMethod: 'api_key',

  async validateKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10,
        }),
      });

      if (res.status === 401) {
        return { valid: false, error: 'Invalid API key' };
      }

      if (res.status === 429) {
        return { valid: true }; // Rate limited but key is valid
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { valid: false, error: data.error?.message || `HTTP ${res.status}` };
      }

      return { valid: true };
    } catch (error) {
      const err = error as Error;
      return { valid: false, error: err.message };
    }
  },

  async fetchUsage(apiKey: string, from: Date, to: Date): Promise<UsageSnapshot[]> {
    // TODO: Implement OpenAI usage API
    // Endpoint: GET /v1/organization/usage
    // Requires: Authorization Bearer token, organization-level permissions
    // Query params: start_date, end_date
    //
    // OpenAI usage API requires organization admin access
    // Placeholder returns empty array until proper credentials available
    //
    // Reference: https://platform.openai.com/docs/api-reference/usage
    return [];
  },
};
