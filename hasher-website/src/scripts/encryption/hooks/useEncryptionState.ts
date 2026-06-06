import { useState } from 'react';
import { useAlgorithmStateStore } from '../../../scripts/hooks/useAlgorithmStateStore';
import { ENCRYPTION_STATE_KEYS } from '../services/encryptionStateKey';
import { ENCRYPTION_DATA } from '../configs/encryptionConstants';

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
    (key) => {
      const base = createEncryptionFormState();
      const { variantKey } = key.includes('::')
        ? { variantKey: key.split('::')[0] }
        : { variantKey: key };

      const config = (ENCRYPTION_DATA as any)[variantKey];

      if (!config) return base;

      const byteValues: Record<string, string[]> = {
        ...(base.byteValues ?? {})
      };

      (config.byteFields ?? []).forEach((f: any) => {
        byteValues[f.key] ??= [];
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