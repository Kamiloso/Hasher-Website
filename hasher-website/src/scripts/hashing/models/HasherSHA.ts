import { getBytes, bufferToHex, concatBytes } from '../../../scripts/cryptoUtils';
import sha3 from 'js-sha3';
const { sha3_256 } = sha3;

export type ShaVariant = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' | 'SHA3-256';
export type ShaOperationMode = 'digest' | 'hmac' | 'pbkdf2';

export interface ShaConfig {
  variant: ShaVariant;
  mode: ShaOperationMode;
  salt?: string;
  hmacKey?: string;
  iterations?: number;
}

export interface ShaProvider {
  hash(plainText: string, config: ShaConfig): Promise<string>;
}

export class HasherSHA implements ShaProvider {

  /**
   * Prywatna metoda realizująca HMAC dla SHA3-256.
   */
  private hmacSha3_256(keyBytes: Uint8Array, messageBytes: Uint8Array): Uint8Array {
    const blockSize = 136;
    let k = keyBytes;

    if (k.length > blockSize) {
      k = new Uint8Array(sha3_256.create().update(k).array());
    }

    const paddedKey = new Uint8Array(blockSize);
    paddedKey.set(k);

    const iKeyPad = new Uint8Array(blockSize);
    const oKeyPad = new Uint8Array(blockSize);

    for (let i = 0; i < blockSize; i++) {
      iKeyPad[i] = paddedKey[i] ^ 0x36;
      oKeyPad[i] = paddedKey[i] ^ 0x5c;
    }

    const innerData = concatBytes(iKeyPad, messageBytes);
    const innerHash = new Uint8Array(sha3_256.create().update(innerData).array());

    const outerData = concatBytes(oKeyPad, innerHash);
    return new Uint8Array(sha3_256.create().update(outerData).array());
  }

  async hash(plainText: string, config: ShaConfig): Promise<string> {
    const { variant, mode } = config;

    try {
      // ====================================================================
      // 1. HMAC
      // ====================================================================
      if (mode === 'hmac') {
        if (!config.hmacKey) config.hmacKey = '';

        if (variant === 'SHA3-256') {
          const keyBytes = getBytes(config.hmacKey);
          const messageBytes = getBytes(plainText);
          const hmacResult = this.hmacSha3_256(keyBytes, messageBytes);
          return bufferToHex(hmacResult.buffer as ArrayBuffer);
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
      // 2. PBKDF2 
      // ====================================================================
      if (mode === 'pbkdf2') {
        if (!config.salt) {
          throw new Error("PBKDF2 mode requires salt.");
        }

        const passwordBytes = getBytes(plainText);
        const saltBytes = getBytes(config.salt);
        const iterations = config.iterations || 600000;

        if (variant === 'SHA3-256') {
          // Inicjalizacja soli zgodnie z RFC 2898
          const saltWithBlockIndex = new Uint8Array(saltBytes.length + 4);
          saltWithBlockIndex.set(saltBytes);
          saltWithBlockIndex[saltBytes.length + 3] = 1;

          let u = this.hmacSha3_256(passwordBytes, saltWithBlockIndex);
          const t = new Uint8Array(u);

          // Rozmiar porcji zapobiegający zamrożeniu przeglądarki
          const chunkSize = 5000; 

          for (let i = 2; i <= iterations; i++) {
            u = this.hmacSha3_256(passwordBytes, u);
            for (let j = 0; j < u.length; j++) {
              t[j] ^= u[j];
            }

            // Oddanie kontroli do głównego wątku co określoną liczbę iteracji
            if (i % chunkSize === 0) {
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          }

          return bufferToHex(t.buffer as ArrayBuffer);
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
      // 3. DIGEST
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