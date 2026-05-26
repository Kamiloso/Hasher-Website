import { useState } from 'react';
import ByteField from '../ByteField';
import TheoryPanel from '../TheoryPanel';
import encryptionData from '../../assets/data/encryption.json';
import { ActionButton, LongOutputField, LongTextField, ShortOutputField, ShortTextField } from '../FormControls';

type KeyPanelMode = 'symmetric' | 'asymmetric' | 'stream' | 'preview';

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
  showCustomKeys: boolean;
  keyOptions?: string[];
  nonceBytes: number;
  preview?: {
    shortInputLabel: string;
    shortInputPlaceholder: string;
    longInputLabel: string;
    longInputPlaceholder: string;
    byteFieldLabel: string;
    byteFieldByteLength: number;
    byteFieldColumns: number;
    shortOutputLabel: string;
    shortOutputValue: string;
    longOutputLabel: string;
    longOutputValue: string;
    byteOutputLabel: string;
    byteOutputByteLength: number;
    byteOutputColumns: number;
  };
};

type EncryptionTheoryBlock = {
  title: string;
  content: string;
};

type EncryptionDataset = {
  algorithmOptions: Array<{ value: string; label: string }>;
  theory: Record<string, EncryptionTheoryBlock[]>;
} & Record<string, EncryptionConfigShape>;

const ENCRYPTION_DATA = encryptionData as unknown as EncryptionDataset;

const generateByteSequence = (byteLength: number) => {
  return Array.from({ length: byteLength }, () => {
    const randomByte = Math.floor(Math.random() * 256);
    return randomByte.toString(16).toUpperCase().padStart(2, '0');
  });
};

const generateTextSequence = (label: string) => {
  const suffix = Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 8).toUpperCase()).join('-');
  return `${label}\n${suffix}`;
};

