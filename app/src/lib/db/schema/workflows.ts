import { pgTable, text, timestamp, uuid, integer, numeric, jsonb, index, type PgTable } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const workflow = pgTable(
  'workflow',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    source: text('source').notNull(), // 'claude_code' | 'n8n' | 'github_action' | 'custom'
    name: text('name').notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userSourceIdx: index('workflow_user_source_idx').on(table.userId, table.source),
  })
);

export const event = pgTable(
  'event',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    workflowId: uuid('workflowId').references(() => workflow.id, { onDelete: 'set null' }),
    runId: uuid('runId'),
    parentRunId: uuid('parentRunId').references((): any => event.id, { onDelete: 'set null' }),
    type: text('type').notNull(),
    status: text('status').notNull(), // 'started' | 'success' | 'error'
    startedAt: timestamp('startedAt', { withTimezone: true }).notNull(),
    durationMs: integer('durationMs'),
    tokensIn: integer('tokensIn'),
    tokensOut: integer('tokensOut'),
    costUsd: numeric('costUsd', { precision: 12, scale: 8 }),
    langfuseTraceId: text('langfuseTraceId'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userWorkflowStartedIdx: index('event_user_workflow_started_idx').on(table.userId, table.workflowId, table.startedAt),
    runIdIdx: index('event_run_id_idx').on(table.runId),
    langfuseTraceIdIdx: index('event_langfuse_trace_id_idx').on(table.langfuseTraceId),
    runParentIdx: index('event_run_parent_idx').on(table.runId, table.parentRunId),
    userStartedIdx: index('event_user_started_idx').on(table.userId, table.startedAt.desc()),
  })
);
