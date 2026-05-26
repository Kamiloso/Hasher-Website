import { useEffect, useMemo, useState } from 'react';

interface FixedByteFieldProps {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  byteLength: number;
  placeholder?: string;
  helperText?: string;
  readOnly?: boolean;
}

const normalizeHex = (rawValue: string, byteLength: number) => {
  const cleanHex = rawValue.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, byteLength * 2);
  const pairs: string[] = [];

  for (let index = 0; index < cleanHex.length; index += 2) {
    pairs.push(cleanHex.slice(index, index + 2));
  }

  return pairs.join('-');
};

const FixedByteField = ({
  label,
  value,
  onChange,
  byteLength,
  placeholder,
  helperText,
  readOnly = false
}: FixedByteFieldProps) => {
  const [draft, setDraft] = useState(() => normalizeHex(value, byteLength));

  useEffect(() => {
    setDraft(normalizeHex(value, byteLength));
  }, [byteLength, value]);

  const expectedByteCount = useMemo(() => byteLength, [byteLength]);
  const hexDigitCount = draft.replace(/-/g, '').length;
  const byteCount = hexDigitCount / 2;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextDraft = normalizeHex(event.target.value, byteLength);
    setDraft(nextDraft);
    onChange(nextDraft);
  };

  const isComplete = hexDigitCount === expectedByteCount * 2;

  return (
    <div className="control-group fixed-byte-field">
      <label>{label}</label>
      <textarea
        className="fixed-byte-field__input"
        placeholder={placeholder ?? `Enter ${byteLength} bytes as hex, e.g. 00-11-22-33`}
        rows={3}
        value={draft}
        onChange={handleChange}
        readOnly={readOnly}
        spellCheck={false}
      />
      <p className="fixed-byte-field__helper">
        {helperText ?? `Expected length: ${byteLength} bytes. ${isComplete ? 'Length is complete.' : `Current length: ${byteCount.toFixed(1)} bytes.`}`}
      </p>
    </div>
  );
};

export default FixedByteField;