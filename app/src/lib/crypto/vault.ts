import { deriveKey } from './derive-key';
import crypto from 'crypto';

/**
 * Derives a vault key for encrypting user's API keys.
 *
 * Security model (Option C - Zero-knowledge):
 * - Vault key NEVER stored at rest (no session storage)
 * - Re-derived on each cryptographic operation
 * - Uses userId + ENCRYPTION_PEPPER for per-user isolation
 * - NOT derived from password to decouple from auth reset
 *
 * @param userId - User ID (must be UUID for salt uniqueness)
 * @returns 32-byte Buffer suitable for AES-256-GCM
 *
 * @throws Error if ENCRYPTION_PEPPER not configured
 */
export async function deriveVaultKey(userId: string): Promise<Buffer> {
  const pepper = process.env.ENCRYPTION_PEPPER;
  if (!pepper) {
    throw new Error('ENCRYPTION_PEPPER not configured in environment');
  }

  // Generate deterministic salt from userId + pepper
  // Salt must be reproducible to re-derive same vault key
  const salt = crypto
    .createHash('sha256')
    .update(`${userId}:${pepper}`)
    .digest('hex')
    .substring(0, 32); // 16 bytes = 32 hex chars

  // Derive vault key using Argon2id
  // Input: pepper (not userId directly) for additional security layer
  // Salt: unique per user via SHA-256(userId:pepper)
  return deriveKey(pepper, salt);
}
