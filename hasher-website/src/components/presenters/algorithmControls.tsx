import type { ReactNode } from 'react';
import ByteField from '../controls/ByteField';
import { LongTextField, ShortTextField } from '../controls/FormControls';
import type { EncryptionFormState, HashFormState } from '../../models/cryptoForms';

type EncryptionConfig = {
  mode: 'symmetric' | 'asymmetric' | 'stream';
  keyInputType: 'byte' | 'text';
  keyLabel: string;
  keyPlaceholder: string;
  keyTextPlaceholder?: string;
  keyByteField?: {
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
};

type Argon2ParamConfig = {
  defaultMemoryKb: number;
  defaultParallelism: number;
  defaultTimeCost: number;
};

type HashingConfig = {
  saltPolicy: 'optional' | 'recommended' | 'none';
  saltLabel: string;
  allowKdf: boolean;
  argon2Params?: Argon2ParamConfig;
};

type EncryptionKeyControlContext = {
  mode: 'encrypt' | 'decrypt';
  algo: string;
  config: EncryptionConfig;
  currentState: EncryptionFormState;
  effectiveKeyByteLength: number;
  symmetricKeyId: string;
  symmetricKeyLabel: string;
  publicKeyId: string;
  privateKeyId: string;
  updateKeyBytes: (fieldKey: string, nextBytes: string[]) => void;
  updateKeyText: (fieldKey: string, nextValue: string) => void;
};

type EncryptionByteFieldContext = {
  mode: 'encrypt' | 'decrypt';
  algo: string;
  config: EncryptionConfig;
  currentState: EncryptionFormState;
  updateByteField: (fieldKey: string, nextBytes: string[]) => void;
};

type HashingControlContext = {
  config: HashingConfig;
  currentState: HashFormState;
  kdfOptions: Array<{ value: HashFormState['kdf']; label: string }>;
  updateCurrentState: (updater: (state: HashFormState) => HashFormState) => void;
};

type HashingControls = {
  kdfControl: ReactNode | null;
  iterationsControl: ReactNode | null;
  argon2Controls: ReactNode | null;
  inputControl: ReactNode;
  saltControl: ReactNode | null;
};

export const buildEncryptionKeyControls = ({
  mode,
  config,
  currentState,
  effectiveKeyByteLength,
  symmetricKeyId,
  symmetricKeyLabel,
  publicKeyId,
  privateKeyId,
  updateKeyBytes,
  updateKeyText
}: EncryptionKeyControlContext): ReactNode => {
  if (config.mode === 'asymmetric') {
    if (mode === 'decrypt') {
      return config.keyInputType === 'text' ? (
        <LongTextField
          label="Private Key"
          value={currentState.keyTextValues[privateKeyId] ?? ''}
          onChange={(nextValue) => updateKeyText(privateKeyId, nextValue)}
          placeholder={config.keyTextPlaceholder ?? 'Paste private key text...'}
          rows={6}
        />
      ) : (
        <ByteField
          label="Private Key"
          value={currentState.keyBytes[privateKeyId] ?? []}
          onChange={(nextBytes) => updateKeyBytes(privateKeyId, nextBytes)}
          byteLength={effectiveKeyByteLength}
          columns={config.keyByteField?.columns ?? 8}
        />
      );
    }

    return config.keyInputType === 'text' ? (
      <>
        <LongTextField
          label="Public Key"
          value={currentState.keyTextValues[publicKeyId] ?? ''}
          onChange={(nextValue) => updateKeyText(publicKeyId, nextValue)}
          placeholder={config.keyTextPlaceholder ?? 'Paste public key text...'}
          rows={6}
        />

        <LongTextField
          label="Private Key"
          value={currentState.keyTextValues[privateKeyId] ?? ''}
          onChange={(nextValue) => updateKeyText(privateKeyId, nextValue)}
          placeholder={config.keyTextPlaceholder ?? 'Paste private key text...'}
          rows={6}
        />
      </>
    ) : (
      <>
        <ByteField
          label="Public Key"
          value={currentState.keyBytes[publicKeyId] ?? []}
          onChange={(nextBytes) => updateKeyBytes(publicKeyId, nextBytes)}
          byteLength={effectiveKeyByteLength}
          columns={config.keyByteField?.columns ?? 8}
        />

        <ByteField
          label="Private Key"
          value={currentState.keyBytes[privateKeyId] ?? []}
          onChange={(nextBytes) => updateKeyBytes(privateKeyId, nextBytes)}
          byteLength={effectiveKeyByteLength}
          columns={config.keyByteField?.columns ?? 8}
        />
      </>
    );
  }

  if (mode === 'decrypt') {
    return config.keyInputType === 'text' ? (
      <LongTextField
        label={symmetricKeyLabel}
        value={currentState.keyTextValues[symmetricKeyId] ?? ''}
        onChange={(nextValue) => updateKeyText(symmetricKeyId, nextValue)}
        placeholder={config.keyPlaceholder}
        rows={4}
      />
    ) : (
      <ByteField
        label={symmetricKeyLabel}
        value={currentState.keyBytes[symmetricKeyId] ?? []}
        onChange={(nextBytes) => updateKeyBytes(symmetricKeyId, nextBytes)}
        byteLength={effectiveKeyByteLength}
        columns={config.keyByteField?.columns ?? 8}
      />
    );
  }

  if (config.mode === 'symmetric' || config.mode === 'stream') {
    return config.keyInputType === 'text' ? (
      <LongTextField
        label={symmetricKeyLabel}
        value={currentState.keyTextValues[symmetricKeyId] ?? ''}
        onChange={(nextValue) => updateKeyText(symmetricKeyId, nextValue)}
        placeholder={config.keyPlaceholder}
        rows={4}
      />
    ) : (
      <ByteField
        label={symmetricKeyLabel}
        value={currentState.keyBytes[symmetricKeyId] ?? []}
        onChange={(nextBytes) => updateKeyBytes(symmetricKeyId, nextBytes)}
        byteLength={effectiveKeyByteLength}
        columns={config.keyByteField?.columns ?? 8}
      />
    );
  }

  return null;
};

export const buildEncryptionByteFields = ({
  mode,
  algo,
  config,
  currentState,
  updateByteField
}: EncryptionByteFieldContext): ReactNode[] => {
  if (mode !== 'encrypt') {
    return [];
  }

  return config.byteFields.map((field) => (
    <ByteField
      key={`${algo}-${field.key}`}
      label={field.label}
      value={currentState.byteValues[field.key] ?? []}
      onChange={(nextBytes) => updateByteField(field.key, nextBytes)}
      byteLength={field.byteLength}
      columns={field.columns}
    />
  ));
};

export const buildHashingControls = ({
  config,
  currentState,
  kdfOptions,
  updateCurrentState
}: HashingControlContext): HashingControls => {
  const showSalt = config.saltPolicy !== 'none';
  const showKdf = config.allowKdf;
  const effectiveKdf = currentState.kdf;

  const kdfControl = showKdf ? (
    <div className="control-group">
      <label htmlFor="kdf-select">KDF</label>
      <select
        id="kdf-select"
        value={effectiveKdf}
        onChange={(event) => updateCurrentState((state) => ({ ...state, kdf: event.target.value as HashFormState['kdf'] }))}
      >
        {kdfOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ) : null;

  const iterationsControl = showKdf && effectiveKdf === 'pbkdf2' ? (
    <div className="control-group">
      <label htmlFor="iterations">PBKDF2 Iterations</label>
      <input
        id="iterations"
        type="number"
        min={1000}
        step={1000}
        value={currentState.iterations}
        onChange={(event) => updateCurrentState((state) => ({ ...state, iterations: Number(event.target.value) || 1000 }))}
      />
    </div>
  ) : null;

  const argon2Controls = config.argon2Params ? (
    <>
      <div className="control-group">
        <label htmlFor="argon2-memory">Argon2 Memory (KB)</label>
        <input
          id="argon2-memory"
          type="number"
          min={8}
          step={8}
          value={currentState.argon2MemoryKb}
          onChange={(event) => updateCurrentState((state) => ({ ...state, argon2MemoryKb: Number(event.target.value) || (config.argon2Params?.defaultMemoryKb ?? 65536) }))}
        />
      </div>
      <div className="control-group">
        <label htmlFor="argon2-parallelism">Argon2 Parallelism</label>
        <input
          id="argon2-parallelism"
          type="number"
          min={1}
          max={16}
          step={1}
          value={currentState.argon2Parallelism}
          onChange={(event) => updateCurrentState((state) => ({ ...state, argon2Parallelism: Number(event.target.value) || (config.argon2Params?.defaultParallelism ?? 2) }))}
        />
      </div>
      <div className="control-group">
        <label htmlFor="argon2-timecost">Argon2 Time Cost</label>
        <input
          id="argon2-timecost"
          type="number"
          min={1}
          max={10}
          step={1}
          value={currentState.argon2TimeCost}
          onChange={(event) => updateCurrentState((state) => ({ ...state, argon2TimeCost: Number(event.target.value) || (config.argon2Params?.defaultTimeCost ?? 3) }))}
        />
      </div>
    </>
  ) : null;

  const inputControl = (
    <LongTextField
      label="Input Data"
      value={currentState.hashInputText}
      onChange={(nextValue) => updateCurrentState((state) => ({ ...state, hashInputText: nextValue }))}
      onReset={() => updateCurrentState((state) => ({ ...state, hashInputText: '' }))}
      placeholder="Enter string to hash..."
      rows={4}
    />
  );

  const saltControl = showSalt ? (
    <ShortTextField
      label={config.saltLabel}
      value={currentState.salt}
      onChange={(nextValue) => updateCurrentState((state) => ({ ...state, salt: nextValue }))}
      placeholder="Enter salt if you want one..."
    />
  ) : null;

  return {
    kdfControl,
    iterationsControl,
    argon2Controls,
    inputControl,
    saltControl
  };
};
