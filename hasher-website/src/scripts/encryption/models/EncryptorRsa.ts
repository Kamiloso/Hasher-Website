export const rsaAlgorithm = {
  encrypt: async (input: string, options: { 
    variant: string, 
    publicKey?: string, 
    privateKey?: string, 
    mode: 'encrypt' | 'decrypt'
  }) => {

    return `RSA ${options.variant} ${options.mode} result`;
  }
};