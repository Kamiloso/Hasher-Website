import type { ReactNode } from 'react';
import { LongTextField, ShortTextField } from '../FormControls';
import type { HashFormState } from './models/cryptoForms';

export type Argon2ParamConfig = {
  defaultMemoryKb: number;
  defaultParallelism: number;
  defaultTimeCost: number;
};

export type HashingConfig = {
  saltPolicy: 'optional' | 'recommended' | 'none';
  saltLabel: string;
  allowKdf: boolean;
  argon2Params?: Argon2ParamConfig;
};

export type HashingControlContext = {
  config: HashingConfig;
  currentState: HashFormState;
  kdfOptions: Array<{ value: HashFormState['kdf']; label: string }>;
  updateCurrentState: (updater: (state: HashFormState) => HashFormState) => void;
};

export type HashingControls = {
  kdfControl: ReactNode | null;
  iterationsControl: ReactNode | null;
  argon2Controls: ReactNode | null;
  inputControl: ReactNode;
  saltControl: ReactNode | null;
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