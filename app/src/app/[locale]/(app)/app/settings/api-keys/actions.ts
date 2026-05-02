'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiKey, auditLog } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';

const CreateApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

interface ActionResult {
  success: boolean;
  error?: string;
  apiKey?: string; // Full key returned ONCE
  keyId?: string;
}

async function getAuditContext() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  return { ip, userAgent };
}

export async function createApiKey(input: z.infer<typeof CreateApiKeySchema>): Promise<ActionResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const parsed = CreateApiKeySchema.safeParse(input);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { success: false, error: firstError?.message || 'Validation failed' };
    }

    const { name } = parsed.data;

    // Generate API key: ck_{env}_{secret}
    // env = "live" (production) or "test" (development)
    const env = process.env.NODE_ENV === 'production' ? 'live' : 'test';
    const secret = randomBytes(24).toString('base64url'); // 32 chars URL-safe
    const fullKey = `ck_${env}_${secret}`;
    const keyPrefix = fullKey.substring(0, 16); // "ck_live_abc12345"

    // Hash full key with bcrypt (10 rounds)
    const keyHash = await hash(fullKey, 10);

    // Insert
    const [key] = await db.insert(apiKey).values({
      userId: session.user.id,
      name,
      keyPrefix,
      keyHash,
    }).returning({ id: apiKey.id });

    // Audit log
    const { ip, userAgent } = await getAuditContext();
    await db.insert(auditLog).values({
      userId: session.user.id,
      action: 'api_key.create',
      resourceType: 'api_key',
      resourceId: key.id,
      ip,
      userAgent,
      metadata: { name, keyPrefix },
    });

    return { success: true, apiKey: fullKey, keyId: key.id };
  } catch (error) {
    const err = error as Error;
    if (process.env.NODE_ENV === 'development') {
      console.error('[createApiKey] Error:', err);
    } else {
      console.error('[createApiKey] Error:', err.message);
    }
    return { success: false, error: 'Failed to create API key' };
  }
}

export async function revokeApiKey(keyId: string): Promise<ActionResult> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const key = await db.query.apiKey.findFirst({
      where: eq(apiKey.id, keyId),
    });

    if (!key) {
      return { success: false, error: 'API key not found' };
    }

    if (key.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Soft delete: set revokedAt
    await db.update(apiKey)
      .set({ revokedAt: new Date() })
      .where(eq(apiKey.id, keyId));

    // Audit log
    const { ip, userAgent } = await getAuditContext();
    await db.insert(auditLog).values({
      userId: session.user.id,
      action: 'api_key.revoke',
      resourceType: 'api_key',
      resourceId: keyId,
      ip,
      userAgent,
      metadata: { name: key.name },
    });

    return { success: true };
  } catch (error) {
    const err = error as Error;
    if (process.env.NODE_ENV === 'development') {
      console.error('[revokeApiKey] Error:', err);
    } else {
      console.error('[revokeApiKey] Error:', err.message);
    }
    return { success: false, error: 'Failed to revoke API key' };
  }
}

export async function listApiKeys() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized', keys: [] };
    }

    const keys = await db.query.apiKey.findMany({
      where: and(
        eq(apiKey.userId, session.user.id),
        isNull(apiKey.revokedAt)
      ),
      orderBy: (apiKey, { desc }) => [desc(apiKey.createdAt)],
    });

    return { success: true, keys };
  } catch (error) {
    const err = error as Error;
    console.error('[listApiKeys] Error:', err.message);
    return { success: false, error: 'Failed to list API keys', keys: [] };
  }
}
