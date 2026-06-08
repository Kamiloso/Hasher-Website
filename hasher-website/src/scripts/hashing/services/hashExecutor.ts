import { shaAlgorithm } from '../models/HasherSHA';
import { md5Algorithm } from '../models/HasherMD5';
import { crcAlgorithm } from '../models/HasherCRC';
import { argonAlgorithm, type ArgonVariant } from '../models/HasherArgon';

import { getStrictShaVariant } from './shaVariantMapper';

export const executeHash = async (
  activeGroupKey: string,
  hashAlgo: string,
  state: any
) => {

  // ====================================================================
  // 1. SHA
  // ====================================================================
  if (activeGroupKey === 'sha') {
    const mode =
      state.kdf === 'pbkdf2'
        ? 'pbkdf2'
        : state.kdf === 'hmac'
        ? 'hmac'
        : 'digest';

    return shaAlgorithm.hash(
      state.hashInputText,
      {
        variant: getStrictShaVariant(hashAlgo),
        mode,
        salt: state.salt || undefined,
        iterations: state.iterations || 600000,
        hmacKey: state.hmacKey
      }
    );
  }

  // ====================================================================
  // 2. MD5
  // ====================================================================
  if (activeGroupKey === 'md5') {
    if (
      state.kdf !== 'none' &&
      state.kdf !== 'hmac' &&
      state.kdf !== 'pbkdf2'
    ) {
      throw new Error("MD5 algorithm does not support this KDF.");
    }

    if (state.kdf === 'hmac') {
      if (!state.hmacKey) {
        throw new Error('Wprowadź tajny klucz (Secret Key) dla trybu HMAC.');
      }
      return md5Algorithm.hash(state.hashInputText, {
        mode: 'hmac',
        hmacKey: state.hmacKey
      });
    }

    if (state.kdf === 'pbkdf2') {
      if (!state.salt) {
        throw new Error('Wprowadź sól dla trybu PBKDF2.');
      }
      return md5Algorithm.hash(state.hashInputText, {
        mode: 'pbkdf2',
        salt: state.salt,
        iterations: state.iterations || 600000
      });
    }

    return md5Algorithm.hash(state.hashInputText, {
      mode: 'digest',
      salt: state.salt || undefined
    });
  }

  // ====================================================================
  // 3. CRC32
  // ====================================================================
  if (activeGroupKey === 'crc32') {
    if (state.kdf !== 'none') {
      throw new Error("Algorytm CRC32 nie obsługuje funkcji KDF.");
    }
    return crcAlgorithm.hash(state.hashInputText, {
      mode: 'digest'
    });
  }

  // ====================================================================
  // 4. ARGON2
  // ====================================================================
  if (activeGroupKey === 'argon2') {
    if (!state.salt) {
      throw new Error('Algorytm Argon2 wymaga podania soli (salt).');
    }

    const memoryKb = state.argon2MemoryKb || 65536;
    const timeCost = state.argon2TimeCost || 3;
    const parallelism = state.argon2Parallelism || 1;


    return argonAlgorithm.hash(state.hashInputText, {
      mode: 'kdf',
      variant: hashAlgo as ArgonVariant,
      salt: state.salt,
      memoryKb: memoryKb,
      timeCost: timeCost, 
      parallelism: parallelism, 
      hashLength: state.hashLength || 32 // Domyślnie 32 bajty
    });
  }

  return `Algorithm ${activeGroupKey} is not hooked up yet!`;
};