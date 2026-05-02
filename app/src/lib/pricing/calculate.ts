import { PRICING, type ProviderKey } from './constants';

export interface CostInput {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
}

/**
 * Calculates the cost in USD for an LLM API call based on token usage.
 *
 * Pricing is defined per provider/model in constants.ts.
 * Formula: (inputTokens / 1M * inputPrice) + (outputTokens / 1M * outputPrice) + (cachedTokens / 1M * cachedPrice)
 *
 * @param input - Token counts and provider/model identifiers
 * @returns Cost as string with 8 decimal precision (e.g., "0.00123456")
 *
 * @example
 * ```ts
 * const cost = calculateCost({
 *   provider: 'anthropic',
 *   model: 'claude-sonnet-4-5-20250929',
 *   inputTokens: 1000,
 *   outputTokens: 500,
 * });
 * // Returns "0.01050000" ($0.0105)
 * ```
 */
export function calculateCost(input: CostInput): string {
  const { provider, model, inputTokens, outputTokens, cachedTokens = 0 } = input;

  // Fallback si provider/model inconnu
  const providerPricing = PRICING[provider as ProviderKey];
  if (!providerPricing) {
    console.warn(`[pricing] Unknown provider: ${provider}, defaulting to $0`);
    return '0.00000000';
  }

  const modelPricing = providerPricing[model as keyof typeof providerPricing] as
    | { input: number; output: number; cached: number }
    | undefined;
  if (!modelPricing) {
    console.warn(`[pricing] Unknown model: ${model} for ${provider}, defaulting to $0`);
    return '0.00000000';
  }

  // Calcul: (tokens / 1M) * price_per_1M
  const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
  const outputCost = (outputTokens / 1_000_000) * modelPricing.output;
  const cachedCost = (cachedTokens / 1_000_000) * modelPricing.cached;

  const totalCost = inputCost + outputCost + cachedCost;

  // Format: 8 decimales (precision schema DB)
  return totalCost.toFixed(8);
}
