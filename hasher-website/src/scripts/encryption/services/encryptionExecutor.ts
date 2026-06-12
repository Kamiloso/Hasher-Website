import { aesAlgorithm } from '../models/EncryptorAes';
import { chaChaAlgorithm } from '../models/EncryptorChaCha';
import { rsaAlgorithm } from '../models/EncryptorRsa';
import { eccAlgorithm } from '../models/EncryptorEcc';
import { caesarAlgorithm } from '../models/EncryptorCaesar';

import { hexToBuffer } from '../../cryptoUtils';

// Helper zamieniający tablicę hexów na Uint8Array przy użyciu Twojego utila
const hexArrayToBytes = (hexArray: string[] | undefined): Uint8Array => {
  if (!hexArray || hexArray.length === 0) return new Uint8Array(0);
  return hexToBuffer(hexArray.join(''));
};

export const executeEncryption = async (
  activeGroupKey: string,
  encryptionAlgo: string,
  state: any
) => {
  
  // ====================================================================
  // 1. AES (GCM, CBC, CTR)
  // ====================================================================
  if (activeGroupKey === 'aes') {
    return await aesAlgorithm.process(state.encryptionInput, {
      variant: encryptionAlgo,
      key: hexArrayToBytes(state.keyBytes?.symmetric),
      iv: hexArrayToBytes(state.byteValues?.iv),
      nonce: hexArrayToBytes(state.byteValues?.nonce),
      mode: state.mode
    });
  }

  // ====================================================================
  // 2. ChaCha
  // ====================================================================
  if (activeGroupKey === 'chacha') {
    return await chaChaAlgorithm.encrypt(state.encryptionInput, {
      variant: encryptionAlgo,
      key: hexArrayToBytes(state.keyBytes?.symmetric),
      nonce: hexArrayToBytes(state.byteValues?.nonce),
      counter: hexArrayToBytes(state.byteValues?.counter),
      mode: state.mode
    });
  }

  // ====================================================================
  // 3. RSA
  // ====================================================================
  if (activeGroupKey === 'rsa') {
    return await rsaAlgorithm.encrypt(state.encryptionInput, {
      variant: encryptionAlgo,
      publicKey: state.keyTextValues?.publicKey,
      privateKey: state.keyTextValues?.privateKey,
      mode: state.mode
    });
  }

  // ====================================================================
  // 4. ECC
  // ====================================================================
  if (activeGroupKey === 'ecc') {
    return await eccAlgorithm.encrypt(state.encryptionInput, {
      variant: encryptionAlgo,
      publicKey: hexArrayToBytes(state.keyBytes?.publicKey),
      mode: state.mode
    });
  }

  // ====================================================================
  // 5. Caesar
  // ====================================================================
  if (activeGroupKey === 'caesar') {
    const shift = parseInt(state.keyTextValues?.symmetric || '0', 10);
    return caesarAlgorithm.encrypt(state.encryptionInput, {
      variant: encryptionAlgo,
      shift,
      mode: state.mode
    });
  }

  return `Algorithm ${activeGroupKey} is not hooked up yet!`;
};