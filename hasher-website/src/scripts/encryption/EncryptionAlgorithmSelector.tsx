import { ENCRYPTION_REGISTRY, type AlgorithmGroup } from './configs/encryptionConstants';
import { buildStateKey } from './services/encryptionStateKey';

interface EncryptionAlgorithmSelectorProps {
  activeGroup: AlgorithmGroup | undefined;
  algo: string; // Odpowiada za variantKey
  activeKeySize: number;
  setStateKey: (key: string) => void;
  setMode: (mode: 'encrypt' | 'decrypt') => void;
  mode: 'encrypt' | 'decrypt';
}

export const EncryptionAlgorithmSelector = ({
  activeGroup,
  algo,
  activeKeySize,
  setStateKey,
  setMode,
  mode,
}: EncryptionAlgorithmSelectorProps) => {
  return (
    <div className="control-group">
      <label>Algorithm Family</label>

      <div className="subtab-strip">
        {ENCRYPTION_REGISTRY.map((group) => (
          <button
            key={group.key}
            className={`tab-btn ${
              group.key === activeGroup?.key ? 'active' : ''
            }`}
            onClick={() => {
              const size =
                group.keySizeDefault ??
                group.keySizeOptions?.[0]?.value;

              setStateKey(
                buildStateKey(
                  group.variants[0]?.key,
                  size
                )
              );
            }}
          >
            {group.label}
          </button>
        ))}
      </div>

      {activeGroup?.variants && activeGroup.variants.length > 1 ? (
        <>
          <label>Variant</label>

          <div className="subtab-strip">
            {activeGroup.variants.map((variant) => (
              <button
                key={variant.key}
                className={`tab-btn ${
                  variant.key === algo ? 'active' : ''
                }`}
                onClick={() => {
                  setStateKey(
                    buildStateKey(
                      variant.key,
                      activeKeySize
                    )
                  );
                }}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {activeGroup?.keySizeOptions && activeGroup.keySizeOptions.length > 0 ? (
        <>
          <label>Key Size</label>

          <div className="subtab-strip">
            {activeGroup.keySizeOptions.map((opt) => (
              <button
                key={opt.value}
                className={`tab-btn ${
                  opt.value === activeKeySize ? 'active' : ''
                }`}
                onClick={() => {
                  setStateKey(buildStateKey(algo, opt.value));
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <label>Mode</label>

      <div className="subtab-strip">
        {(['encrypt', 'decrypt'] as const).map((m) => (
          <button
            key={m}
            className={`tab-btn ${
              mode === m ? 'active' : ''
            }`}
            onClick={() => setMode(m)}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};