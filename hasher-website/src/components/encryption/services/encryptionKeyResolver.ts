import { ENCRYPTION_VARIANT_GROUPS } from '../configs/encryptionConstants';
import { parseStateKey } from './encryptionStateKey';

export const resolveEncryptionMeta = (
  stateKey: string,
  keySizeByGroup: Record<string, number>,
  config: any
) => {
  const { variantKey, keySize: parsedKeySize } =
    parseStateKey(stateKey);

  const activeGroup = ENCRYPTION_VARIANT_GROUPS.find((g) =>
    g.variants.some((v) => v.key === variantKey)
  ) ?? ENCRYPTION_VARIANT_GROUPS[0];

  const activeKeySize = activeGroup.keySizeOptions
    ? (parsedKeySize ??
        keySizeByGroup[activeGroup.key] ??
        activeGroup.keySizeDefault ??
        activeGroup.keySizeOptions[0]?.value ??
        0)
    : 0;

  const effectiveKeyByteLength =
    activeGroup.keySizeOptions?.length
      ? activeKeySize
      : config.keyByteField?.byteLength ?? 0;

  const symmetricKeyId = activeGroup.keySizeOptions?.length
    ? `symmetric_${activeKeySize}`
    : 'symmetric';

  const publicKeyId = activeGroup.keySizeOptions?.length
    ? `publicKey_${activeKeySize}`
    : 'publicKey';

  const privateKeyId = activeGroup.keySizeOptions?.length
    ? `privateKey_${activeKeySize}`
    : 'privateKey';

  const symmetricKeyLabel = activeGroup.keySizeOptions?.length
    ? `${config.keyLabel} (${activeKeySize} bytes)`
    : config.keyLabel;

  return {
    variantKey,
    activeGroup,
    activeKeySize,
    effectiveKeyByteLength,
    symmetricKeyId,
    publicKeyId,
    privateKeyId,
    symmetricKeyLabel
  };
};