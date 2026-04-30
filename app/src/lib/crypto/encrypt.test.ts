import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { encrypt, decrypt } from './encrypt';

describe('encrypt/decrypt', () => {
  const key = crypto.randomBytes(32); // AES-256 key
  const plaintext = 'sk-ant-api03-1234567890abcdef'; // Example API key

  describe('encrypt', () => {
    it('should produce valid v1:iv:tag:ciphertext format', () => {
      const ciphertext = encrypt(plaintext, key);
      const parts = ciphertext.split(':');

      expect(parts).toHaveLength(4);
      expect(parts[0]).toBe('v1');
      expect(parts[1]).toHaveLength(24); // 12 bytes IV = 24 hex chars
      expect(parts[2]).toHaveLength(32); // 16 bytes tag = 32 hex chars
      expect(parts[3].length).toBeGreaterThan(0);
    });

    it('should produce different ciphertexts for same plaintext (IV randomness)', () => {
      const ciphertext1 = encrypt(plaintext, key);
      const ciphertext2 = encrypt(plaintext, key);

      expect(ciphertext1).not.toBe(ciphertext2);

      // But both should decrypt to same plaintext
      expect(decrypt(ciphertext1, key)).toBe(plaintext);
      expect(decrypt(ciphertext2, key)).toBe(plaintext);
    });

    it('should throw if key is not 32 bytes', () => {
      const wrongKey = crypto.randomBytes(16); // AES-128 key

      expect(() => encrypt(plaintext, wrongKey)).toThrow('Encryption key must be 32 bytes');
    });
  });

  describe('decrypt', () => {
    it('should decrypt to original plaintext (round-trip)', () => {
      const ciphertext = encrypt(plaintext, key);
      const decrypted = decrypt(ciphertext, key);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode plaintext', () => {
      const unicode = 'Clé secrète 中文 🔐';
      const ciphertext = encrypt(unicode, key);
      const decrypted = decrypt(ciphertext, key);

      expect(decrypted).toBe(unicode);
    });

    it('should throw if key is not 32 bytes', () => {
      const ciphertext = encrypt(plaintext, key);
      const wrongKey = crypto.randomBytes(16);

      expect(() => decrypt(ciphertext, wrongKey)).toThrow('Decryption key must be 32 bytes');
    });

    it('should throw if ciphertext format is invalid', () => {
      expect(() => decrypt('invalid', key)).toThrow('Invalid ciphertext format');
      expect(() => decrypt('v1:aaa:bbb', key)).toThrow('Invalid ciphertext format');
      expect(() => decrypt('v1:aaa:bbb:ccc:ddd', key)).toThrow('Invalid ciphertext format');
    });

    it('should throw if version is unsupported', () => {
      const ciphertext = encrypt(plaintext, key);
      const wrongVersion = ciphertext.replace('v1:', 'v2:');

      expect(() => decrypt(wrongVersion, key)).toThrow('Unsupported ciphertext version: v2');
    });

    it('should throw if IV length is invalid', () => {
      const ciphertext = encrypt(plaintext, key);
      const parts = ciphertext.split(':');
      const invalidIV = parts[1].substring(0, 20); // Truncate IV
      const malformed = `v1:${invalidIV}:${parts[2]}:${parts[3]}`;

      expect(() => decrypt(malformed, key)).toThrow('Invalid IV length');
    });

    it('should throw if tag length is invalid', () => {
      const ciphertext = encrypt(plaintext, key);
      const parts = ciphertext.split(':');
      const invalidTag = parts[2].substring(0, 20); // Truncate tag
      const malformed = `v1:${parts[1]}:${invalidTag}:${parts[3]}`;

      expect(() => decrypt(malformed, key)).toThrow('Invalid tag length');
    });

    it('should throw if auth tag is modified (tamper detection)', () => {
      const ciphertext = encrypt(plaintext, key);
      const parts = ciphertext.split(':');

      // Flip one bit in the tag
      const tagBytes = Buffer.from(parts[2], 'hex');
      tagBytes[0] ^= 0x01;
      const tamperedTag = tagBytes.toString('hex');

      const tampered = `v1:${parts[1]}:${tamperedTag}:${parts[3]}`;

      expect(() => decrypt(tampered, key)).toThrow('Decryption failed');
    });

    it('should throw if ciphertext is modified (tamper detection)', () => {
      const ciphertext = encrypt(plaintext, key);
      const parts = ciphertext.split(':');

      // Modify the encrypted payload
      const encryptedBytes = Buffer.from(parts[3], 'hex');
      encryptedBytes[0] ^= 0x01;
      const tamperedEncrypted = encryptedBytes.toString('hex');

      const tampered = `v1:${parts[1]}:${parts[2]}:${tamperedEncrypted}`;

      expect(() => decrypt(tampered, key)).toThrow('Decryption failed');
    });

    it('should throw if wrong key is used', () => {
      const ciphertext = encrypt(plaintext, key);
      const wrongKey = crypto.randomBytes(32);

      expect(() => decrypt(ciphertext, wrongKey)).toThrow('Decryption failed');
    });
  });

  describe('multiple encryptions', () => {
    it('should handle multiple sequential encrypt/decrypt cycles', () => {
      for (let i = 0; i < 10; i++) {
        const text = `api-key-${i}`;
        const encrypted = encrypt(text, key);
        const decrypted = decrypt(encrypted, key);
        expect(decrypted).toBe(text);
      }
    });

    it('should produce unique IVs across many encryptions', () => {
      const ivs = new Set<string>();

      for (let i = 0; i < 100; i++) {
        const ciphertext = encrypt(plaintext, key);
        const iv = ciphertext.split(':')[1];
        ivs.add(iv);
      }

      // All 100 IVs should be unique
      expect(ivs.size).toBe(100);
    });
  });
});
