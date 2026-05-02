import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const apiKey = pgTable(
  'api_key',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // "Production API", "Dev Testing", etc.
    keyPrefix: text('keyPrefix').notNull(), // "ck_live_abc123" (visible, 16 chars)
    keyHash: text('keyHash').notNull(), // bcrypt hash of full key
    lastUsed: timestamp('lastUsed', { withTimezone: true }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revokedAt', { withTimezone: true }),
  },
  (table) => ({
    userIdx: index('api_key_user_idx').on(table.userId),
    prefixIdx: index('api_key_prefix_idx').on(table.keyPrefix),
  })
);
