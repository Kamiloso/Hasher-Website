import { getBytes, concatBytes, bufferToHex, hexToBuffer } from '../../../scripts/cryptoUtils';
import md5 from 'js-md5';

export type Md5OperationMode = 'digest' | 'hmac' | 'pbkdf2';

export interface Md5Config {
  mode: Md5OperationMode;

  // Optional but used for 'digest' to add extra security, required for 'pbkdf2'
  salt?: string;

  // Required for 'hmac' to provide the secret key for signing
  hmacKey?: string;

  // Number of iterations used only for 'pbkdf2'
  iterations?: number;
}

export interface Md5Provider {
  hash(plainText: string, config: Md5Config): Promise<string>;
}

export class HasherMD5 implements Md5Provider {
  async hash(plainText: string, config: Md5Config): Promise<string> {
    const { mode } = config;

    try {
      // ====================================================================
      // 1. HMAC (Hash-based Message Authentication Code)
      // ====================================================================
      if (mode === 'hmac') {
        if (!config.hmacKey) {
          config.hmacKey = '';
        }

        return (md5 as any).hmac(config.hmacKey, plainText);
      }

      // ====================================================================
      // 2. PBKDF2 (Password-Based Key Derivation Function 2)
      // ====================================================================
      if (mode === 'pbkdf2') {
        if (!config.salt) {
          throw new Error("PBKDF2 mode requires salt.");
        }

        const saltBytes = getBytes(config.salt);
        const iterations = config.iterations || 600000;

        // Zgodnie z RFC 2898 dodajemy numer bloku (4 bajty, Big Endian) do soli.
        const saltWithBlockIndex = new Uint8Array(saltBytes.length + 4);
        saltWithBlockIndex.set(saltBytes);
        saltWithBlockIndex[saltBytes.length + 3] = 1; // Numer bloku: 1

        const u1Hex = (md5 as any).hmac(plainText, saltWithBlockIndex);
        let u = hexToBuffer(u1Hex);
        const t = new Uint8Array(u);

        // Rozmiar porcji zapobiegający zamrożeniu przeglądarki
        const chunkSize = 5000;

        for (let i = 2; i <= iterations; i++) {
          const nextUHex = (md5 as any).hmac(plainText, u);
          u = hexToBuffer(nextUHex);
          
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

      // ====================================================================
      // 3. DIGEST (Classic hash function)
      // ====================================================================
      if (mode === 'digest') {
        let dataToHash: Uint8Array | string = plainText;

        if (config.salt) {
          const saltBytes = getBytes(config.salt);
          const plainTextBytes = getBytes(plainText);
          dataToHash = concatBytes(saltBytes, plainTextBytes);
        }

        return (md5 as any)(dataToHash);
      }

      throw new Error(`Unsupported operation mode: ${mode}`);

    } catch (error) {
      console.error(`[HasherMD5] Error in mode ${mode}:`, error);
      throw error;
    }
  }
}

export const md5Algorithm = new HasherMD5();