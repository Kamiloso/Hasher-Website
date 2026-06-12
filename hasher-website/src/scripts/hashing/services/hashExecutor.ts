import { shaAlgorithm } from '../models/HasherSHA';
import { md5Algorithm } from '../models/HasherMD5';
import { crcAlgorithm } from '../models/HasherCRC';
import { argonAlgorithm, type ArgonVariant } from '../models/HasherArgon';
import { blakeAlgorithm, type BlakeVariant } from '../models/HasherBLAKE';

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
      return md5Algorithm.hash(
        state.hashInputText,
        {
          mode: 'hmac',
          hmacKey: state.hmacKey || ''
        }
      );
    }

    if (state.kdf === 'pbkdf2') {
      if (!state.salt) {
        throw new Error('Enter salt for PBKDF2 mode.');
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
      throw new Error("CRC32 algorithm does not support KDF function.");
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
      throw new Error('Argon2 algorithm requires a salt to be provided.');
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
      hashLength: state.hashLength || 32 // Default is 32 bytes
    });
  }

  // ====================================================================
  // 5. BLAKE2
  // ====================================================================
  if (activeGroupKey === 'blake') {
    const mode =
      state.kdf === 'pbkdf2'
        ? 'pbkdf2'
        : state.kdf === 'hmac'
        ? 'hmac'
        : 'digest';

    return blakeAlgorithm.hash(
      state.hashInputText,
      {
        variant: hashAlgo as BlakeVariant,
        mode,
        salt: state.salt || undefined,
        iterations: state.iterations || 600000,
        hmacKey: state.hmacKey
      }
    );
  }

  return `Algorithm ${activeGroupKey} is not hooked up yet!`;
};