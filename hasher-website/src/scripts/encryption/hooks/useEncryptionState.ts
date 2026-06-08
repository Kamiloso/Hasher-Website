import { useState } from 'react';
import { useAlgorithmStateStore } from '../../../scripts/hooks/useAlgorithmStateStore';
import { ENCRYPTION_STATE_KEYS, parseStateKey } from '../services/encryptionStateKey';
import { getConfigForVariant } from '../configs/encryptionConstants';

import {
  createEncryptionFormState,
  type EncryptionFormState
} from '../models/cryptoForms';

export const useEncryptionState = () => {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [keySizeByGroup, setKeySizeByGroup] = useState<
    Record<string, number>
  >({});

  const store = useAlgorithmStateStore<EncryptionFormState>(
    ENCRYPTION_STATE_KEYS,
    (stateKey) => {
      const base = createEncryptionFormState();
      const { variantKey } = parseStateKey(stateKey);

      const configContext = getConfigForVariant(variantKey);
      if (!configContext) return base;

      const byteValues: Record<string, string[]> = {
        ...(base.byteValues ?? {})
      };

      configContext.variant.byteFields.forEach((field) => {
        if (field.key) {
          byteValues[field.key] ??= [];
        }
      });

      const keyBytes = { ...(base.keyBytes ?? {}) };
      keyBytes.symmetric ??= [];
      keyBytes.publicKey ??= [];
      keyBytes.privateKey ??= [];

      return {
        ...base,
        byteValues,
        keyBytes
      };
    }
  );

  return {
    mode,
    setMode,
    keySizeByGroup,
    setKeySizeByGroup,
    ...store
  };
};