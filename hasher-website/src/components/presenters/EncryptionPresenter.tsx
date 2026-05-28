import { useState } from 'react';
import { ActionButton, LongOutputField, LongTextField, ShortTextField } from '../controls/FormControls';
import EncryptionView from '../views/EncryptionView';
import encryptionData from '../../assets/data/encryption.json';
import { generateByteSequence, generateTextSequence } from '../../lib/cryptoGenerators';
import { useAlgorithmStateStore } from '../../lib/useAlgorithmStateStore';
import { createEncryptionFormState, type EncryptionFormState } from '../../models/cryptoForms';
import type { TheoryBlock } from '../TheoryPanel';
import { ENCRYPTION_VARIANT_GROUPS, findGroupForVariant } from './variantGroups';
import { buildEncryptionByteFields, buildEncryptionKeyControls } from './algorithmControls';

type KeyPanelMode = 'symmetric' | 'asymmetric' | 'stream';

type EncryptionConfigShape = {
  label: string;
  mode: KeyPanelMode;
  keyInputType: 'byte' | 'text';
  keyLabel: string;
  keyPlaceholder: string;
  keyTextPlaceholder?: string;
  keyByteField: {
    label: string;
    byteLength: number;
    columns: number;
  };
  byteFields: Array<{
    key: string;
    label: string;
    byteLength: number;
    columns?: number;
    placeholder?: string;
  }>;
  generateAction?: {
    label: string;
    fields: string[];
    outputKind: 'bytes' | 'text';
  };
  showSalt: boolean;
  saltLabel: string;
  saltPlaceholder: string;
  showCounter: boolean;
  counterLabel?: string;
  counterPlaceholder?: string;
};

type EncryptionTheoryBlock = TheoryBlock;

type EncryptionDataset = {
  algorithmOptions: Array<{ value: string; label: string }>;
  theory: Record<string, EncryptionTheoryBlock[]>;
} & Record<string, EncryptionConfigShape>;

type ModeType = 'encrypt' | 'decrypt';
type KeySizeValue = number;

const ENCRYPTION_DATA = encryptionData as unknown as EncryptionDataset;
const buildStateKey = (variantKey: string, keySize?: number) => (
  keySize ? `${variantKey}::${keySize}` : variantKey
);

const parseStateKey = (stateKey: string) => {
  const [variantKey, sizeText] = stateKey.split('::');
  return {
    variantKey,
    keySize: sizeText ? Number(sizeText) : undefined
  };
};

const ENCRYPTION_STATE_KEYS = ENCRYPTION_VARIANT_GROUPS.flatMap((group) => (
  group.variants.flatMap((variant) => (
    group.keySizeOptions?.length
      ? group.keySizeOptions.map((option) => buildStateKey(variant.key, option.value))
      : [variant.key]
  ))
));

