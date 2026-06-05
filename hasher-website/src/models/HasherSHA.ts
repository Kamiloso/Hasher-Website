import { getBytes, bufferToHex, concatBytes } from '../utils/cryptoUtils';
import sha3 from 'js-sha3';
const { sha3_256 } = sha3;

export type ShaVariant = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' | 'SHA3-256';
export type ShaOperationMode = 'digest' | 'hmac' | 'pbkdf2';

export interface ShaConfig {
  variant: ShaVariant;
  mode: ShaOperationMode;

  // Optional but required by 'pbkdf2'
  // Can be used for 'digest' to add extra security
  salt?: string;

  // Required for 'hmac' to provide the secret key for signing
  hmacKey?: string;

  // Number of iterations used only for 'pbkdf2'
  iterations?: number;
}

export interface ShaProvider {
  hash(plainText: string, config: ShaConfig): Promise<string>;
}

export class HasherSHA implements ShaProvider {

  async hash(plainText: string, config: ShaConfig): Promise<string> {
    const { variant, mode } = config;

    try {
      // ====================================================================
      // 1. HMAC (Hash-based Message Authentication Code)
      // ====================================================================
      if (mode === 'hmac') {
        if (!config.hmacKey) throw new Error("HMAC mode requires secret key (hmacKey).");

        if (variant === 'SHA3-256') {
          return (sha3_256 as any).hmac(config.hmacKey, plainText);
        }

        const keyBytes = getBytes(config.hmacKey);
        const dataBytes = getBytes(plainText);

        const cryptoKey = await window.crypto.subtle.importKey(
            "raw",
            keyBytes as unknown as BufferSource,
            { name: "HMAC", hash: variant },
            false,
            ["sign"]
        );

        const signatureBuffer = await window.crypto.subtle.sign(
            "HMAC",
            cryptoKey,
            dataBytes as unknown as BufferSource
        );

        return bufferToHex(signatureBuffer as ArrayBuffer);
      }

      // ====================================================================
      // 2. PBKDF2 (Password-Based Key Derivation Function 2)
      // ====================================================================
      if (mode === 'pbkdf2') {
        if (!config.salt) throw new Error("PBKDF2 mode requires salt.");

        const passwordBytes = getBytes(plainText);
        const saltBytes = getBytes(config.salt);
        const iterations = config.iterations || 600000; // Secure minimun by OWASP

        if (variant === 'SHA3-256') {
          throw new Error("PBKDF2 does not support SHA3-256 variant.");
        }

        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            passwordBytes as unknown as BufferSource,
            { name: "PBKDF2" },
            false,
            ["deriveBits"]
        );

        let hashLengthBits = 256;
        if (variant === 'SHA-1') hashLengthBits = 160;
        if (variant === 'SHA-384') hashLengthBits = 384;
        if (variant === 'SHA-512') hashLengthBits = 512;

        const derivedBits = await window.crypto.subtle.deriveBits(
            {
              name: "PBKDF2",
              salt: saltBytes as unknown as BufferSource,
              iterations: iterations,
              hash: variant
            },
            keyMaterial,
            hashLengthBits
        );

        return bufferToHex(derivedBits as ArrayBuffer);
      }

      // ====================================================================
      // 3. DIGEST (Classic hash function)
      // ====================================================================
      if (mode === 'digest') {
        let dataToHash = getBytes(plainText);

        if (config.salt) {
          const saltBytes = getBytes(config.salt);
          dataToHash = concatBytes(saltBytes, dataToHash);
        }

        if (variant === 'SHA3-256') {
          return sha3_256(dataToHash);
        }

        const hashBuffer = await window.crypto.subtle.digest(
            variant,
            dataToHash as unknown as BufferSource
        );

        return bufferToHex(hashBuffer as ArrayBuffer);
      }

      throw new Error(`Unsupported operation mode: ${mode}`);

    } catch (error) {
      console.error(`[HasherSHA] Error in mode ${mode} with variant ${variant}:`, error);
      throw error;
    }
  }
}

export const shaAlgorithm = new HasherSHA();