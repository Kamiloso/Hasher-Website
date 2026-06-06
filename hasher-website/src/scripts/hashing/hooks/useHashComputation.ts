import { useState } from 'react';
import { executeHash } from '../services/hashExecutor';

export const useHashComputation = () => {
  const [isComputing, setComputing] = useState(false);

  const compute = async (
    activeGroupKey: string,
    hashAlgo: string,
    state: any,
    setOutput: (val: string) => void
  ) => {
    try {
      setComputing(true);
      setOutput('');

      const result = await executeHash(
        activeGroupKey,
        hashAlgo,
        state
      );

      setOutput(result);
    } catch(error: any) {
      console.error(error);
      setOutput(`Error: ${error.message}`);
    } finally {
      setComputing(false);
    }
  };

  return {
    isComputing,
    compute
  };
};