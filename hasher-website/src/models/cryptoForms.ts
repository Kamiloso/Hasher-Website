import { generateByteSequence } from '../lib/cryptoGenerators';

export type EncryptionFormState = {
  encryptionInput: string;
  keyBytes: Record<string, string[]>;
  byteValues: Record<string, string[]>;
  keyTextValues: Record<string, string>;
  salt: string;
  counter: string;
};

export type HashFormState = {
  hashInputText: string;
  salt: string;
  kdf: 'none' | 'hmac' | 'pbkdf2' | 'argon2';
  hmacKey?: string;
  iterations: number;
  argon2MemoryKb: number;
  argon2Parallelism: number;
  argon2TimeCost: number;
};

type HashStateConfig = {
  defaultSalt: string;
  defaultKdf: HashFormState['kdf'];
  defaultArgon2MemoryKb?: number;
  defaultArgon2Parallelism?: number;
  defaultArgon2TimeCost?: number;
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
  counter: '0'
});

export const createHashFormState = (config: HashStateConfig): HashFormState => ({
  hashInputText: '',
  salt: config.defaultSalt,
  kdf: config.defaultKdf,
  iterations: 100000,
  argon2MemoryKb: config.defaultArgon2MemoryKb ?? 65536,
  argon2Parallelism: config.defaultArgon2Parallelism ?? 2,
  argon2TimeCost: config.defaultArgon2TimeCost ?? 3
});