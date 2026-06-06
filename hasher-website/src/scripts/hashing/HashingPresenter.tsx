import HashingView from './HashingView.tsx';
import HashAlgorithmSelector from './HashAlgorithmSelector.tsx';

import { ActionButton, LongOutputField } from '../../components/FormControls';
import { useHashingState } from './hooks/useHashingState';
import { useHashComputation } from './hooks/useHashComputation.ts';
import { buildHashingControls } from './HashingControls.tsx';

import {
  getAlgorithmConfig,
  findGroupForVariant,
  KDF_OPTIONS,
  ALGORITHM_KEYS
} from './configs/hashingConstants.ts';

const HashingPresenter = () => {
  const {
    activeKey: hashAlgo,
    setActiveKey: setHashAlgo,
    currentState,
    updateCurrentState
  } = useHashingState();

  const {
    isComputing,
    compute
  } = useHashComputation();

  const config =
    getAlgorithmConfig(hashAlgo) ??
    getAlgorithmConfig(ALGORITHM_KEYS[0] ?? '');

  if (!config) {
    return null;
  }

  const activeGroup = findGroupForVariant(hashAlgo);

  const handleSetOutput = (val: string) => {
    updateCurrentState(s => ({ ...s, output: val }));
  };

  const {
    kdfControl,
    iterationsControl,
    argon2Controls,
    inputControl,
    saltControl,
    hmacKeyControl
  } = buildHashingControls({
    config,
    currentState,
    kdfOptions: KDF_OPTIONS,
    updateCurrentState
  });

  const algorithmSelect = (
    <HashAlgorithmSelector
      activeGroup={activeGroup}
      hashAlgo={hashAlgo}
      setHashAlgo={setHashAlgo}
      currentState={currentState}
      updateCurrentState={updateCurrentState}
    />
  );

  const actionButtons = (
    <div className="action-buttons">
      <ActionButton
        variant="primary"
        onClick={() =>
          compute(
            activeGroup.id,
            hashAlgo,
            currentState,
            handleSetOutput
          )
        }
        disabled={isComputing}
      >
        {isComputing
          ? 'Computing...'
          : 'Compute Hash'}
      </ActionButton>
    </div>
  );

  const outputControl = (
    <LongOutputField
      label="Hash Output (Hexadecimal)"
      value={currentState.output ?? ''}
      placeholder=""
      rows={3}
    />
  );

  const theoryBlocks = activeGroup.theory;

  return (
    <HashingView
      title="Data Hashing"
      algorithmSelect={algorithmSelect}
      kdfControl={kdfControl}
      iterationsControl={iterationsControl}
      argon2Controls={argon2Controls}
      hmacKeyControl={hmacKeyControl}
      inputControl={inputControl}
      saltControl={saltControl}
      actionButtons={actionButtons}
      outputControl={outputControl}
      theoryBlocks={theoryBlocks}
    />
  );
};

export default HashingPresenter;