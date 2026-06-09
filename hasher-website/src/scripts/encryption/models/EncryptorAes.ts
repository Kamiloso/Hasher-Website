export const aesAlgorithm = {
  encrypt: async (input: string, options: { 
    variant: string, 
    key: Uint8Array, 
    iv?: Uint8Array, 
    nonce?: Uint8Array, 
    mode: 'encrypt' | 'decrypt' 
  }) => {
    
    // Tutaj: wywołanie Web Crypto API (SubtleCrypto)
    return `AES ${options.variant} ${options.mode} result`;
  }
};
