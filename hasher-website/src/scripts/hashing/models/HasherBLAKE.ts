import { getBytes, bufferToHex, concatBytes } from '../../../scripts/cryptoUtils';
// Importujemy algorytmy z bezproblemowej paczki @noble/hashes
import { blake2b } from '@noble/hashes/blake2.js';
import { blake3 } from '@noble/hashes/blake3.js';

export type BlakeVariant = 'blake2b' | 'blake3';
export type BlakeOperationMode = 'pbkdf2' | 'digest' | 'hmac';

export interface BlakeConfig {
  variant: BlakeVariant;
  mode: BlakeOperationMode;
  salt?: string;
  hmacKey?: string;
  iterations?: number;
}

export interface BlakeProvider {
  hash(plainText: string, config: BlakeConfig): Promise<string>;
}

export class HasherBLAKE implements BlakeProvider {

  /**
   * Główna metoda hashująca, stanowiąca abstrakcję dla różnych wariantów BLAKE.
   */
  private coreHash(variant: BlakeVariant, data: Uint8Array): Uint8Array {
    if (variant === 'blake2b') {
      // BLAKE2b domyślnie generuje 64 bajty (512 bitów)
      return blake2b(data, { dkLen: 64 });
    } else if (variant === 'blake3') {
      // BLAKE3 domyślnie generuje 32 bajty (256 bitów)
      return blake3(data);
    }
    throw new Error(`Unsupported BLAKE variant: ${variant}`);
  }

  /**
   * Prywatna metoda realizująca standardowy HMAC (RFC 2104) dla rodziny BLAKE.
   */
  private hmacBlake(variant: BlakeVariant, keyBytes: Uint8Array, messageBytes: Uint8Array): Uint8Array {
    // Rozmiar bloku wewnętrznego: 128 bajtów dla BLAKE2b, 64 bajty dla BLAKE3
    const blockSize = variant === 'blake2b' ? 128 : 64;
    let k = keyBytes;

    if (k.length > blockSize) {
      k = this.coreHash(variant, k);
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
    const innerHash = this.coreHash(variant, innerData);

    const outerData = concatBytes(oKeyPad, innerHash);
    return this.coreHash(variant, outerData);
  }

  async hash(plainText: string, config: BlakeConfig): Promise<string> {
    const { variant, mode } = config;

    try {
      // ====================================================================
      // 1. HMAC
      // ====================================================================
      if (mode === 'hmac') {
        if (!config.hmacKey) config.hmacKey = '';

        const keyBytes = getBytes(config.hmacKey);
        const messageBytes = getBytes(plainText);
        
        const hmacResult = this.hmacBlake(variant, keyBytes, messageBytes);
        return bufferToHex(hmacResult.buffer as ArrayBuffer);
      }

      // ====================================================================
      // 2. PBKDF2 
      // ====================================================================
      if (mode === 'pbkdf2') {
        if (!config.salt) throw new Error("PBKDF2 mode requires salt.");

        const passwordBytes = getBytes(plainText);
        const saltBytes = getBytes(config.salt);
        const iterations = config.iterations || 600000;

        // Inicjalizacja soli zgodnie z RFC 2898
        const saltWithBlockIndex = new Uint8Array(saltBytes.length + 4);
        saltWithBlockIndex.set(saltBytes);
        saltWithBlockIndex[saltBytes.length + 3] = 1;

        let u = this.hmacBlake(variant, passwordBytes, saltWithBlockIndex);
        const t = new Uint8Array(u);

        // Rozmiar porcji zapobiegający zamrożeniu głównego wątku przeglądarki
        const chunkSize = 5000; 

        for (let i = 2; i <= iterations; i++) {
          u = this.hmacBlake(variant, passwordBytes, u);
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
      // 3. DIGEST
      // ====================================================================
      if (mode === 'digest') {
        let dataToHash = getBytes(plainText);

        if (config.salt) {
          const saltBytes = getBytes(config.salt);
          dataToHash = concatBytes(saltBytes, dataToHash);
        }

        const hashBuffer = this.coreHash(variant, dataToHash);
        return bufferToHex(hashBuffer.buffer as ArrayBuffer);
      }

      throw new Error(`Unsupported operation mode: ${mode}`);

    } catch (error) {
      console.error(`[HasherBLAKE] Error in mode ${mode} with variant ${variant}:`, error);
      throw error;
    }
  }
}

export const blakeAlgorithm = new HasherBLAKE();