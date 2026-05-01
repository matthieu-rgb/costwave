import { anthropicProvider } from './anthropic';
import { openaiProvider } from './openai';
import { groqProvider } from './groq';
import { mistralProvider } from './mistral';
import { googleProvider } from './google';
import type { LLMProvider, ProviderType } from './types';

export const providerRegistry: Record<ProviderType, LLMProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  groq: groqProvider,
  mistral: mistralProvider,
  google: googleProvider,
};

export function getProvider(type: ProviderType): LLMProvider {
  const provider = providerRegistry[type];
  if (!provider) {
    throw new Error(`Unknown provider type: ${type}`);
  }
  return provider;
}

export function getAllProviders(): LLMProvider[] {
  return Object.values(providerRegistry);
}
