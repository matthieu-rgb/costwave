// Prix par 1M tokens (input, output, cached)
// Source: pages pricing officielles (mai 2026)

export const PRICING = {
  anthropic: {
    'claude-opus-4-5-20251101': { input: 15.0, output: 75.0, cached: 1.5 },
    'claude-sonnet-4-5-20250929': { input: 3.0, output: 15.0, cached: 0.3 },
    'claude-haiku-4-20250514': { input: 0.25, output: 1.25, cached: 0.025 },
  },
  openai: {
    'gpt-4-turbo-2024-04-09': { input: 10.0, output: 30.0, cached: 5.0 },
    'gpt-4o-2024-11-20': { input: 2.5, output: 10.0, cached: 1.25 },
    'gpt-4o-mini-2024-07-18': { input: 0.15, output: 0.6, cached: 0.075 },
  },
  groq: {
    'llama-3.3-70b-versatile': { input: 0.59, output: 0.79, cached: 0.1 },
    'mixtral-8x7b-32768': { input: 0.24, output: 0.24, cached: 0.05 },
  },
  mistral: {
    'mistral-large-latest': { input: 2.0, output: 6.0, cached: 0.4 },
    'mistral-small-latest': { input: 0.2, output: 0.6, cached: 0.04 },
  },
  google: {
    'gemini-2.0-flash-exp': { input: 0.0, output: 0.0, cached: 0.0 }, // Free tier
    'gemini-1.5-pro': { input: 1.25, output: 5.0, cached: 0.3125 },
  },
} as const;

export type ProviderKey = keyof typeof PRICING;
