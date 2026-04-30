import { pgTable, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('userId').references(() => user.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    resourceType: text('resourceType'),
    resourceId: uuid('resourceId'),
    ip: text('ip'),
    userAgent: text('userAgent'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userCreatedIdx: index('audit_log_user_created_idx').on(table.userId, table.createdAt),
    actionCreatedIdx: index('audit_log_action_created_idx').on(table.action, table.createdAt),
    createdAtIdx: index('audit_log_created_at_idx').on(table.createdAt),
  })
);
