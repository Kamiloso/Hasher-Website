import { generateByteSequence, generateTextSequence } from '../../../scripts/cryptoGenerators';

export const runEncryptionGeneration = ({
  config,
  mode,
  activeGroup,
  resolveByteLength,
  updateByteField,
  updateKeyBytes,
  updateKeyText,
  keyIds
}: any) => {
  const action = config.generateAction;
  if (!action) return;

  const { symmetricKeyId, publicKeyId, privateKeyId } = keyIds;

  const resolveKeyId = (fieldKey: string) => {
    if (fieldKey === 'symmetric') return symmetricKeyId;

    if (activeGroup.keySizeOptions?.length) {
      if (fieldKey === 'publicKey') return publicKeyId;
      if (fieldKey === 'privateKey') return privateKeyId;
    }

    return fieldKey;
  };

  const targetFields =
    mode === 'decrypt'
      ? action.fields.filter(
          (f: string) =>
            f === 'symmetric' || f === 'privateKey'
        )
      : action.fields;

  if (action.outputKind === 'bytes') {
    targetFields.forEach((fieldKey: string) => {
      const nextBytes =
        generateByteSequence(resolveByteLength(fieldKey));

      if (fieldKey === 'nonce' || fieldKey === 'iv') {
        updateByteField(fieldKey, nextBytes);
        return;
      }

      updateKeyBytes(resolveKeyId(fieldKey), nextBytes);
    });

    return;
  }

  targetFields.forEach((fieldKey: string) => {
    const generatedText =
      generateTextSequence(
        fieldKey === 'publicKey'
          ? 'PUBLIC KEY'
          : 'PRIVATE KEY'
      );

    updateKeyText(resolveKeyId(fieldKey), generatedText);
  });
};