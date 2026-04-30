import { pgTable, text, timestamp, uuid, bigint, integer, numeric, jsonb, index } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const providerCredential = pgTable(
  'provider_credential',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    providerType: text('providerType').notNull(), // 'anthropic' | 'openai' | 'groq' | 'mistral' | 'google'
    label: text('label').notNull(),
    encryptedApiKey: text('encryptedApiKey').notNull(), // Format: iv:tag:ciphertext (base64)
    scope: text('scope'),
    lastSync: timestamp('lastSync', { withTimezone: true }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userProviderIdx: index('provider_credential_user_provider_idx').on(table.userId, table.providerType),
  })
);

export const providerUsageSnapshot = pgTable(
  'provider_usage_snapshot',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    credentialId: uuid('credentialId')
      .notNull()
      .references(() => providerCredential.id, { onDelete: 'cascade' }),
    periodStart: timestamp('periodStart', { withTimezone: true }).notNull(),
    periodEnd: timestamp('periodEnd', { withTimezone: true }).notNull(),
    model: text('model'),
    requests: integer('requests').notNull().default(0),
    inputTokens: bigint('inputTokens', { mode: 'number' }).notNull().default(0),
    outputTokens: bigint('outputTokens', { mode: 'number' }).notNull().default(0),
    cachedTokens: bigint('cachedTokens', { mode: 'number' }).notNull().default(0),
    costUsd: numeric('costUsd', { precision: 12, scale: 8 }).notNull(),
    raw: jsonb('raw'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    credentialPeriodIdx: index('provider_usage_snapshot_credential_period_idx').on(table.credentialId, table.periodStart),
    periodIdx: index('provider_usage_snapshot_period_idx').on(table.periodStart, table.periodEnd),
    createdAtIdx: index('provider_usage_snapshot_created_at_idx').on(table.createdAt),
  })
);
