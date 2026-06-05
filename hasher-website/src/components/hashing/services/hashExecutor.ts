import { shaAlgorithm } from '../models/HasherSHA';
import { md5Algorithm } from '../models/HasherMD5';
import { crcAlgorithm } from '../models/HasherCRC';

import { getStrictShaVariant } from './shaVariantMapper';

export const executeHash = async (
  activeGroupKey: string,
  hashAlgo: string,
  state: any
) => {

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
        iterations:
          state.iterations || 600000,
        hmacKey: state.hmacKey
      }
    );
  }

  if (activeGroupKey === 'md5') {

    if (
      state.kdf !== 'none' &&
      state.kdf !== 'hmac'
    ) {
      throw new Error(
        "MD5 algorithm does not support this KDF."
      );
    }

    if (state.kdf === 'hmac') {

      if (!state.hmacKey) {
        throw new Error(
          'Wprowadź tajny klucz (Secret Key) dla trybu HMAC.'
        );
      }

      return md5Algorithm.hash(
        state.hashInputText,
        {
          mode: 'hmac',
          hmacKey: state.hmacKey
        }
      );
    }

    return md5Algorithm.hash(
      state.hashInputText,
      {
        mode: 'digest',
        salt: state.salt || undefined
      }
    );
  }

  if (activeGroupKey === 'crc32') {

    if (state.kdf !== 'none') {
      throw new Error(
        "Algorytm CRC32 nie obsługuje funkcji KDF."
      );
    }

    return crcAlgorithm.hash(
      state.hashInputText,
      {
        mode: 'digest'
      }
    );
  }

  return `Algorithm ${activeGroupKey} is not hooked up yet!`;
};