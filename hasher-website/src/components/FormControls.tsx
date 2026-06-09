import { useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes } from 'react';

type TextControlProps = {
  label: string;
  value: string;
  onChange?: (nextValue: string) => void;
  onReset?: () => void;
  placeholder?: string;
  helperText?: string;
  rows?: number;
  multiline?: boolean;
  readOnly?: boolean;
};

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

type CopyButtonProps = {
  text: string;
  className?: string;
  disabled?: boolean;
};

const CopyButton = ({ text, className, disabled = false }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!text || disabled) {
      return;
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  return (
    <button
      type="button"
      className={['copy-btn', copied ? 'copy-btn--copied' : '', className].filter(Boolean).join(' ')}
      disabled={disabled}
      onClick={() => void handleCopy()}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

const TextControl = ({
  label,
  value,
  onChange,
  onReset,
  placeholder,
  helperText,
  rows = 4,
  multiline = false,
  readOnly = false
}: TextControlProps) => {
  const hasValue = value.trim().length > 0;
  const canReset = hasValue && !readOnly;

  return (
    <div className="control-group control-field">
      <div className="field-header">
        <label>{label}</label>
        <div className="control-actions">
          <CopyButton text={value} disabled={!hasValue} />
          <button
            type="button"
            className="copy-btn copy-btn--reset"
            onClick={() => {
              if (onReset) {
                onReset();
                return;
              }

              onChange?.('');
            }}
            disabled={!canReset}
          >
            Reset
          </button>
        </div>
      </div>
      {multiline ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value}
          readOnly={readOnly}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className={readOnly ? 'read-only-output' : undefined}
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          readOnly={readOnly}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className={readOnly ? 'read-only-output' : undefined}
        />
      )}
      {helperText && <p className="fixed-byte-field__helper">{helperText}</p>}
    </div>
  );
};

const ActionButton = ({ variant = 'secondary', className, ...props }: ActionButtonProps) => {
  const variantClass = variant === 'primary' ? 'app-button--primary' : 'app-button--secondary';

  return <button {...props} className={['app-button', variantClass, className].filter(Boolean).join(' ')} />;
};

export const ShortTextField = (props: Omit<TextControlProps, 'multiline'>) => <TextControl {...props} multiline={false} />;
export const LongTextField = (props: Omit<TextControlProps, 'multiline'>) => <TextControl {...props} multiline rows={props.rows ?? 5} />;
export const ShortOutputField = (props: Omit<TextControlProps, 'multiline' | 'readOnly'>) => (
  <TextControl {...props} multiline={false} readOnly />
);
export const LongOutputField = (props: Omit<TextControlProps, 'multiline' | 'readOnly'>) => (
  <TextControl {...props} multiline rows={props.rows ?? 5} readOnly />
);
export { CopyButton, ActionButton };