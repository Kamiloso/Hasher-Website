export const eccAlgorithm = {
  encrypt: async (input: string, options: { 
    variant: string, 
    publicKey: Uint8Array, 
    mode: 'encrypt' | 'decrypt' 
  }) => {
    
    return `ECC ${options.variant} ${options.mode} result`;
  }
};