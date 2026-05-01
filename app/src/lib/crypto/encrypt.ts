import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM standard IV length
const TAG_LENGTH = 16; // Maximum auth tag length for GCM
const VERSION = 'v1'; // Format versioning for future migrations
const PEPPER_VERSION = 'pv1'; // Pepper rotation tracking

/**
 * Encrypts plaintext using AES-256-GCM with a random IV per encryption.
 *
 * Format: v1:pv1:iv:tag:ciphertext (all hex-encoded)
 * - Version prefix enables future algorithm migrations
 * - Pepper version tracks ENCRYPTION_PEPPER rotation
 * - IV is 12 bytes random, unique per encryption (never reused)
 * - Tag is 16 bytes authentication tag from GCM
 *
 * @param plaintext - String to encrypt (e.g., API key)
 * @param key - 32-byte encryption key (from deriveKey)
 * @returns Hex-encoded string in format v1:pv1:iv:tag:ciphertext
 *
 * @throws Error if encryption fails
 */
export function encrypt(plaintext: string, key: Buffer): string {
  if (key.length !== 32) {
    throw new Error('Encryption key must be 32 bytes for AES-256');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Security: version prefix enables future algorithm changes, pepper version for key rotation
  return `${VERSION}:${PEPPER_VERSION}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts ciphertext encrypted with encrypt().
 *
 * @param ciphertext - Hex-encoded string in format v1:pv1:iv:tag:ciphertext
 * @param key - Same 32-byte key used for encryption
 * @returns Original plaintext
 *
 * @throws Error if format invalid, tag verification fails, or key incorrect
 */
export function decrypt(ciphertext: string, key: Buffer): string {
  if (key.length !== 32) {
    throw new Error('Decryption key must be 32 bytes for AES-256');
  }

  const parts = ciphertext.split(':');
  if (parts.length !== 5) {
    throw new Error('Invalid ciphertext format (expected v1:pv1:iv:tag:encrypted)');
  }

  const [version, pepperVersion, ivHex, tagHex, encrypted] = parts;

  if (version !== VERSION) {
    throw new Error(`Unsupported ciphertext version: ${version}`);
  }

  if (pepperVersion !== PEPPER_VERSION) {
    throw new Error(`Unsupported pepper version: ${pepperVersion} (current: ${PEPPER_VERSION})`);
  }

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`);
  }

  if (tag.length !== TAG_LENGTH) {
    throw new Error(`Invalid tag length: expected ${TAG_LENGTH}, got ${tag.length}`);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  try {
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // Wrap native error to avoid timing leaks and provide consistent messaging
    throw new Error('Decryption failed: invalid key or corrupted ciphertext');
  }
}
