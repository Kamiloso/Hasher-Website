import { useState } from 'react';
import TheoryPanel from '../TheoryPanel';
import hashingData from '../../assets/data/hashing.json';
import { ActionButton, LongOutputField, LongTextField, ShortTextField } from '../FormControls';

type HashTheoryBlock = {
  title: string;
  content: string;
};

type HashingDataset = {
  algorithmOptions: Array<{ value: string; label: string }>;
  config: Record<
    string,
    {
      label: string;
      saltPolicy: 'optional' | 'recommended' | 'none';
      saltLabel: string;
      defaultSalt: string;
      defaultKdf: 'none' | 'pbkdf2' | 'scrypt' | 'argon2';
      allowKdf: boolean;
      builtInKdfLabel?: string;
    }
  >;
  kdfOptions: Array<{ value: 'none' | 'pbkdf2' | 'scrypt'; label: string }>;
  theory: Record<string, HashTheoryBlock[]>;
};

const HASHING_DATA = hashingData as unknown as HashingDataset;

const KDF_OPTIONS = HASHING_DATA.kdfOptions;
const ALGORITHM_OPTIONS = HASHING_DATA.algorithmOptions;

const HashingView = () => {
  const [hashAlgo, setHashAlgo] = useState(ALGORITHM_OPTIONS[0]?.value ?? '');
  const [kdf, setKdf] = useState<'none' | 'pbkdf2' | 'scrypt' | 'argon2'>('none');
  const [iterations, setIterations] = useState(100000);
  const [salt, setSalt] = useState('');
  const [hashInputText, setHashInputText] = useState('');
  const [hashOutputText] = useState('TEST OUTPUT: 9F 86 D0 81 88 4C 7D 65 9A 2F EA A0 C5 5A D0 15 A3 BF 4F 1B 2B 0B 82 2C D1 5D 6C 15 B0 F0 0A 08');

  const config = HASHING_DATA.config[hashAlgo] ?? HASHING_DATA.config[ALGORITHM_OPTIONS[0]?.value ?? ''];
  if (!config) {
    return null;
  }

  const showSalt = config.saltPolicy !== 'none';
  const showKdf = config.allowKdf || config.defaultKdf === 'argon2';
  const effectiveKdf = config.defaultKdf === 'argon2' ? 'argon2' : kdf;

  return (
    <section className="tool-section">
      <div className="workspace">
        <h2>Data Hashing</h2>
        
        <div className="control-group">
          <label htmlFor="hash-select">Hash Function</label>
          <select
            id="hash-select"
            value={hashAlgo}
            onChange={(e) => setHashAlgo(e.target.value)}
          >
            {ALGORITHM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {showKdf && (
          <div className="control-group">
            <label htmlFor="kdf-select">KDF</label>
            <select
              id="kdf-select"
              value={effectiveKdf}
              onChange={(e) => setKdf(e.target.value as 'none' | 'pbkdf2' | 'scrypt' | 'argon2')}
              disabled={hashAlgo === 'argon2'}
            >
              {hashAlgo === 'argon2' ? (
                <option value="argon2">{config.builtInKdfLabel}</option>
              ) : (
                KDF_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {showKdf && effectiveKdf === 'pbkdf2' && (
          <div className="control-group">
            <label htmlFor="iterations">PBKDF2 Iterations</label>
            <input
              id="iterations"
              type="number"
              min={1000}
              step={1000}
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value) || 1000)}
            />
          </div>
        )}

        <LongTextField
          label="Input Data"
          value={hashInputText}
          onChange={setHashInputText}
          onReset={() => setHashInputText('')}
          placeholder="Enter string to hash..."
          helperText="Hashing pozostaje tekstowe, bez byte fieldów."
          rows={4}
        />

        {showSalt && (
          <ShortTextField
            label={config.saltLabel}
            value={salt}
            onChange={setSalt}
            onReset={() => setSalt('')}
            placeholder={
              hashAlgo === 'argon2'
                ? 'Enter cryptographic salt...'
                : 'Enter salt if you want one...'
            }
            helperText="Salt można kopiować i resetować tak samo jak inne pola tekstowe."
          />
        )}

        <div className="action-buttons">
          <ActionButton variant="primary">Compute Hash</ActionButton>
          <ActionButton variant="secondary">Reset</ActionButton>
        </div>

        <LongOutputField
          label="Hash Output (Hexadecimal)"
          value={hashOutputText}
          placeholder="TEST OUTPUT: 9F 86 D0 81 88 4C 7D 65 9A 2F EA A0 C5 5A D0 15 A3 BF 4F 1B 2B 0B 82 2C D1 5D 6C 15 B0 F0 0A 08"
          rows={3}
          helperText="Wynik hasha pozostaje tekstowy i kopiowalny."
        />
      </div>

      <TheoryPanel blocks={HASHING_DATA.theory[hashAlgo] ?? []} />
    </section>
  );
};

export default HashingView;