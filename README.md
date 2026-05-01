# Costwave

Real-time cost tracking for LLM providers, Claude Code agents, and automation workflows.

## Documentation

- [PLAN.md](./PLAN.md) - Full implementation plan
- [DESIGN.md](./DESIGN.md) - Mission Control design system
- [CLAUDE.md](./CLAUDE.md) - Development rules

## Quick Start

See `PLAN.md` for complete setup instructions.

## Stripe Setup

Costwave uses Stripe for subscription billing (Free and Pro plans).

### Initial Setup

1. **Create Stripe Products and Prices**

   Run the setup script to create the Costwave Pro product and pricing in your Stripe account:

   ```bash
   cd app
   bun run scripts/setup-stripe.ts
   ```

   The script will create:
   - Product: "Costwave Pro"
   - Monthly price: 4.99 EUR/month
   - Yearly price: 39.99 EUR/year (~20% savings)

   Copy the price IDs displayed in the console output.

2. **Add Stripe Keys to Environment**

   Update `app/.env.local` with your Stripe credentials:

   ```env
   # Stripe API Keys (from Stripe Dashboard → Developers → API Keys)
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

   # Price IDs (from setup script output)
   STRIPE_PRICE_PRO_MONTHLY=price_...
   STRIPE_PRICE_PRO_YEARLY=price_...

   # Webhook Secret (see next step)
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Setup Webhook Listener (Development)**

   Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

   ```bash
   stripe listen --forward-to http://localhost:3001/api/webhooks/stripe
   ```

   The CLI will output a webhook signing secret (`whsec_...`). Copy this to `STRIPE_WEBHOOK_SECRET` in your `.env.local`.

   The webhook handler listens for these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. **Setup Webhook Endpoint (Production)**

   In the Stripe Dashboard:
   1. Go to **Developers → Webhooks**
   2. Click **Add endpoint**
   3. Set URL: `https://your-domain.com/api/webhooks/stripe`
   4. Select the same events listed above
   5. Copy the signing secret to your production environment variables

### Testing

Use Stripe's test cards to verify the checkout flow:
- **Success**: `4242 4242 4242 4242`
- **Failure**: `4000 0000 0000 0002`

See [Stripe test cards documentation](https://stripe.com/docs/testing) for more.

### Fallback: Manual Product Creation

If the setup script fails, create products manually in the [Stripe Dashboard](https://dashboard.stripe.com/products):

1. Create a new product named "Costwave Pro"
2. Add two prices:
   - Recurring monthly: 4.99 EUR
   - Recurring yearly: 39.99 EUR
3. Copy the price IDs to your `.env.local`

## License

MIT
