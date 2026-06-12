import * as forge from 'node-forge';

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

  const handleGenerate = async () => {
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
        
        if (fieldKey === 'nonce' || fieldKey === 'iv') {
          updateByteField(fieldKey, nextBytes);

        } else if (fieldKey === 'counter') {
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

    // --- 3. Pola tekstowe (Asymetryczne) ---
    if (action.outputKind === 'text') {
      
      // Obsługa generowania RSA w tle
      if (activeGroup.key === 'rsa') {
        const keySize = meta.activeKeySize || 2048;
        
        try {
          const keypair = await new Promise<forge.pki.rsa.KeyPair>((resolve, reject) => {
            forge.pki.rsa.generateKeyPair({ bits: keySize, workers: -1 }, (err, kp) => {
              if (err) reject(err);
              else resolve(kp);
            });
          });

          const pubPem = forge.pki.publicKeyToPem(keypair.publicKey);
          const privPem = forge.pki.privateKeyToPem(keypair.privateKey);

          action.fields.forEach((fieldKey: string) => {
            if (fieldKey === 'publicKey') {
              updateKeyText(resolveKeyId(fieldKey), pubPem);
            } else if (fieldKey === 'privateKey') {
              updateKeyText(resolveKeyId(fieldKey), privPem);
            }
          });
        } catch (error) {
          console.error('[RSA Generation Error]', error);
        }
        return;
      }

      // --- Rzeczywiste asynchroniczne generowanie ECC przez Web Crypto API ---
      if (activeGroup.key === 'ecc') {
        let namedCurve = 'P-256'; // Domyślny fallback
        
        if (meta.variantKey === 'ecc_p256') {
          namedCurve = 'P-256';
        } else if (meta.variantKey === 'ecc_p384') {
          namedCurve = 'P-384';
        }

        try {
          // Używamy ECDH jako uniwersalnej bazy do par kluczy szyfrujących ECC
          const keyPair = await window.crypto.subtle.generateKey(
            { name: "ECDH", namedCurve },
            true,
            ["deriveKey", "deriveBits"]
          );

          // Eksport sparowanych kluczy do natywnych formatów binarnych (SPKI / PKCS#8)
          const pubBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
          const privBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

          // Konwersja binarnych buforów ArrayBuffer na ciąg Base64
          const bufferToBase64 = (buffer: ArrayBuffer) => {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
          };

          // Formatowanie ciągu Base64 do bloków PEM o szerokości 64 znaków
          const formatPem = (b64: string, label: string) => {
            const lines = b64.match(/.{1,64}/g)?.join('\n') || b64;
            return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
          };

          const pubPem = formatPem(bufferToBase64(pubBuffer), 'PUBLIC KEY');
          const privPem = formatPem(bufferToBase64(privBuffer), 'PRIVATE KEY');

          action.fields.forEach((fieldKey: string) => {
            if (fieldKey === 'publicKey') {
              updateKeyText(resolveKeyId(fieldKey), pubPem);
            } else if (fieldKey === 'privateKey') {
              updateKeyText(resolveKeyId(fieldKey), privPem);
            }
          });
        } catch (error) {
          console.error(`[ECC ${namedCurve} Generation Error]`, error);
        }
        return;
      }
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