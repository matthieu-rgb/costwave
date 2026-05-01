import type { LLMProvider, UsageSnapshot } from './types';

export const mistralProvider: LLMProvider = {
  id: 'mistral',
  name: 'Mistral AI',
  authMethod: 'api_key',

  async validateKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        return { valid: false, error: 'Invalid API key' };
      }

      if (res.status === 429) {
        return { valid: true }; // Rate limited but key is valid
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { valid: false, error: data.message || `HTTP ${res.status}` };
      }

      return { valid: true };
    } catch (error) {
      const err = error as Error;
      return { valid: false, error: err.message };
    }
  },

  async fetchUsage(apiKey: string, from: Date, to: Date): Promise<UsageSnapshot[]> {
    // TODO: Mistral AI does not expose a public usage/billing API
    // Billing information available only via Mistral Console dashboard
    //
    // Possible approaches:
    // 1. Aggregate usage from Langfuse traces
    // 2. Manual export from console.mistral.ai
    // 3. Contact Mistral AI for programmatic billing API access
    //
    // Placeholder returns empty array
    //
    // Reference: https://docs.mistral.ai/api/ (no usage/billing endpoint)
    return [];
  },
};
