import { ENCRYPTION_VARIANT_GROUPS } from './configs/encryptionConstants';
import { buildStateKey } from './services/encryptionStateKey';

export const EncryptionAlgorithmSelector = ({
  activeGroup,
  algo,
  activeKeySize,
  setStateKey,
  setMode,
  mode,
}: any) => {
  return (
    <div className="control-group">
      <label>Algorithm Family</label>

      <div className="subtab-strip">
        {ENCRYPTION_VARIANT_GROUPS.map((group) => (
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
            {activeGroup.variants.map((variant: any) => (
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
            {activeGroup.keySizeOptions.map((opt: any) => (
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
        {['encrypt', 'decrypt'].map((m) => (
          <button
            key={m}
            className={`tab-btn ${
              mode === m ? 'active' : ''
            }`}
            onClick={() =>
              setMode(m as 'encrypt' | 'decrypt')
            }
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};