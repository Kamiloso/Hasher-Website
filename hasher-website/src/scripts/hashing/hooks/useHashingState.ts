import { useAlgorithmStateStore } from '../../../scripts/hooks/useAlgorithmStateStore';
import { createHashFormState, type HashFormState } from '../models/cryptoForms';
import { ALGORITHM_KEYS, getAlgorithmConfig } from '../configs/hashingConstants';

export const useHashingState = () => {
  return useAlgorithmStateStore<HashFormState>(
    ALGORITHM_KEYS,
    (algo) => {
      const config =
        getAlgorithmConfig(algo) ??
        getAlgorithmConfig(ALGORITHM_KEYS[0] ?? '');

      return createHashFormState({
        defaultSalt: config?.defaultSalt ?? '',
        defaultKdf: config?.defaultKdf ?? 'none',
        defaultHmacKey: config?.defaultHmacKey ?? '',
        defaultArgon2MemoryKb: config?.argon2Params?.defaultMemoryKb,
        defaultArgon2Parallelism: config?.argon2Params?.defaultParallelism,
        defaultArgon2TimeCost: config?.argon2Params?.defaultTimeCost
      });
    }
  );
};