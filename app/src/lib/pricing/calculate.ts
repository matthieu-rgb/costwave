import { PRICING, type ProviderKey } from './constants';

export interface CostInput {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
}

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
