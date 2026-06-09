import { ActionButton, LongOutputField } from '../../components/FormControls';
import EncryptionView from './EncryptionView';

import { getConfigForVariant } from './configs/encryptionConstants';
import { useEncryptionState } from './hooks/useEncryptionState';
import { useEncryptionActions } from './hooks/useEncryptionAction';
import { useEncryptionHandlers } from './hooks/useEncryptionHandlers';
import { resolveEncryptionMeta } from './services/encryptionKeyResolver';
import { parseStateKey } from './services/encryptionStateKey';
import { EncryptionAlgorithmSelector } from './EncryptionAlgorithmSelector';

import { buildEncryptionControls } from './EncryptionControls';
import { executeEncryption } from './services/encryptionExecutor';

const EncryptionPresenter = () => {
  const {
    mode,
    keySizeByGroup,
    activeKey,
    currentState,
    setActiveKey,
    setMode,
    updateCurrentState
  } = useEncryptionState();

  const { compute, isComputing } = useEncryptionActions();
  const { variantKey } = parseStateKey(activeKey ?? '');

  const configContext = getConfigForVariant(variantKey);
  if (!configContext) {
    return null;
  }

  const meta = resolveEncryptionMeta(
    activeKey,
    keySizeByGroup
  );

  const {
    handleSetOutput,
    updateKeyBytes,
    updateKeyText,
    updateByteField,
    handleGenerate
  } = useEncryptionHandlers({ configContext, mode, meta, updateCurrentState });

  const {
    keyControls,
    byteFields,
    mainInput,
    saltControl,
    counterControl
  } = buildEncryptionControls({
    mode,
    algo: activeKey,
    configContext,
    currentState,
    effectiveKeyByteLength: meta.effectiveKeyByteLength,
    symmetricKeyId: meta.symmetricKeyId,
    symmetricKeyLabel: meta.symmetricKeyLabel,
    publicKeyId: meta.publicKeyId,
    privateKeyId: meta.privateKeyId,
    updateKeyBytes,
    updateKeyText,
    updateByteField,
    updateCurrentState
  });

  const theoryBlocks = configContext.group.theory;

  return (
    <EncryptionView
      title="Data Encryption / Decryption"
      algorithmSelect={
        <EncryptionAlgorithmSelector
            activeGroup={meta.activeGroup}
            algo={meta.variantKey}
            activeKeySize={meta.activeKeySize}
            setStateKey={setActiveKey}
            setMode={setMode}
            mode={mode}
        />
      }
      keySelectionControl={null}
      mainInput={mainInput}
      generateAction={
        configContext.activeGenerateAction && (
          mode === 'encrypt' ||
          configContext.group.mode === 'asymmetric'
        ) ? (
          <div className="control-group">
            <ActionButton variant="primary" onClick={handleGenerate}>
              {configContext.activeGenerateAction.label}
            </ActionButton>
          </div>
        ) : null
      }
      keyControls={keyControls}
      byteFields={byteFields}
      counterControl={counterControl}
      saltControl={saltControl}
      actionButtons={
        <div className="action-buttons">
          <ActionButton 
            variant="primary" 
            onClick={() => {
              compute(
              {
                executor: async () =>
                  executeEncryption(
                    meta.activeGroup.key,  // ex. "aes", "rsa", "chacha"
                    meta.variantKey,       // ex. "aes-gcm"
                    {
                      ...currentState,
                      mode
                    }
                  )
                },
                handleSetOutput
              );
            }}
            disabled={isComputing}
          >
            {isComputing ? 'Processing...' : 'Encrypt / Decrypt'}
          </ActionButton>
        </div>
      }
      outputControl={
        <LongOutputField
          label="Output"
          value={currentState.output ?? ''}
          rows={6}
        />
      }
      theoryBlocks={theoryBlocks}
    />
  );
};

export default EncryptionPresenter;