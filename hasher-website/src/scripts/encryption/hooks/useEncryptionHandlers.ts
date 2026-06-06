import { runEncryptionGeneration } from '../services/encryptionGenerator';

export const useEncryptionHandlers = ({
  config,
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
    if (!config?.generateAction) return;

    runEncryptionGeneration({
      config,
      mode,
      activeGroup: meta.activeGroup,
      resolveByteLength: (fieldKey: string) => {
        if (fieldKey === 'symmetric') return meta.effectiveKeyByteLength;
        
        if (fieldKey === 'nonce' || fieldKey === 'iv') {
          return config.byteFields?.find((f: any) => f.key === fieldKey)?.byteLength ?? 0;
        }
        
        return meta.effectiveKeyByteLength;
      },
      updateByteField,
      updateKeyBytes,
      updateKeyText,
      keyIds: {
        symmetricKeyId: meta.symmetricKeyId,
        publicKeyId: meta.publicKeyId,
        privateKeyId: meta.privateKeyId
      }
    });
  };

  return {
    handleSetOutput,
    updateKeyBytes,
    updateKeyText,
    updateByteField,
    handleGenerate
  };
};