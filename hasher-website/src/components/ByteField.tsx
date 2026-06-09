import { useEffect, useMemo, useRef } from 'react';
import { type CSSProperties } from 'react';
import { CopyButton } from './FormControls';

interface ByteFieldProps {
  label: string;
  byteLength: number;
  value: string[];
  onChange: (nextValue: string[]) => void;
  helperText?: string;
  readOnly?: boolean;
  columns?: number;
}

const normalizeByte = (input: string) => {
  return input
    .replace(/[^0-9a-fA-F]/g, '')
    .toUpperCase()
    .slice(0, 2)
    .padEnd(2, '');
};

const parseClipboardBytes = (clipboardText: string) => {
  const trimmed = clipboardText.trim();

  if (!trimmed) {
    return [] as string[];
  }

  const hexOnly = trimmed.replace(/[^0-9a-fA-F]/g, '');
  if (hexOnly.length >= 2 && hexOnly.length % 2 === 0 && hexOnly.length / 2 >= 1) {
    return hexOnly.match(/.{1,2}/g)?.map((byte) => byte.toUpperCase()) ?? [];
  }

  return Array.from(new TextEncoder().encode(trimmed), (byte) => byte.toString(16).toUpperCase().padStart(2, '0'));
};

const ByteField = ({
  label,
  byteLength,
  value,
  onChange,
  helperText,
  readOnly = false,
  columns = 8
}: ByteFieldProps) => {
  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);

  const bytes = useMemo(() => {
    const next = Array.from({ length: byteLength }, (_, index) => value[index] ?? '');
    return next;
  }, [byteLength, value]);

  const hasValue = bytes.some((byte) => byte.length > 0);
  const canReset = hasValue && !readOnly;

  useEffect(() => {
    if (value.length !== byteLength) {
      onChange(bytes);
    }
  }, [byteLength, bytes, onChange, value.length]);

  const handleByteChange = (index: number, nextValue: string) => {
    const nextBytes = [...bytes];
    nextBytes[index] = normalizeByte(nextValue);
    onChange(nextBytes);

    if (nextBytes[index].length === 2 && index < byteLength - 1) {
      cellRefs.current[index + 1]?.focus();
      cellRefs.current[index + 1]?.select();
    }
  };

  const focusCell = (index: number) => {
    if (index < 0 || index >= byteLength) {
      return;
    }

    const cell = cellRefs.current[index];
    cell?.focus();
    cell?.select();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const pastedBytes = parseClipboardBytes(event.clipboardData.getData('text'));

    if (!pastedBytes.length) {
      return;
    }

    event.preventDefault();

    const nextBytes = [...bytes];
    pastedBytes.forEach((byte, offset) => {
      const targetIndex = index + offset;
      if (targetIndex < byteLength) {
        nextBytes[targetIndex] = normalizeByte(byte);
      }
    });

    onChange(nextBytes);
    focusCell(Math.min(byteLength - 1, index + pastedBytes.length));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    switch (event.key) {
      case 'ArrowLeft': event.preventDefault(); focusCell(index - 1); break;
      case 'ArrowRight': event.preventDefault(); focusCell(index + 1); break;
      case 'ArrowUp': event.preventDefault(); focusCell(index - columns); break;
      case 'ArrowDown': event.preventDefault(); focusCell(index + columns); break;
      case 'Home': event.preventDefault(); focusCell(0); break;
      case 'End': event.preventDefault(); focusCell(byteLength - 1); break;
      case 'Enter': event.preventDefault(); focusCell(index + 1); break;
      case 'Backspace':
        if (!bytes[index] && index > 0) {
          event.preventDefault();
          focusCell(index - 1);
        }
        break;
      default: break;
    }
  };

  const handleReset = () => {
    if (!canReset) {
      return;
    }

    onChange(Array.from({ length: byteLength }, () => ''));
  };

  return (
    <div className="control-group fixed-byte-field">
      <div className="field-header">
        <label>{label}</label>
        <div className="control-actions">
          <CopyButton text={bytes.filter(Boolean).join(' ')} disabled={!hasValue} />
          <button
            type="button"
            className="copy-btn copy-btn--reset"
            onClick={handleReset}
            disabled={!canReset}
          >
            Reset
          </button>
        </div>
      </div>
      <div
        className="byte-editor"
        role="group"
        aria-label={label}
        style={{ '--byte-columns': columns } as CSSProperties}
      >
        {bytes.map((byte, index) => (
          <input
            key={index}
            className="byte-editor__cell"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            readOnly={readOnly}
            maxLength={2}
            placeholder="--"
            value={byte}
            ref={(element) => {
              cellRefs.current[index] = element;
            }}
            onChange={(event) => handleByteChange(index, event.target.value)}
            onPaste={(event) => handlePaste(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onFocus={(event) => event.currentTarget.select()}
            aria-label={`${label} byte ${index + 1}`}
          />
        ))}
      </div>
      <p className="fixed-byte-field__helper">{helperText ?? `Expected length: ${byteLength} bytes.`}</p>
    </div>
  );
};

export default ByteField;