const EncryptionView = () => {
  const [algo, setAlgo] = useState(ENCRYPTION_DATA.algorithmOptions[0]?.value ?? '');
  const [encryptionInput, setEncryptionInput] = useState('');
  const [keyBytes, setKeyBytes] = useState<Record<string, string[]>>({
    symmetric: [],
    publicKey: [],
    privateKey: []
  });
  const [byteValues, setByteValues] = useState<Record<string, string[]>>({
    nonce: [],
    iv: []
  });
  const [keyTextValues, setKeyTextValues] = useState<Record<string, string>>({
    symmetric: '',
    publicKey: '',
    privateKey: ''
  });
  const [salt, setSalt] = useState('');
  const [counter, setCounter] = useState('0');
  const [keySelection, setKeySelection] = useState('Use Public Key (for Encryption)');
  const [cipherOutput] = useState('TEST OUTPUT: 3A 7C 11 E4 98 2B 5F 07 9C 1D 6A 4F 10 29 88 0C');
  const [previewShortInput, setPreviewShortInput] = useState('short input');
  const [previewLongInput, setPreviewLongInput] = useState('This is a longer input used to inspect the long text field control in the preview algorithm.');
  const [previewByteInput, setPreviewByteInput] = useState(generateByteSequence(12));
  const [previewByteOutput, setPreviewByteOutput] = useState(generateByteSequence(12));

  const config = ENCRYPTION_DATA[algo] ?? ENCRYPTION_DATA[ENCRYPTION_DATA.algorithmOptions[0]?.value ?? ''];

  if (!config) {
    return null;
  }

  const updateByteField = (fieldKey: string, nextBytes: string[]) => {
    setByteValues((currentValues) => ({
      ...currentValues,
      [fieldKey]: nextBytes
    }));
  };

  const updateKeyBytes = (fieldKey: string, nextBytes: string[]) => {
    setKeyBytes((currentValues) => ({
      ...currentValues,
      [fieldKey]: nextBytes
    }));
  };

  const updateKeyText = (fieldKey: string, nextValue: string) => {
    setKeyTextValues((currentValues) => ({
      ...currentValues,
      [fieldKey]: nextValue
    }));
  };

  const resolveByteLength = (fieldKey: string) => {
    if (fieldKey === 'symmetric') {
      return config.keyByteField.byteLength;
    }

    return config.byteFields.find((field) => field.key === fieldKey)?.byteLength ?? config.keyByteField.byteLength;
  };

  const handleGenerateAction = () => {
    const action = config.generateAction;
    if (!action) {
      return;
    }

    if (action.outputKind === 'bytes') {
      action.fields.forEach((fieldKey) => {
        const nextBytes = generateByteSequence(resolveByteLength(fieldKey));
        if (fieldKey === 'nonce' || fieldKey === 'iv') {
          updateByteField(fieldKey, nextBytes);
          return;
        }

        updateKeyBytes(fieldKey, nextBytes);
      });
      return;
    }

    action.fields.forEach((fieldKey) => {
      const generatedText = generateTextSequence(fieldKey === 'publicKey' ? 'PUBLIC KEY' : 'PRIVATE KEY');
      updateKeyText(fieldKey, generatedText);
    });
  };

  const isPreviewMode = config.mode === 'preview';

  const renderKeyControls = () => {
    if (config.mode === 'asymmetric') {
      return config.keyInputType === 'text' ? (
        <>
          <LongTextField
            label="Public Key"
            value={keyTextValues.publicKey}
            onChange={(nextValue) => updateKeyText('publicKey', nextValue)}
            placeholder={config.keyTextPlaceholder ?? 'Paste public key text...'}
            helperText="RSA keys are handled as textual key material."
            rows={6}
          />

          <LongTextField
            label="Private Key"
            value={keyTextValues.privateKey}
            onChange={(nextValue) => updateKeyText('privateKey', nextValue)}
            placeholder={config.keyTextPlaceholder ?? 'Paste private key text...'}
            helperText="Text controls keep RSA keys readable and copyable."
            rows={6}
          />
        </>
      ) : (
        <>
          <ByteField
            label="Public Key"
            value={keyBytes.publicKey ?? []}
            onChange={(nextBytes) => updateKeyBytes('publicKey', nextBytes)}
            byteLength={config.keyByteField.byteLength}
            columns={config.keyByteField.columns}
            helperText="Public key bytes can be edited cell by cell."
          />

          <ByteField
            label="Private Key"
            value={keyBytes.privateKey ?? []}
            onChange={(nextBytes) => updateKeyBytes('privateKey', nextBytes)}
            byteLength={config.keyByteField.byteLength}
            columns={config.keyByteField.columns}
            helperText="Private key bytes can be edited cell by cell."
          />
        </>
      );
    }

    if (config.mode === 'symmetric') {
      return config.keyInputType === 'text' ? (
        <LongTextField
          label={config.keyLabel}
          value={keyTextValues.symmetric}
          onChange={(nextValue) => updateKeyText('symmetric', nextValue)}
          placeholder={config.keyPlaceholder}
          helperText="Symmetric keys can be entered as text if the selected algorithm expects it."
          rows={4}
        />
      ) : (
        <ByteField
          label={config.keyByteField.label}
          value={keyBytes.symmetric ?? []}
          onChange={(nextBytes) => updateKeyBytes('symmetric', nextBytes)}
          byteLength={config.keyByteField.byteLength}
          columns={config.keyByteField.columns}
          helperText="Symmetric keys are edited byte by byte. Use arrow keys to move between bytes."
        />
      );
    }

    if (config.mode === 'stream') {
      return (
        <ByteField
          label={config.keyByteField.label}
          value={keyBytes.symmetric ?? []}
          onChange={(nextBytes) => updateKeyBytes('symmetric', nextBytes)}
          byteLength={config.keyByteField.byteLength}
          columns={config.keyByteField.columns}
          helperText="ChaCha20 accepts a 32-byte key, edited as separate byte cells."
        />
      );
    }

    return null;
  };

  return (
    <section className="tool-section">
      <div className="workspace">
        <h2>Data Encryption & Decryption</h2>

        <div className="control-group">
          <label htmlFor="algo-select">Cryptographic Algorithm</label>
          <select id="algo-select" value={algo} onChange={(event) => setAlgo(event.target.value)}>
            {ENCRYPTION_DATA.algorithmOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {isPreviewMode ? (
          <>
            <ShortTextField
              label={config.preview?.shortInputLabel ?? 'Short Input'}
              value={previewShortInput}
              onChange={setPreviewShortInput}
              placeholder={config.preview?.shortInputPlaceholder ?? 'Short input...'}
              helperText="Krótkie pole tekstowe pokazuje jednolinijkowy input z kopią nad treścią."
            />

            <LongTextField
              label={config.preview?.longInputLabel ?? 'Long Input'}
              value={previewLongInput}
              onChange={setPreviewLongInput}
              placeholder={config.preview?.longInputPlaceholder ?? 'Long input...'}
              helperText="Długie pole tekstowe pokazuje wielowierszowy input z kopią nad treścią."
              rows={5}
            />

            <ByteField
              label={config.preview?.byteFieldLabel ?? 'Byte Field'}
              value={previewByteInput}
              onChange={setPreviewByteInput}
              byteLength={config.preview?.byteFieldByteLength ?? 12}
              columns={config.preview?.byteFieldColumns ?? 8}
              helperText="Pole bajtowe pokazuje układ 8 kolumn, wklejanie i kopiowanie."
            />

            <ShortOutputField
              label={config.preview?.shortOutputLabel ?? 'Short Output'}
              value={config.preview?.shortOutputValue ?? 'TEST OUTPUT: SHORT'}
              helperText="Krótkie pole output jest tylko do odczytu, ale nadal kopiowalne."
            />

            <LongOutputField
              label={config.preview?.longOutputLabel ?? 'Long Output'}
              value={config.preview?.longOutputValue ?? 'TEST OUTPUT: Long output'}
              helperText="Długie pole output pokazuje przykład pełnego tekstowego wyniku."
              rows={5}
            />

            <ByteField
              label={config.preview?.byteOutputLabel ?? 'Byte Output'}
              value={previewByteOutput}
              onChange={setPreviewByteOutput}
              byteLength={config.preview?.byteOutputByteLength ?? 12}
              columns={config.preview?.byteOutputColumns ?? 8}
              helperText="Bajtowy output wygląda jak wynik tylko do odczytu, ale da się go skopiować."
              readOnly
            />
          </>
        ) : (
          <LongTextField
            label="Input Data"
            value={encryptionInput}
            onChange={setEncryptionInput}
            placeholder="Enter plaintext or ciphertext here..."
            helperText="Tekstowe wejście dla algorytmu kryptograficznego."
            rows={6}
          />
        )}

        {config.generateAction && config.mode !== 'asymmetric' && (
          <div className="action-buttons action-buttons--compact">
            <ActionButton type="button" variant="secondary" onClick={handleGenerateAction}>
              {config.generateAction.label}
            </ActionButton>
          </div>
        )}

        {renderKeyControls()}

        {config.byteFields.map((field) => (
          <ByteField
            key={`${algo}-${field.key}`}
            label={field.label}
            value={byteValues[field.key] ?? []}
            onChange={(nextBytes) => updateByteField(field.key, nextBytes)}
            byteLength={field.byteLength}
            columns={field.columns}
            helperText={`${field.label} must be exactly ${field.byteLength} bytes long.`}
          />
        ))}

        {config.showCounter && (
          <div className="control-group">
            <label>{config.counterLabel}</label>
            <input
              type="number"
              min={0}
              step={1}
              value={counter}
              onChange={(event) => setCounter(event.target.value)}
              placeholder={config.counterPlaceholder}
            />
          </div>
        )}

        {config.showSalt && (
          <ShortTextField
            label={config.saltLabel}
            value={salt}
            onChange={setSalt}
            placeholder={config.saltPlaceholder}
            helperText="Salt można teraz skopiować jednym kliknięciem nad polem."
          />
        )}

        {config.generateAction && config.mode === 'asymmetric' && (
          <div className="action-buttons action-buttons--compact">
            <ActionButton type="button" variant="secondary" onClick={handleGenerateAction}>
              {config.generateAction.label}
            </ActionButton>
          </div>
        )}

        {config.mode === 'asymmetric' && (
          <div className="control-group">
            <label>{config.keyLabel}</label>
            <select value={keySelection} onChange={(event) => setKeySelection(event.target.value)}>
              {(config.keyOptions ?? []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="action-buttons">
          <ActionButton variant="primary">Encrypt Data</ActionButton>
          <ActionButton variant="secondary">Decrypt Data</ActionButton>
          {isPreviewMode && <ActionButton variant="secondary">Refresh Preview</ActionButton>}
        </div>

        {!isPreviewMode && (
          <LongOutputField
            label="Output"
            value={cipherOutput}
            placeholder="TEST OUTPUT: 3A 7C 11 E4 98 2B 5F 07 9C 1D 6A 4F 10 29 88 0C"
            rows={6}
            helperText="Wynik tekstowy można skopiować jednym kliknięciem."
          />
        )}
      </div>

      <TheoryPanel blocks={ENCRYPTION_DATA.theory[algo] ?? []} />
    </section>
  );
};

export default EncryptionView;