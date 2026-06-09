export const useEncryptionHandlers = ({
  configContext,
  mode,
  meta,
  updateCurrentState
}: any) => {

  const handleSetOutput = (val: string) => {
    updateCurrentState((s: any) => ({ ...s, output: val }));
  };

  const updateKeyBytes = (k: string, v: any) =>
    updateCurrentState((s: any) => ({
      ...s,
      keyBytes: { ...s.keyBytes, [k]: v }
    }));

  const updateKeyText = (k: string, v: any) =>
    updateCurrentState((s: any) => ({
      ...s,
      keyTextValues: { ...s.keyTextValues, [k]: v }
    }));

  const updateByteField = (k: string, v: any) =>
    updateCurrentState((s: any) => ({
      ...s,
      byteValues: { ...s.byteValues, [k]: v }
    }));

  const handleGenerate = () => {
    const action = configContext?.activeGenerateAction;
    if (!action) return;

    const { activeGroup, effectiveKeyByteLength, symmetricKeyId, publicKeyId, privateKeyId } = meta;

    const resolveKeyId = (fieldKey: string) => {
      if (fieldKey === 'symmetric') return symmetricKeyId;
      if (activeGroup.keySizeOptions?.length) {
        if (fieldKey === 'publicKey') return publicKeyId;
        if (fieldKey === 'privateKey') return privateKeyId;
      }
      return fieldKey;
    };

    const resolveByteLength = (fieldKey: string) => {
      if (fieldKey === 'symmetric') return effectiveKeyByteLength;
      if (fieldKey === 'nonce' || fieldKey === 'iv') {
        return configContext.variant.byteFields?.find((f: any) => f.key === fieldKey)?.byteLength ?? 0;
      }
      return effectiveKeyByteLength;
    };

    const generateRandomBytes = (length: number): string[] => {
      if (length <= 0) return [];
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0').toUpperCase());
    };

    // --- 1. Pola bajtowe (AES, ChaCha, ECC, IV, Nonce) ---
    if (action.outputKind === 'bytes') {
      action.fields.forEach((fieldKey: string) => {
        const nextBytes = generateRandomBytes(resolveByteLength(fieldKey));
        
        if (
          fieldKey === 'nonce' ||
          fieldKey === 'iv'
        ) {
          updateByteField(fieldKey, nextBytes);

        } else if (
          fieldKey === 'counter'
        ) {
          // Inicjalizujemy licznik zerami (00 00 00 00)
          updateByteField(fieldKey, ['00', '00', '00', '00']);

        } else {
          updateKeyBytes(resolveKeyId(fieldKey), nextBytes);
        }
      });
      return;
    }

    // --- 2. Pola liczbowe (Caesar) ---
    if (action.outputKind === 'number') {
      action.fields.forEach((fieldKey: string) => {
        if (activeGroup.key === 'caesar') {
          const randomShift = Math.floor(Math.random() * 26);
          updateKeyText(resolveKeyId(fieldKey), randomShift.toString());
        }
      });
      return;
    }

    // --- 3. Pola tekstowe (Mock RSA) ---
    if (action.outputKind === 'text') {
      action.fields.forEach((fieldKey: string) => {
        
        if (activeGroup.key === 'rsa') {
          const keySize = meta.activeKeySize || 2048;
          const isPublic = fieldKey === 'publicKey';
          
          const mockText = isPublic
            ? `-----BEGIN PUBLIC KEY-----\n[Mocked RSA-${keySize} Public Key Data]\n-----END PUBLIC KEY-----`
            : `-----BEGIN PRIVATE KEY-----\n[Mocked RSA-${keySize} Private Key Data]\n-----END PRIVATE KEY-----`;
            
          updateKeyText(resolveKeyId(fieldKey), mockText);
        }

        if (activeGroup.key === 'ecc') {
          const curve = meta.variantKey === 'ecc_p256' ? 'secp256r1' : 'secp384r1';
          const isPublic = fieldKey === 'publicKey';

          const mockText = isPublic
            ? `-----BEGIN PUBLIC KEY-----\n[Mocked ECC-${curve} Public Key Data]\n-----END PUBLIC KEY-----`
            : `-----BEGIN PRIVATE KEY-----\n[Mocked ECC-${curve} Private Key Data]\n-----END PRIVATE KEY-----`;

          updateKeyText(resolveKeyId(fieldKey), mockText);
        }

      });
    }
  };

  return {
    handleSetOutput,
    updateKeyBytes,
    updateKeyText,
    updateByteField,
    handleGenerate
  };
};