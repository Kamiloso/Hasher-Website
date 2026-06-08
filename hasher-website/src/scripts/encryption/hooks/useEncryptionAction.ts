import { useState } from 'react';

export const useEncryptionActions = () => {
  const [isComputing, setIsComputing] = useState(false);

  const compute = async (
    params: any,
    setOutput: (val: string) => void) => {
    
    try {
      setIsComputing(true);
      setOutput('');
      
      const result = await params.executor();

      setOutput(result);
      
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
      window.alert(`An error occurred: ${e.message}`);

    } finally {
      setIsComputing(false);
    }
  };

  return {
    isComputing,
    compute
  };
};