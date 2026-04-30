import argon2 from 'argon2';

/**
 * Derives a 32-byte encryption key from a password using Argon2id.
 *
 * Security parameters (audited):
 * - memoryCost: 64 MB (65536 KB) - resistant to GPU/ASIC attacks
 * - timeCost: 3 iterations - balance between security and UX latency
 * - parallelism: 4 - exploits multi-core hardware for additional resistance
 * - hashLength: 32 bytes - suitable for AES-256-GCM
 *
 * @param password - User's plaintext password
 * @param salt - Hex-encoded salt (must be unique per user, stored in DB)
 * @returns 32-byte Buffer suitable for use as AES-256 key
 *
 * @throws Error if argon2 hashing fails
 */
export async function deriveKey(password: string, salt: string): Promise<Buffer> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4, // Security audit: increased from 1 to 4
    hashLength: 32,
    salt: Buffer.from(salt, 'hex'),
    raw: true, // Returns Buffer instead of encoded string
  });
}
