import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { apiKey, event, workflow } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { calculateCost } from '@/lib/pricing';
import { compare } from 'bcryptjs';

// Rate limiting: Map in-memory (1000 req/min per key)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(keyPrefix: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(keyPrefix);

  if (!limit || now > limit.resetAt) {
    // Reset window (60s)
    rateLimitMap.set(keyPrefix, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (limit.count >= 1000) {
    return false; // Rate limited
  }

  limit.count++;
  return true;
}

const EventIngestSchema = z.object({
  type: z.string().min(1).max(100),
  provider: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
  cachedTokens: z.number().int().min(0).optional(),
  latencyMs: z.number().int().min(0).optional(),
  status: z.enum(['started', 'success', 'error']).default('success'),
  workflowName: z.string().min(1).max(200).optional(),
  runId: z.string().uuid().optional(),
  parentRunId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Extract API key from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const apiKeyFull = authHeader.substring(7); // Remove "Bearer "

    // Format: ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (16 prefix + 32 secret)
    if (!apiKeyFull.startsWith('ck_live_') && !apiKeyFull.startsWith('ck_test_')) {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 401 });
    }

    const keyPrefix = apiKeyFull.substring(0, 16); // "ck_live_abc12345"

    // 2. Verify API key exists and not revoked
    const keyRecord = await db.query.apiKey.findFirst({
      where: and(
        eq(apiKey.keyPrefix, keyPrefix),
        isNull(apiKey.revokedAt)
      ),
    });

    if (!keyRecord) {
      return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401 });
    }

    // 3. Verify key hash (bcrypt compare)
    const isValid = await compare(apiKeyFull, keyRecord.keyHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // 4. Rate limiting
    if (!checkRateLimit(keyPrefix)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded (1000 requests per minute)' },
        { status: 429 }
      );
    }

    // 5. Parse and validate body
    const body = await request.json();
    const parsed = EventIngestSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Invalid event data' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 6. Calculate cost server-side
    const costUsd = calculateCost({
      provider: data.provider,
      model: data.model,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      cachedTokens: data.cachedTokens,
    });

    // 7. Find or create workflow
    let workflowId: string | null = null;
    if (data.workflowName) {
      const existingWorkflow = await db.query.workflow.findFirst({
        where: and(
          eq(workflow.userId, keyRecord.userId),
          eq(workflow.name, data.workflowName)
        ),
      });

      if (existingWorkflow) {
        workflowId = existingWorkflow.id;
      } else {
        // Auto-create workflow
        const [newWorkflow] = await db.insert(workflow).values({
          userId: keyRecord.userId,
          source: 'api', // Generic source
          name: data.workflowName,
        }).returning({ id: workflow.id });
        workflowId = newWorkflow.id;
      }
    }

    // 8. Insert event
    const [insertedEvent] = await db.insert(event).values({
      userId: keyRecord.userId,
      workflowId,
      runId: data.runId,
      parentRunId: data.parentRunId,
      type: data.type,
      status: data.status,
      startedAt: new Date(),
      durationMs: data.latencyMs,
      tokensIn: data.inputTokens,
      tokensOut: data.outputTokens,
      costUsd,
      metadata: data.metadata,
    }).returning({ id: event.id });

    // 9. Update API key lastUsed
    await db.update(apiKey)
      .set({ lastUsed: new Date() })
      .where(eq(apiKey.id, keyRecord.id));

    // 10. SSE broadcast: automatic (polling picks up new events)

    return NextResponse.json({
      success: true,
      eventId: insertedEvent.id,
      costUsd,
    });

  } catch (error) {
    const err = error as Error;
    if (process.env.NODE_ENV === 'development') {
      console.error('[api/v1/events/ingest] Error:', err);
    } else {
      console.error('[api/v1/events/ingest] Error:', err.message);
    }
    return NextResponse.json(
      { error: 'Failed to ingest event' },
      { status: 500 }
    );
  }
}
