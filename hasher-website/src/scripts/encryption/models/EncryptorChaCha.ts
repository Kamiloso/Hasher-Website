export const chaChaAlgorithm = {
  encrypt: async (input: string, options: { 
    variant: string, 
    key: Uint8Array, 
    nonce: Uint8Array, 
    counter?: Uint8Array, 
    mode: 'encrypt' | 'decrypt' 
  }) => {
    
    return `ChaCha ${options.variant} ${options.mode} result`;
  }
};