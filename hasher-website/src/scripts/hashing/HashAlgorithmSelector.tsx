import type { HashFormState } from './models/cryptoForms';
import { HASHING_GROUPS, type HashAlgorithmGroup } from './configs/hashingConstants';

type Props = {
  activeGroup: HashAlgorithmGroup;
  hashAlgo: string;
  setHashAlgo: (algo: string) => void;
  currentState: HashFormState;
  updateCurrentState: (
    updater: (state: HashFormState) => HashFormState
  ) => void;
};

const HashAlgorithmSelector = ({
  activeGroup,
  hashAlgo,
  setHashAlgo,
  currentState,
  updateCurrentState
}: Props) => {
  return (
    <div className="control-group">
      <label>Hash Family</label>

      <div className="subtab-strip">
        {HASHING_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            className={`tab-btn ${
              group.id === activeGroup.id ? 'active' : ''
            }`}
            onClick={() => {
              setHashAlgo(group.variants[0]?.id ?? hashAlgo);

              if (
                group.id === 'md5' &&
                currentState.kdf !== 'none' &&
                currentState.kdf !== 'hmac'
              ) {
                updateCurrentState((prevState) => ({
                  ...prevState,
                  kdf: 'none'
                }));
              }
            }}
          >
            {group.label}
          </button>
        ))}
      </div>

      {activeGroup.variants.length > 1 ? (
        <>
          <label>Variant</label>

          <div className="subtab-strip">
            {activeGroup.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                className={`tab-btn ${
                  variant.id === hashAlgo ? 'active' : ''
                }`}
                onClick={() => {
                  setHashAlgo(variant.id);
                }}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default HashAlgorithmSelector;