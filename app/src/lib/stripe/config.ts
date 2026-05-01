// Plan limits and configuration
export const PLANS = {
  free: {
    name: 'Free',
    maxProviders: 1,
    maxBudgets: 1,
    radarRealtime: false,
    pushNotifications: false,
    historyDays: 30,
    features: [
      '1 provider connected',
      '1 budget',
      '30 days history',
      'Dashboard access',
      'Basic alerts',
    ],
  },
  pro: {
    name: 'Pro',
    maxProviders: Infinity,
    maxBudgets: Infinity,
    radarRealtime: true,
    pushNotifications: true,
    historyDays: Infinity,
    features: [
      'Unlimited providers',
      'Unlimited budgets',
      'Unlimited history',
      'Claude Code Radar (realtime)',
      'Push notifications',
      'Priority support',
      'CSV/JSON exports',
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;

// Stripe price IDs from environment
export const STRIPE_PRICE_PRO_MONTHLY = process.env.STRIPE_PRICE_PRO_MONTHLY;
export const STRIPE_PRICE_PRO_YEARLY = process.env.STRIPE_PRICE_PRO_YEARLY;

// Price display
export const PRICING = {
  monthly: {
    amount: 4.99,
    currency: 'EUR',
    period: 'month',
    priceId: STRIPE_PRICE_PRO_MONTHLY,
  },
  yearly: {
    amount: 39.99,
    currency: 'EUR',
    period: 'year',
    priceId: STRIPE_PRICE_PRO_YEARLY,
    savings: '~20%',
  },
} as const;
