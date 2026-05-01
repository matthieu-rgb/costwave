/**
 * Stripe Product & Price Setup Script
 *
 * Creates the "Costwave Pro" product and its associated prices (monthly + yearly)
 * in your Stripe account. Run this once during initial setup.
 *
 * Usage:
 *   bun run scripts/setup-stripe.ts
 *
 * After running:
 *   1. Copy the price IDs displayed in the console
 *   2. Add them to your .env.local:
 *      STRIPE_PRICE_PRO_MONTHLY=price_xxx
 *      STRIPE_PRICE_PRO_YEARLY=price_xxx
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local from app directory
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  console.error('   Add your Stripe secret key to continue.');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

async function setupStripeProducts() {
  console.log('🔧 Setting up Stripe products and prices...\n');

  try {
    // Check if product already exists
    const existingProducts = await stripe.products.search({
      query: 'name:"Costwave Pro"',
    });

    let product: Stripe.Product;

    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`✓ Found existing product: ${product.id}`);
    } else {
      // Create product
      product = await stripe.products.create({
        name: 'Costwave Pro',
        description: 'Professional plan with unlimited providers, budgets, and real-time Claude Code Radar',
        metadata: {
          plan: 'pro',
        },
      });
      console.log(`✓ Created product: ${product.id}`);
    }

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 499, // 4.99 EUR in cents
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'pro',
        billing_period: 'monthly',
      },
    });
    console.log(`✓ Created monthly price: ${monthlyPrice.id}`);

    // Create yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 3999, // 39.99 EUR in cents (~20% discount)
      currency: 'eur',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan: 'pro',
        billing_period: 'yearly',
      },
    });
    console.log(`✓ Created yearly price: ${yearlyPrice.id}`);

    // Display results
    console.log('\n✅ Setup complete! Add these to your .env.local:\n');
    console.log(`STRIPE_PRICE_PRO_MONTHLY=${monthlyPrice.id}`);
    console.log(`STRIPE_PRICE_PRO_YEARLY=${yearlyPrice.id}`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Error during setup:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

setupStripeProducts();
