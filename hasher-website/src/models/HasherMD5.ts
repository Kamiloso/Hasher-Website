import { getBytes, concatBytes } from '../utils/cryptoUtils';
import md5 from 'js-md5';

export type Md5OperationMode = 'digest' | 'hmac';

export interface Md5Config {
  mode: Md5OperationMode;

  // Optional but used for 'digest' to add extra security
  salt?: string;

  // Required for 'hmac' to provide the secret key for signing
  hmacKey?: string;
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
          throw new Error("HMAC mode requires secret key (hmacKey).");
        }

        return (md5 as any).hmac(config.hmacKey, plainText);
      }

      // ====================================================================
      // 2. DIGEST (Classic hash function)
      // ====================================================================
      if (mode === 'digest') {
        let dataToHash: Uint8Array | string = plainText;

        if (config.salt) {
          const saltBytes = getBytes(config.salt);
          const plainTextBytes = getBytes(plainText);
          dataToHash = concatBytes(saltBytes, plainTextBytes);
        }

        return md5(dataToHash);
      }

      throw new Error(`Unsupported operation mode: ${mode}`);

    } catch (error) {
      console.error(`[HasherMD5] Error in mode ${mode}:`, error);
      throw error;
    }
  }
}

export const md5Algorithm = new HasherMD5();