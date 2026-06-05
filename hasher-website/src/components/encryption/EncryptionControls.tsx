import type { ReactNode } from 'react';
import ByteField from '../ByteField.tsx';
import { LongTextField } from '../FormControls.tsx';
import type { EncryptionFormState } from './models/cryptoForms.ts';

export type EncryptionConfig = {
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

export type EncryptionKeyControlContext = {
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

export type EncryptionByteFieldContext = {
  mode: 'encrypt' | 'decrypt';
  algo: string;
  config: EncryptionConfig;
  currentState: EncryptionFormState;
  updateByteField: (fieldKey: string, nextBytes: string[]) => void;
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