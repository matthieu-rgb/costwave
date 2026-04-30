import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { deriveKey } from './derive-key';

describe('deriveKey', () => {
  const password = 'correct-horse-battery-staple';
  const salt = crypto.randomBytes(16).toString('hex'); // 32 hex chars

  it('should derive a 32-byte key', async () => {
    const key = await deriveKey(password, salt);

    expect(key).toBeInstanceOf(Buffer);
    expect(key.length).toBe(32);
  });

  it('should be deterministic (same password + salt → same key)', async () => {
    const key1 = await deriveKey(password, salt);
    const key2 = await deriveKey(password, salt);

    expect(key1.equals(key2)).toBe(true);
  });

  it('should produce different keys for different passwords', async () => {
    const key1 = await deriveKey('password1', salt);
    const key2 = await deriveKey('password2', salt);

    expect(key1.equals(key2)).toBe(false);
  });

  it('should produce different keys for different salts', async () => {
    const salt1 = crypto.randomBytes(16).toString('hex');
    const salt2 = crypto.randomBytes(16).toString('hex');

    const key1 = await deriveKey(password, salt1);
    const key2 = await deriveKey(password, salt2);

    expect(key1.equals(key2)).toBe(false);
  });

  it('should handle empty password (edge case)', async () => {
    const key = await deriveKey('', salt);

    expect(key).toBeInstanceOf(Buffer);
    expect(key.length).toBe(32);
  });

  it('should handle unicode password', async () => {
    const unicodePassword = 'pâssw0rd-中文-🔐';
    const key = await deriveKey(unicodePassword, salt);

    expect(key).toBeInstanceOf(Buffer);
    expect(key.length).toBe(32);
  });
});
