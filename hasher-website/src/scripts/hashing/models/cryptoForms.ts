export type HashFormState = {
  hashInputText: string;
  salt: string;
  kdf: 'none' | 'hmac' | 'pbkdf2' | 'argon2';
  hmacKey: string;
  iterations: number;
  argon2MemoryKb: number;
  argon2Parallelism: number;
  argon2TimeCost: number;
  output: string;
};

type HashStateConfig = {
  defaultSalt: string;
  defaultKdf: HashFormState['kdf'];
  defaultHmacKey: string;
  defaultArgon2MemoryKb?: number;
  defaultArgon2Parallelism?: number;
  defaultArgon2TimeCost?: number;
};

export const createHashFormState = (config: HashStateConfig): HashFormState => ({
  hashInputText: '',
  salt: config.defaultSalt,
  kdf: config.defaultKdf,
  hmacKey: config.defaultHmacKey,
  iterations: 100000,
  argon2MemoryKb: config.defaultArgon2MemoryKb ?? 65536,
  argon2Parallelism: config.defaultArgon2Parallelism ?? 2,
  argon2TimeCost: config.defaultArgon2TimeCost ?? 3,
  output: ''
});