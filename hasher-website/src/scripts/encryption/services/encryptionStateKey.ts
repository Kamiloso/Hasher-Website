import { ENCRYPTION_REGISTRY } from '../configs/encryptionConstants';

export const buildStateKey = (variantKey: string, keySize?: number) =>
  keySize ? `${variantKey}::${keySize}` : variantKey;

export const parseStateKey = (stateKey: string) => {
  const [variantKey, sizeText] = stateKey.split('::');

  return {
    variantKey,
    keySize: sizeText ? Number(sizeText) : undefined
  };
};

export const ENCRYPTION_STATE_KEYS =
  ENCRYPTION_REGISTRY.flatMap((group) =>
    group.variants.flatMap((variant) =>
      group.keySizeOptions?.length
        ? group.keySizeOptions.map((option) =>
            buildStateKey(variant.key, option.value)
          )
        : [variant.key]
    )
  );