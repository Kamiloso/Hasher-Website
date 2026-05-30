import { useState } from 'react'; // DODANE
import { ActionButton, LongOutputField } from '../controls/FormControls';
import { type TheoryBlock } from '../TheoryPanel';
import hashingData from '../../assets/data/hashing.json';
import { useAlgorithmStateStore } from '../../lib/useAlgorithmStateStore';
import { createHashFormState, type HashFormState } from '../../models/cryptoForms';
import HashingView from '../views/HashingView';
import { HASHING_VARIANT_GROUPS, findGroupForVariant } from './variantGroups';
import { buildHashingControls } from './algorithmControls';
import { shaAlgorithm, type ShaVariant } from '../../models/HasherSHA';

type HashTheoryBlock = TheoryBlock;

type HashingDataset = {
  algorithmOptions: Array<{ value: string; label: string }>;
  config: Record<
    string,
    {
      label: string;
      saltPolicy: 'optional' | 'recommended' | 'none';
      saltLabel: string;
      defaultSalt: string;
      defaultKdf: 'none' | 'pbkdf2' | 'scrypt';
      allowKdf: boolean;
      argon2Params?: {
        defaultMemoryKb: number;
        defaultParallelism: number;
        defaultTimeCost: number;
      };
    }
  >;
  kdfOptions: Array<{ value: 'none' | 'pbkdf2' | 'scrypt'; label: string }>;
  theory: Record<string, HashTheoryBlock[]>;
};

const HASHING_DATA = hashingData as unknown as HashingDataset;
const ALGORITHM_KEYS = HASHING_DATA.algorithmOptions.map((option) => option.value);
const KDF_OPTIONS = HASHING_DATA.kdfOptions;

const HashingPresenter = () => {
  const { activeKey: hashAlgo, setActiveKey: setHashAlgo, currentState, updateCurrentState } = useAlgorithmStateStore<HashFormState>(
    ALGORITHM_KEYS,
    (algo) => {
      const config = HASHING_DATA.config[algo] ?? HASHING_DATA.config[ALGORITHM_KEYS[0] ?? ''];
      return createHashFormState({
        defaultSalt: config?.defaultSalt ?? '',
        defaultKdf: config?.defaultKdf ?? 'none',
        defaultArgon2MemoryKb: config?.argon2Params?.defaultMemoryKb,
        defaultArgon2Parallelism: config?.argon2Params?.defaultParallelism,
        defaultArgon2TimeCost: config?.argon2Params?.defaultTimeCost
      });
    }
  );

  const [hashOutputText, setHashOutputText] = useState('');
  const [isComputing, setIsComputing] = useState(false);

  const config = HASHING_DATA.config[hashAlgo] ?? HASHING_DATA.config[ALGORITHM_KEYS[0] ?? ''];

  if (!config) {
    return null;
  }

  const activeGroup = findGroupForVariant(HASHING_VARIANT_GROUPS, hashAlgo);

  const handleComputeHash = async () => {
    if (!currentState.hashInputText) {
      setHashOutputText("Wpisz dane do zahashowania.");
      return;
    }

    setIsComputing(true);
    setHashOutputText('');

    const getStrictShaVariant = (key: string): ShaVariant => {
      const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, ''); 
      switch (normalized) {
        case 'sha1': return 'SHA-1';
        case 'sha256': return 'SHA-256';
        case 'sha384': return 'SHA-384';
        case 'sha512': return 'SHA-512';
        case 'sha3256': return 'SHA3-256';
        default: return 'SHA-256'; // Bezpieczny fallback
      }
    };

    try {
      if (activeGroup.key === 'sha') {
        
        const modelVariant = getStrictShaVariant(hashAlgo);

        const mode = currentState.kdf === 'pbkdf2' ? 'pbkdf2' : 'digest';

        const result = await shaAlgorithm.hash(currentState.hashInputText, {
          variant: modelVariant,
          mode: mode,
          salt: currentState.salt || undefined,
          iterations: currentState.iterations || 600000 
        });

        setHashOutputText(result);
      } else {
        setHashOutputText(`Algorithm ${activeGroup.label} is not hooked up yet!`);
      }
    } catch (error: any) {
      console.error("Hashing error:", error);
      setHashOutputText(`Error: ${error.message}`);
    } finally {
      setIsComputing(false);
    }
  };

  const algorithmSelect = (
    <div className="control-group">
      <label>Hash Family</label>
      <div className="subtab-strip">
        {HASHING_VARIANT_GROUPS.map((group) => (
          <button
            key={group.key}
            type="button"
            className={`tab-btn ${group.key === activeGroup.key ? 'active' : ''}`}
            onClick={() => {
              setHashAlgo(group.variants[0]?.key ?? hashAlgo);
              setHashOutputText(''); 
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
                key={variant.key}
                type="button"
                className={`tab-btn ${variant.key === hashAlgo ? 'active' : ''}`}
                onClick={() => {
                  setHashAlgo(variant.key);
                  setHashOutputText(''); 
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

  const { kdfControl, iterationsControl, argon2Controls, inputControl, saltControl } = buildHashingControls({
    config,
    currentState,
    kdfOptions: KDF_OPTIONS,
    updateCurrentState
  });

  const actionButtons = (
    <div className="action-buttons">
      <ActionButton 
        variant="primary" 
        onClick={handleComputeHash}
        disabled={isComputing}
      >
        {isComputing ? 'Computing...' : 'Compute Hash'}
      </ActionButton>
    </div>
  );

  const outputControl = (
    <LongOutputField
      label="Hash Output (Hexadecimal)"
      value={hashOutputText}
      placeholder=""
      rows={3}
    />
  );

  const theoryBlocks = HASHING_DATA.theory[activeGroup.key] ?? [];

  return (
    <HashingView
      title="Data Hashing"
      algorithmSelect={algorithmSelect}
      kdfControl={kdfControl}
      iterationsControl={iterationsControl}
      argon2Controls={argon2Controls}
      inputControl={inputControl}
      saltControl={saltControl}
      actionButtons={actionButtons}
      outputControl={outputControl}
      theoryBlocks={theoryBlocks}
    />
  );
};

export default HashingPresenter;