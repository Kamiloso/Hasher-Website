import { getConfigForVariant } from '../configs/encryptionConstants';
import { parseStateKey } from './encryptionStateKey';

export const resolveEncryptionMeta = (
  stateKey: string,
  keySizeByGroup: Record<string, number>
) => {
  const { variantKey, keySize: parsedKeySize } = parseStateKey(stateKey);

  const configContext = getConfigForVariant(variantKey);

  if (!configContext) {
    throw new Error(`Variant not found for key: ${variantKey}`);
  }

  const { group: activeGroup, activeKeyField } = configContext;

  const activeKeySize = activeGroup.keySizeOptions?.length
    ? (parsedKeySize ??
        keySizeByGroup[activeGroup.key] ??
        activeGroup.keySizeDefault ??
        activeGroup.keySizeOptions[0]?.value ??
        0)
    : 0;

  const effectiveKeyByteLength = activeGroup.keySizeOptions?.length
    ? activeKeySize
    : activeKeyField?.byteLength ?? 0;

  const symmetricKeyId = 'symmetric';
  const publicKeyId = 'publicKey';
  const privateKeyId = 'privateKey';

  const unit = activeGroup.mode === 'asymmetric' ? 'bits' : 'bytes';
  const symmetricKeyLabel = activeGroup.keySizeOptions?.length
    ? `${activeGroup.keyLabel} (${activeKeySize} ${unit})`
    : activeGroup.keyLabel;

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