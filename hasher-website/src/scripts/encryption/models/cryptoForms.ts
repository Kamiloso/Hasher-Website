export type EncryptionFormState = {
  encryptionInput: string;
  keyBytes: Record<string, string[]>;
  byteValues: Record<string, string[]>;
  keyTextValues: Record<string, string>;
  salt: string;
  counter: string;
  output: string;
};

export const createEncryptionFormState = (): EncryptionFormState => ({
  encryptionInput: '',
  keyBytes: {
    symmetric: [],
    publicKey: [],
    privateKey: []
  },
  byteValues: {
    nonce: [],
    iv: []
  },
  keyTextValues: {
    symmetric: '',
    publicKey: '',
    privateKey: ''
  },
  salt: '',
  counter: '0',
  output: ''
});