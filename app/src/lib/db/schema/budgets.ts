import { pgTable, text, timestamp, uuid, numeric, integer, index, unique, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './auth';

export const budget = pgTable(
  'budget',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    scope: text('scope').notNull(), // 'global' | 'provider' | 'workflow'
    targetId: uuid('targetId'),
    period: text('period').notNull(), // 'day' | 'week' | 'month'
    amountUsd: numeric('amountUsd', { precision: 10, scale: 2 }).notNull(),
    alertThresholds: integer('alertThresholds').array().notNull(), // [50, 75, 90, 100]
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userScopeTargetIdx: index('budget_user_scope_target_idx').on(table.userId, table.scope, table.targetId),
    scopeTargetCheck: check(
      'budget_scope_target_check',
      sql`(${table.scope} = 'global' AND ${table.targetId} IS NULL) OR (${table.scope} != 'global' AND ${table.targetId} IS NOT NULL)`
    ),
  })
);

export const budgetAlertSent = pgTable(
  'budget_alert_sent',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    budgetId: uuid('budgetId')
      .notNull()
      .references(() => budget.id, { onDelete: 'cascade' }),
    threshold: integer('threshold').notNull(),
    periodStart: timestamp('periodStart', { withTimezone: true }).notNull(),
    sentAt: timestamp('sentAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    budgetThresholdPeriodUniq: unique('budget_alert_sent_budget_threshold_period_uniq').on(
      table.budgetId,
      table.threshold,
      table.periodStart
    ),
  })
);
