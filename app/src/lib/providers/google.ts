import type { LLMProvider, UsageSnapshot } from './types';

/**
 * Sanitizes URLs containing API keys for safe logging.
 * Replaces key query parameter with ***REDACTED***.
 *
 * SECURITY: Google Gemini API requires API key as query parameter,
 * which exposes it in server logs. This function sanitizes URLs
 * before any logging to prevent key leakage.
 */
function sanitizeGoogleUrl(url: string): string {
  return url.replace(/key=[^&]+/, 'key=***REDACTED***');
}

export const googleProvider: LLMProvider = {
  id: 'google',
  name: 'Google AI (Gemini)',
  authMethod: 'api_key',

  async validateKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      // Gemini API uses API key as query parameter
      const res = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'test' }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        }
      );

      if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        if (data.error?.status === 'INVALID_ARGUMENT' && data.error?.message?.includes('API key')) {
          return { valid: false, error: 'Invalid API key' };
        }
      }

      if (res.status === 403) {
        return { valid: false, error: 'Invalid or restricted API key' };
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
      // SECURITY: Never log the URL which contains the API key
      if (process.env.NODE_ENV === 'development') {
        console.error('[googleProvider.validateKey] Error:', err.message, 'URL:', sanitizeGoogleUrl(url));
      }
      return { valid: false, error: err.message };
    }
  },

  async fetchUsage(apiKey: string, from: Date, to: Date): Promise<UsageSnapshot[]> {
    // SECURITY: Google Gemini API requires API key as URL query parameter.
    // All URLs are sanitized via sanitizeGoogleUrl() before logging to prevent
    // key exposure in server logs, proxy logs, or monitoring tools.
    //
    // TODO: Google AI (Gemini) usage/billing API
    // Documentation suggests checking /gemini-api/docs/billing and /gemini-api/docs/tokens
    // but specific programmatic API endpoints not publicly documented
    //
    // Possible approaches:
    // 1. Google Cloud Console billing export (if using GCP project)
    // 2. Aggregate usage from Langfuse traces
    // 3. Manual tracking via response metadata
    //
    // Placeholder returns empty array
    //
    // Reference: https://ai.google.dev/gemini-api/docs (usage API not found)
    return [];
  },
};