const EncryptionPresenter = () => {
  const [mode, setMode] = useState<ModeType>('encrypt');
  const [keySizeByGroup, setKeySizeByGroup] = useState<Record<string, KeySizeValue>>(() => (
    Object.fromEntries(
      ENCRYPTION_VARIANT_GROUPS.map((group) => [
        group.key,
        group.keySizeDefault ?? group.keySizeOptions?.[0]?.value ?? 0
      ])
    )
  ));

  const initialFactory = (key: string) => {
    const base = createEncryptionFormState();
    const { variantKey } = parseStateKey(key);
    const configForKey = (ENCRYPTION_DATA as any)[variantKey];

    if (!configForKey) {
      return base;
    }

    const byteValues: Record<string, string[]> = { ...(base.byteValues ?? {}) };
    (configForKey.byteFields ?? []).forEach((field: any) => {
      if (!(field.key in byteValues)) {
        byteValues[field.key] = [];
      }
    });

    const keyBytes = { ...(base.keyBytes ?? {}) };
    keyBytes.symmetric = keyBytes.symmetric ?? [];
    keyBytes.publicKey = keyBytes.publicKey ?? [];
    keyBytes.privateKey = keyBytes.privateKey ?? [];

    return {
      ...base,
      byteValues,
      keyBytes
    } as EncryptionFormState;
  };

  const { activeKey: stateKey, setActiveKey: setStateKey, currentState, updateCurrentState } = useAlgorithmStateStore<EncryptionFormState>(ENCRYPTION_STATE_KEYS, initialFactory);
  const { variantKey: algo, keySize: parsedKeySize } = parseStateKey(stateKey);

  const config = ENCRYPTION_DATA[algo] ?? ENCRYPTION_DATA[ENCRYPTION_DATA.algorithmOptions[0]?.value ?? ''];
  const cipherOutput = '';

  if (!config) {
    return null;
  }

  const resolveByteLength = (fieldKey: string) => {
    if (fieldKey === 'symmetric') {
      return effectiveKeyByteLength;
    }

    return config.byteFields.find((field) => field.key === fieldKey)?.byteLength ?? (config.keyByteField?.byteLength ?? 0);
  };

  const updateByteField = (fieldKey: string, nextBytes: string[]) => {
    updateCurrentState((state) => ({
      ...state,
      byteValues: {
        ...state.byteValues,
        [fieldKey]: nextBytes
      }
    }));
  };

  const updateKeyBytes = (fieldKey: string, nextBytes: string[]) => {
    updateCurrentState((state) => ({
      ...state,
      keyBytes: {
        ...state.keyBytes,
        [fieldKey]: nextBytes
      }
    }));
  };

  const updateKeyText = (fieldKey: string, nextValue: string) => {
    updateCurrentState((state) => ({
      ...state,
      keyTextValues: {
        ...state.keyTextValues,
        [fieldKey]: nextValue
      }
    }));
  };

  const handleGenerateAction = () => {
    const action = config.generateAction;
    if (!action) {
      return;
    }

    const resolveKeyId = (fieldKey: string) => {
      if (fieldKey === 'symmetric') {
        return symmetricKeyId;
      }

      if (activeGroup.keySizeOptions?.length) {
        if (fieldKey === 'publicKey') {
          return publicKeyId;
        }
        if (fieldKey === 'privateKey') {
          return privateKeyId;
        }
      }

      return fieldKey;
    };

    const targetFields = mode === 'decrypt'
      ? action.fields.filter((fieldKey) => fieldKey === 'symmetric' || fieldKey === 'privateKey')
      : action.fields;

    if (action.outputKind === 'bytes') {
      targetFields.forEach((fieldKey) => {
        const nextBytes = generateByteSequence(resolveByteLength(fieldKey));

        if (fieldKey === 'nonce' || fieldKey === 'iv') {
          updateByteField(fieldKey, nextBytes);
          return;
        }

        updateKeyBytes(resolveKeyId(fieldKey), nextBytes);
      });
      return;
    }

    targetFields.forEach((fieldKey) => {
      const generatedText = generateTextSequence(fieldKey === 'publicKey' ? 'PUBLIC KEY' : 'PRIVATE KEY');
      updateKeyText(resolveKeyId(fieldKey), generatedText);
    });
  };

  const activeGroup = findGroupForVariant(ENCRYPTION_VARIANT_GROUPS, algo);
  const activeKeySize = activeGroup.keySizeOptions
    ? (parsedKeySize ?? keySizeByGroup[activeGroup.key] ?? activeGroup.keySizeDefault ?? activeGroup.keySizeOptions[0]?.value ?? 0)
    : 0;
  const effectiveKeyByteLength = activeGroup.keySizeOptions?.length
    ? activeKeySize
    : (config.keyByteField?.byteLength ?? 0);
  const symmetricKeyId = activeGroup.keySizeOptions?.length ? `symmetric_${activeKeySize}` : 'symmetric';
  const publicKeyId = activeGroup.keySizeOptions?.length ? `publicKey_${activeKeySize}` : 'publicKey';
  const privateKeyId = activeGroup.keySizeOptions?.length ? `privateKey_${activeKeySize}` : 'privateKey';
  const symmetricKeyLabel = activeGroup.keySizeOptions?.length
    ? `${config.keyLabel} (${activeKeySize} bytes)`
    : config.keyLabel;

  const algorithmSelect = (
    <>
      <div className="control-group">
        <label>Algorithm Family</label>
        <div className="subtab-strip">
          {ENCRYPTION_VARIANT_GROUPS.map((group) => (
            <button
              key={group.key}
              type="button"
              className={`tab-btn ${group.key === activeGroup.key ? 'active' : ''}`}
              onClick={() => {
                const defaultSize = group.keySizeDefault ?? group.keySizeOptions?.[0]?.value;
                const nextKey = buildStateKey(group.variants[0]?.key ?? algo, defaultSize);
                setStateKey(nextKey);
              }}
            >
              {group.label}
            </button>
          ))}
        </div>
        {activeGroup.variants.length > 1 ? (
          <>
            <label>Variant</label>
            <div className="subtab-strip">
              {activeGroup.variants.map((variant) => (
                <button
                  key={variant.key}
                  type="button"
                  className={`tab-btn ${variant.key === algo ? 'active' : ''}`}
                  onClick={() => {
                    const fallbackSize = activeGroup.keySizeDefault ?? activeGroup.keySizeOptions?.[0]?.value;
                    const nextSize = activeGroup.keySizeOptions?.length
                      ? (activeKeySize || fallbackSize)
                      : undefined;
                    setStateKey(buildStateKey(variant.key, nextSize));
                  }}
                >
                  {variant.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
        {activeGroup.keySizeOptions?.length ? (
          <>
            <label>{activeGroup.keySizeLabel ?? 'Key Size'}</label>
            <div className="subtab-strip">
              {activeGroup.keySizeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`tab-btn ${activeKeySize === option.value ? 'active' : ''}`}
                  onClick={() => {
                    setKeySizeByGroup((current) => ({
                      ...current,
                      [activeGroup.key]: option.value
                    }));
                    setStateKey(buildStateKey(algo, option.value));
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
      <div className="control-group">
        <label>Mode</label>
        <div className="subtab-strip">
          {[
            { key: 'encrypt', label: 'Encrypt' },
            { key: 'decrypt', label: 'Decrypt' }
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              className={`tab-btn ${mode === option.key ? 'active' : ''}`}
              onClick={() => setMode(option.key as ModeType)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const mainInput = (
    <LongTextField
      label={mode === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
      value={currentState.encryptionInput}
      onChange={(nextValue) => updateCurrentState((state) => ({ ...state, encryptionInput: nextValue }))}
      placeholder={mode === 'encrypt' ? 'Enter plaintext here...' : 'Enter ciphertext here...'}
      rows={6}
    />
  );

  const generateAction = mode === 'encrypt' && config.generateAction ? (
    <div className="action-buttons action-buttons--compact">
      <ActionButton type="button" variant="secondary" onClick={handleGenerateAction}>
        {config.generateAction.label}
      </ActionButton>
    </div>
  ) : null;

  const keyControls = buildEncryptionKeyControls({
    mode,
    algo,
    config,
    currentState,
    effectiveKeyByteLength,
    symmetricKeyId,
    symmetricKeyLabel,
    publicKeyId,
    privateKeyId,
    updateKeyBytes,
    updateKeyText
  });

  const byteFields = buildEncryptionByteFields({
    mode,
    algo,
    config,
    currentState,
    updateByteField
  });

  const counterControl = mode === 'encrypt' && config.showCounter ? (
    <div className="control-group">
      <label>{config.counterLabel}</label>
      <input
        type="number"
        min={0}
        step={1}
        value={currentState.counter}
        onChange={(event) => updateCurrentState((state) => ({ ...state, counter: event.target.value }))}
        placeholder={config.counterPlaceholder}
      />
    </div>
  ) : null;

  const saltControl = mode === 'encrypt' && config.showSalt ? (
    <ShortTextField
      label={config.saltLabel}
      value={currentState.salt}
      onChange={(nextValue) => updateCurrentState((state) => ({ ...state, salt: nextValue }))}
      placeholder={config.saltPlaceholder}
    />
  ) : null;

  const actionButtons = (
    <div className="action-buttons">
      <ActionButton variant="primary">{mode === 'encrypt' ? 'Encrypt Data' : 'Decrypt Data'}</ActionButton>
    </div>
  );

  const outputControl = (
    <LongOutputField
      label={mode === 'encrypt' ? 'Output' : 'Plaintext Output'}
      value={cipherOutput}
      placeholder={''}
      rows={6}
    />
  );

  const theoryBlocks = ENCRYPTION_DATA.theory[activeGroup.key] ?? [];

  return (
    <EncryptionView
      title="Data Encryption / Decryption"
      algorithmSelect={algorithmSelect}
      mainInput={mainInput}
      generateAction={generateAction}
      keyControls={keyControls}
      byteFields={byteFields}
      counterControl={counterControl}
      saltControl={saltControl}
      keySelectionControl={null}
      actionButtons={actionButtons}
      outputControl={outputControl}
      theoryBlocks={theoryBlocks}
    />
  );
};

export default EncryptionPresenter;