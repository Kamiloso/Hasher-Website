import { useState } from 'react';

export const createStateMap = <T,>(keys: string[], factory: (key: string) => T) => {
  return Object.fromEntries(keys.map((key) => [key, factory(key)])) as Record<string, T>;
};

export const useAlgorithmStateStore = <T,>(keys: string[], factory: (key: string) => T) => {
  const [activeKey, setActiveKey] = useState(keys[0] ?? '');
  const [stateByKey, setStateByKey] = useState<Record<string, T>>(() => createStateMap(keys, factory));

  const currentState = stateByKey[activeKey] ?? factory(activeKey);

  const updateCurrentState = (updater: (current: T) => T) => {
    setStateByKey((currentValues) => ({
      ...currentValues,
      [activeKey]: updater(currentValues[activeKey] ?? factory(activeKey))
    }));
  };

  return {
    activeKey,
    setActiveKey,
    stateByKey,
    setStateByKey,
    currentState,
    updateCurrentState
  };
};