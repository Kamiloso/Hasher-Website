import { ActionButton, LongOutputField } from '../FormControls';
import EncryptionView from './EncryptionView';

import { ENCRYPTION_DATA } from './configs/encryptionConstants';
import { useEncryptionState } from './hooks/useEncryptionState';
import { useEncryptionActions } from './hooks/useEncryptionAction';
import { useEncryptionHandlers } from './hooks/useEncryptionHandlers';
import { resolveEncryptionMeta } from './services/encryptionKeyResolver';
import { parseStateKey } from './services/encryptionStateKey';
import { EncryptionAlgorithmSelector } from './EncryptionAlgorithmSelector';

import {
    buildEncryptionByteFields,
    buildEncryptionKeyControls
} from './EncryptionControls';

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

  const config = ENCRYPTION_DATA[variantKey];
  if (!config) {
    return null;
  }

  const meta = resolveEncryptionMeta(
    activeKey,
    keySizeByGroup,
    config
  );

  const {
    handleSetOutput,
    updateKeyBytes,
    updateKeyText,
    updateByteField,
    handleGenerate
  } = useEncryptionHandlers({ config, mode, meta, updateCurrentState });

  const keyControls = buildEncryptionKeyControls({
    mode,
    algo: activeKey,
    config,
    currentState,
    effectiveKeyByteLength: meta.effectiveKeyByteLength,
    symmetricKeyId: meta.symmetricKeyId,
    symmetricKeyLabel: meta.symmetricKeyLabel,
    publicKeyId: meta.publicKeyId,
    privateKeyId: meta.privateKeyId,
    updateKeyBytes,
    updateKeyText
  });

  const byteFields = buildEncryptionByteFields({
    mode,
    algo: activeKey,
    config,
    currentState,
    updateByteField
  });

  const theoryBlocks =
    ENCRYPTION_DATA.theory?.[meta.variantKey] ??
    ENCRYPTION_DATA.theory?.[meta.activeGroup?.key] ??
    [];

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
      mainInput={null}
      generateAction={
        config.generateAction ? (
          <div className="control-group">
            <ActionButton variant="primary" onClick={handleGenerate}>
              {config.generateAction.label}
            </ActionButton>
          </div>
        ) : null
      }
      keyControls={keyControls}
      byteFields={byteFields}
      counterControl={null}
      saltControl={null}
      actionButtons={
        <div className="action-buttons">
          <ActionButton 
            variant="primary" 
            onClick={() => {
              compute({ executor: async () => 'Wynik szyfrowania / deszyfrowania...' }, handleSetOutput);
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