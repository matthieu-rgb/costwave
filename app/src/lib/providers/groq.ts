import type { LLMProvider, UsageSnapshot } from './types';

export const groqProvider: LLMProvider = {
  id: 'groq',
  name: 'Groq',
  authMethod: 'api_key',

  async validateKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
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
        return { valid: false, error: data.error?.message || `HTTP ${res.status}` };
      }

      return { valid: true };
    } catch (error) {
      const err = error as Error;
      return { valid: false, error: err.message };
    }
  },

  async fetchUsage(apiKey: string, from: Date, to: Date): Promise<UsageSnapshot[]> {
    // TODO: Groq does not expose a dedicated usage/billing API
    // Usage data is available only in individual response "usage" fields
    //
    // Possible approaches:
    // 1. Aggregate usage from Langfuse traces (if Groq calls are traced)
    // 2. Contact Groq support for programmatic billing access
    // 3. Manual export from Groq Console dashboard
    //
    // Placeholder returns empty array
    //
    // Reference: https://console.groq.com/docs/api-reference (no usage endpoint)
    return [];
  },
};
