'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { providerCredential, providerUsageSnapshot, auditLog } from '@/lib/db/schema';
import { encrypt, decrypt } from '@/lib/crypto/encrypt';
import { deriveVaultKey } from '@/lib/crypto/vault';
import { getProvider } from '@/lib/providers/registry';
import { ProviderTypeSchema } from '@/lib/providers/types';
import { eq, and } from 'drizzle-orm';
import { canAddProvider } from '@/lib/auth/feature-gate';

const AddProviderSchema = z.object({
  providerType: ProviderTypeSchema,
  label: z.string().min(1, 'Label is required').max(100, 'Label too long'),
  apiKey: z.string().min(10, 'API key too short'),
  scope: z.string().optional(),
});

type AddProviderInput = z.infer<typeof AddProviderSchema>;

interface ActionResult {
  success: boolean;
  error?: string;
  credentialId?: string;
}

async function getAuditContext() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  return { ip, userAgent };
}

async function logAudit(params: {
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}) {
  const { ip, userAgent } = await getAuditContext();

  await db.insert(auditLog).values({
    userId: params.userId,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    ip,
    userAgent,
    metadata: params.metadata,
  });
}

/**
 * Adds a new LLM provider credential.
 *
 * Flow:
 * 1. Validates input with Zod
 * 2. Validates API key with provider's dry-run request
 * 3. Derives user's vault key (zero-knowledge, not stored)
 * 4. Encrypts API key with AES-256-GCM
 * 5. Stores encrypted credential in DB
 * 6. Logs action to audit trail
 */
export async function addProvider(input: AddProviderInput): Promise<ActionResult> {
  try {
    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check plan limits
    const { allowed } = await canAddProvider(session.user.id);
    if (!allowed) {
      return { success: false, error: 'Provider limit reached. Upgrade to Pro for unlimited providers.' };
    }

    // Validate input
    const parsed = AddProviderSchema.safeParse(input);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return { success: false, error: firstError?.message || 'Validation failed' };
    }

    const { providerType, label, apiKey, scope } = parsed.data;

    // Get provider
    const provider = getProvider(providerType);

    // Validate API key with dry-run request
    const validation = await provider.validateKey(apiKey);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid API key'
      };
    }

    // Derive vault key (zero-knowledge, not stored at rest)
    const vaultKey = await deriveVaultKey(session.user.id);

    // Encrypt API key with format v1:pv1:iv:tag:ciphertext
    const encryptedApiKey = encrypt(apiKey, vaultKey);

    // Store encrypted credential
    const [credential] = await db.insert(providerCredential).values({
      userId: session.user.id,
      providerType,
      label,
      encryptedApiKey,
      scope,
    }).returning({ id: providerCredential.id });

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: 'provider.add',
      resourceType: 'provider_credential',
      resourceId: credential.id,
      metadata: {
        providerType,
        label,
      },
    });

    return {
      success: true,
      credentialId: credential.id,
    };
  } catch (error) {
    const err = error as Error;
    // SECURITY: Log only message, not full error object to avoid stack trace leaks
    if (process.env.NODE_ENV === 'development') {
      console.error('[addProvider] Error:', err);
    } else {
      console.error('[addProvider] Error:', err.message);
    }
    return {
      success: false,
      error: 'Failed to add provider. Please try again.'
    };
  }
}

/**
 * Syncs usage data for a provider credential.
 *
 * Flow (Option C: foreground sync only):
 * 1. Verifies user owns the credential
 * 2. Re-derives vault key (zero-knowledge)
 * 3. Decrypts API key (discarded after use)
 * 4. Fetches usage data from provider
 * 5. Stores usage snapshots
 * 6. Updates lastSync timestamp
 * 7. Logs action to audit trail
 */
export async function syncProvider(credentialId: string): Promise<ActionResult> {
  try {
    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get credential
    const cred = await db.query.providerCredential.findFirst({
      where: eq(providerCredential.id, credentialId),
    });

    if (!cred) {
      return { success: false, error: 'Credential not found' };
    }

    // Verify ownership
    if (cred.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Re-derive vault key (Option C: zero-knowledge)
    const vaultKey = await deriveVaultKey(session.user.id);

    // Decrypt API key (exists in RAM only during this operation)
    const apiKey = decrypt(cred.encryptedApiKey, vaultKey);

    // Get provider
    const provider = getProvider(cred.providerType as z.infer<typeof ProviderTypeSchema>);

    // Fetch usage for last 30 days
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const snapshots = await provider.fetchUsage(apiKey, monthAgo, now);

    // Store snapshots if any
    if (snapshots.length > 0) {
      await db.insert(providerUsageSnapshot).values(
        snapshots.map((s) => ({
          credentialId: cred.id,
          periodStart: s.periodStart,
          periodEnd: s.periodEnd,
          model: s.model,
          requests: s.requests,
          inputTokens: s.inputTokens,
          outputTokens: s.outputTokens,
          cachedTokens: s.cachedTokens,
          costUsd: s.costUsd,
          raw: s.raw,
        }))
      );
    }

    // Update lastSync
    await db.update(providerCredential)
      .set({ lastSync: new Date() })
      .where(eq(providerCredential.id, credentialId));

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: 'provider.sync',
      resourceType: 'provider_credential',
      resourceId: credentialId,
      metadata: {
        providerType: cred.providerType,
        snapshotsCount: snapshots.length,
      },
    });

    return { success: true };
  } catch (error) {
    const err = error as Error;
    // SECURITY: Log only message, not full error object to avoid stack trace leaks
    if (process.env.NODE_ENV === 'development') {
      console.error('[syncProvider] Error:', err);
    } else {
      console.error('[syncProvider] Error:', err.message);
    }
    return {
      success: false,
      error: 'Failed to sync provider. Please try again.'
    };
  }
}

/**
 * Removes a provider credential.
 *
 * Flow:
 * 1. Verifies user owns the credential
 * 2. Deletes credential (cascades to usage snapshots)
 * 3. Logs action to audit trail
 */
export async function removeProvider(credentialId: string): Promise<ActionResult> {
  try {
    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership before deletion
    const cred = await db.query.providerCredential.findFirst({
      where: eq(providerCredential.id, credentialId),
    });

    if (!cred) {
      return { success: false, error: 'Credential not found' };
    }

    if (cred.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete credential (cascades to usage snapshots)
    await db.delete(providerCredential)
      .where(
        and(
          eq(providerCredential.id, credentialId),
          eq(providerCredential.userId, session.user.id)
        )
      );

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: 'provider.remove',
      resourceType: 'provider_credential',
      resourceId: credentialId,
      metadata: {
        providerType: cred.providerType,
        label: cred.label,
      },
    });

    return { success: true };
  } catch (error) {
    const err = error as Error;
    // SECURITY: Log only message, not full error object to avoid stack trace leaks
    if (process.env.NODE_ENV === 'development') {
      console.error('[removeProvider] Error:', err);
    } else {
      console.error('[removeProvider] Error:', err.message);
    }
    return {
      success: false,
      error: 'Failed to remove provider. Please try again.'
    };
  }
}
