import type { ReactNode } from 'react';
import ByteField from '../../components/ByteField';
import { LongTextField, ShortTextField } from '../../components/FormControls';
import type { EncryptionFormState } from './models/cryptoForms';

import type {
  AlgorithmGroup,
  AlgorithmVariant,
  FieldDef,
  GenerateActionDef
} from './configs/encryptionConstants';

export type ConfigContextType = {
  group: AlgorithmGroup;
  variant: AlgorithmVariant;
  activeKeyField?: FieldDef;
  activeGenerateAction?: GenerateActionDef;
};

export type EncryptionControlContext = {
  mode: 'encrypt' | 'decrypt';
  algo: string;
  configContext: ConfigContextType;
  currentState: EncryptionFormState;
  effectiveKeyByteLength: number;
  symmetricKeyId: string;
  symmetricKeyLabel: string;
  publicKeyId: string;
  privateKeyId: string;
  updateKeyBytes: (fieldKey: string, nextBytes: string[]) => void;
  updateKeyText: (fieldKey: string, nextValue: string) => void;
  updateByteField: (fieldKey: string, nextBytes: string[]) => void;
  updateCurrentState: (updater: (state: EncryptionFormState) => EncryptionFormState) => void;
};

export type EncryptionControls = {
  keyControls: ReactNode;
  byteFields: ReactNode[];
  mainInput: ReactNode;
  saltControl: ReactNode | null;
  counterControl: ReactNode | null;
};

export const buildEncryptionControls = (
  ctx: EncryptionControlContext
): EncryptionControls => {
  const {
    mode,
    algo,
    configContext,
    currentState,
    effectiveKeyByteLength,
    symmetricKeyId,
    symmetricKeyLabel,
    publicKeyId,
    privateKeyId,
    updateKeyBytes,
    updateKeyText,
    updateByteField,
    updateCurrentState
  } = ctx;

  const { group, variant, activeKeyField } = configContext;

  const getTextValue = (keyId: string) => currentState.keyTextValues?.[keyId] ?? '';

  // --- 1. KEY CONTROLS ---
  let keyControls: ReactNode = null;

  if (group.keyInputType === 'number') {
    const currentVal = currentState.keyTextValues?.[symmetricKeyId];
    const displayVal = (currentVal !== undefined && currentVal !== '') 
      ? currentVal 
      : (activeKeyField?.defaultValue ?? '');

    keyControls = (
      <div className="control-group">
        <label>{symmetricKeyLabel}</label>
        <input
          type="number"
          min={activeKeyField?.min}
          max={activeKeyField?.max}
          value={displayVal}
          onChange={(e) => updateKeyText(symmetricKeyId, e.target.value)}
        />
      </div>
    );
  } else if (group.mode === 'asymmetric') {

  const renderKeyField = (label: string, keyId: string, placeholder?: string) => {
    return group.keyInputType === 'text' ? (
      <LongTextField
        key={keyId}
        label={label}
        value={getTextValue(keyId)}
        onChange={(nextValue) => updateKeyText(keyId, nextValue)}
        placeholder={placeholder ?? `Paste ${label.toLowerCase()} text...`}
        rows={6}
      />
    ) : (
      <ByteField
        key={keyId}
        label={label}
        value={currentState.keyBytes?.[keyId] ?? []}
        onChange={(nextBytes) => updateKeyBytes(keyId, nextBytes)}
        byteLength={effectiveKeyByteLength}
        columns={activeKeyField?.columns ?? 8}
      />
    );
  };

  keyControls = (
    <>
      {renderKeyField("Public Key", publicKeyId, group.keyTextPlaceholder)}
      {renderKeyField("Private Key", privateKeyId, group.keyTextPlaceholder)}
    </>
  );
} else if (group.mode === 'symmetric' || group.mode === 'stream') {
    keyControls = group.keyInputType === 'text' ? (
      <LongTextField
        label={symmetricKeyLabel}
        value={getTextValue(symmetricKeyId)}
        onChange={(nextValue) => updateKeyText(symmetricKeyId, nextValue)}
        placeholder={group.keyPlaceholder}
        rows={4}
      />
    ) : (
      <ByteField
        label={symmetricKeyLabel}
        value={currentState.keyBytes?.[symmetricKeyId] ?? []}
        onChange={(nextBytes) => updateKeyBytes(symmetricKeyId, nextBytes)}
        byteLength={effectiveKeyByteLength}
        columns={activeKeyField?.columns ?? 8}
      />
    );
  }

  // --- 2. BYTE FIELDS (Nonce, IV) ---
  const byteFields = mode === 'encrypt'
    ? variant.byteFields.map((field) => {
        if (!field.key) return null;
        return (
          <ByteField
            key={`${algo}-${field.key}`}
            label={field.label}
            value={currentState.byteValues?.[field.key] ?? []}
            onChange={(nextBytes) => updateByteField(field.key!, nextBytes)}
            byteLength={field.byteLength ?? 0}
            columns={field.columns}
          />
        );
      })
    : [];

  // --- 3. MAIN INPUT ---
  const mainInput = (
    <LongTextField
      label={mode === 'encrypt' ? 'Plaintext to Encrypt' : 'Ciphertext to Decrypt'}
      value={currentState.encryptionInput ?? ''} 
      onChange={(nextValue) => updateCurrentState((state) => ({ ...state, encryptionInput: nextValue }))}
      placeholder={mode === 'encrypt' ? 'Enter string to encrypt...' : 'Enter data to decrypt...'}
      rows={4}
    />
  );

  // --- 4. SALT CONTROL ---
  const saltControl = variant.showSalt ? (
    <ShortTextField
      label={variant.saltLabel ?? 'Salt'}
      value={currentState.salt ?? ''}
      onChange={(nextValue) => updateCurrentState((state) => ({ ...state, salt: nextValue }))}
      placeholder={variant.saltPlaceholder ?? 'Enter optional salt...'}
    />
  ) : null;

  // --- 5. COUNTER CONTROL ---
  const counterControl = variant.showCounter ? (
    <div className="control-group">
      <label>{variant.counterLabel ?? 'Counter'}</label>
      <input
        type="number"
        value={currentState.counter ?? ''}
        onChange={(e) => updateCurrentState((state) => ({ ...state, counter: e.target.value }))}
        placeholder={variant.counterPlaceholder ?? '0'}
      />
    </div>
  ) : null;

  return {
    keyControls,
    byteFields,
    mainInput,
    saltControl,
    counterControl
  };
};