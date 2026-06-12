import { type TheoryBlock } from '../../../components/TheoryPanel';

export type AlgorithmMode = 'symmetric' | 'asymmetric' | 'stream';
export type InputType = 'byte' | 'text' | 'number';
export type OutputKind = 'bytes' | 'text' | 'number';

export interface KeySizeOption {
  value: number;
  label: string;
}

export interface FieldDef {
  key?: string;
  label: string;
  byteLength?: number;
  columns?: number;
  placeholder?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
}

export interface GenerateActionDef {
  label: string;
  fields: string[];
  outputKind: OutputKind;
}

export interface AlgorithmVariant {
  key: string;
  label: string;
  byteFields: FieldDef[];
  
  showSalt?: boolean;
  saltLabel?: string;
  saltPlaceholder?: string;
  
  showCounter?: boolean;
  counterLabel?: string;
  counterPlaceholder?: string;
  
  generateActionOverride?: GenerateActionDef;
  baseKeyFieldOverride?: FieldDef;
}

export interface AlgorithmGroup {
  key: string;
  label: string;
  mode: AlgorithmMode;
  
  keyInputType: InputType;
  keyLabel: string;
  keyPlaceholder?: string;
  keyTextPlaceholder?: string;
  
  keySizeLabel?: string;
  keySizeOptions?: KeySizeOption[];
  keySizeDefault?: number;

  baseKeyFieldConfig?: FieldDef;
  baseGenerateAction?: GenerateActionDef;

  variants: AlgorithmVariant[];
  theory: TheoryBlock[];
}

export const ENCRYPTION_REGISTRY: AlgorithmGroup[] = [
  {
    key: 'aes',
    label: 'AES',
    mode: 'symmetric',
    keyInputType: 'byte',
    keyLabel: 'Symmetric Key',
    keyPlaceholder: 'Enter 32-byte key...',
    keySizeLabel: 'AES Key Size',
    keySizeOptions: [
      { value: 16, label: '16 bytes' },
      //{ value: 24, label: '24 bytes' }, -- web API says it's not supported
      { value: 32, label: '32 bytes' }
    ],
    keySizeDefault: 32,
    baseKeyFieldConfig: {
      label: 'Symmetric Key',
      byteLength: 32,
      columns: 8
    },
    theory: [
      {
        title: 'Mechanism of Action',
        content: 'AES (Advanced Encryption Standard) is a symmetric block cipher based on a substitution-permutation network. It operates on fixed 128-bit data blocks using key sizes of 128, 192, or 256 bits, processing data through multiple rounds of substitution, transposition, and mixing operations.'
      },
      {
        title: 'History',
        content: 'Officially standardized by NIST in 2001 (FIPS 197) after an open competition to replace the aging Data Encryption Standard (DES). It is based on the Rijndael cipher designed by Belgian cryptographers Joan Daemen and Vincent Rijmen.'
      },
      {
        title: 'Usage',
        content: 'The global standard for symmetric encryption. It is utilized universally for securing data at rest (disk encryption) and data in transit (TLS/HTTPS). The specific mode of operation (like CBC or GCM) determines how it handles larger datasets and authentication.'
      },
    ],
    variants: [
      {
        key: 'aes_gcm',
        label: 'AES-GCM',
        byteFields: [
          { key: 'nonce', label: 'Nonce', byteLength: 12, columns: 8, placeholder: 'Enter 12-byte nonce...' }
        ],
        generateActionOverride: {
          label: 'Generate Data',
          fields: ['symmetric', 'nonce'],
          outputKind: 'bytes'
        }
      },
      {
        key: 'aes_cbc',
        label: 'AES-CBC',
        byteFields: [
          { key: 'iv', label: 'IV', byteLength: 16, columns: 8, placeholder: 'Enter 16-byte IV...' }
        ],
        generateActionOverride: {
          label: 'Generate Data',
          fields: ['symmetric', 'iv'],
          outputKind: 'bytes'
        }
      },
      {
        key: 'aes_ctr',
        label: 'AES-CTR',
        byteFields: [
          { key: 'iv', label: 'Initial Counter Block', byteLength: 16, columns: 8, placeholder: 'Enter 16-byte initial block...' }
        ],
        generateActionOverride: {
          label: 'Generate Data',
          fields: ['symmetric', 'iv'],
          outputKind: 'bytes'
        }
      }
    ]
  },
  /*{
    key: 'chacha',
    label: 'ChaCha',
    mode: 'stream',
    keyInputType: 'byte',
    keyLabel: 'Symmetric Key',
    keyPlaceholder: 'Enter 32-byte key...',
    baseKeyFieldConfig: {
      label: 'Symmetric Key',
      byteLength: 32,
      columns: 8
    },
    baseGenerateAction: {
      label: 'Generate Data',
      fields: ['symmetric', 'nonce'],
      outputKind: 'bytes'
    },
    theory: [
      {
        title: 'Mechanism of Action',
        content: 'ChaCha20 is a stream cipher that initializes a 512-bit state matrix using a 256-bit key, a 96-bit nonce, and a 32-bit counter. It applies 20 rounds of quarter-round operations (Addition, Rotation, and XOR) to generate a pseudorandom keystream, which is then XORed with the plaintext.'
      },
      {
        title: 'History',
        content: 'Designed by Daniel J. Bernstein in 2008. It was created as an evolution of his earlier Salsa20 cipher to increase cryptographic diffusion per round while maintaining high performance in software.'
      },
      {
        title: 'Usage',
        content: 'Standardized in RFC 8439, it is heavily favored in environments that lack hardware-accelerated AES instructions (such as mobile devices). It is frequently paired with the Poly1305 authenticator to provide Authenticated Encryption with Associated Data (AEAD).'
      }
    ],
    variants: [
      {
        key: 'chacha20',
        label: 'ChaCha20',
        byteFields: [
          { key: 'nonce', label: 'Nonce', byteLength: 12, columns: 8, placeholder: 'Enter 12-byte nonce...' },
          { key: 'counter', label: 'Initial Counter', byteLength: 4, columns: 8, placeholder: 'Enter 4-byte counter...' }
        ],
        generateActionOverride: {
          label: 'Generate Data',
          fields: ['symmetric', 'nonce', 'counter'],
          outputKind: 'bytes'
        }
      },
      {
        key: 'chacha20_poly1305',
        label: 'ChaCha20-Poly1305',
        byteFields: [
          { key: 'nonce', label: 'Nonce', byteLength: 12, columns: 8 }
        ]
      }
    ]
  },*/
  {
    key: 'rsa',
    label: 'RSA',
    mode: 'asymmetric',
    keyInputType: 'text',
    keyLabel: 'Key Pair',
    keyTextPlaceholder: 'Paste RSA key material or generated key text...',
    keySizeLabel: 'RSA Key Size',
    keySizeOptions: [
      { value: 1024, label: '1024 bits' },
      { value: 2048, label: '2048 bits' },
      { value: 4096, label: '4096 bits' }
    ],
    keySizeDefault: 2048,
    baseGenerateAction: {
      label: 'Generate Keys',
      fields: ['publicKey', 'privateKey'],
      outputKind: 'text'
    },
    theory: [
      {
        title: 'Mechanism of Action',
        content: 'RSA is an asymmetric cryptosystem utilizing a key pair: a public key for encryption and a private key for decryption. Its mathematical security is grounded in the practical difficulty of integer factorization—specifically, the challenge of factoring the product of two very large prime numbers.'
      },
      {
        title: 'History',
        content: 'Publicly described in 1977 by Ron Rivest, Adi Shamir, and Leonard Adleman at MIT. It became the foundational algorithm for public-key infrastructure (PKI) across the early internet.'
      },
      {
        title: 'Usage',
        content: 'Due to its high computational overhead, RSA is rarely used to encrypt bulk data. According to RFC 8017, it is primarily employed for securely encapsulating symmetric keys (key wrapping) and generating digital signatures for certificates.'
      }
    ],
    variants: [
      {
        key: 'rsa_oaep',
        label: 'RSA (OAEP)',
        byteFields: [],
        showSalt: false,
        showCounter: false
      },
      {
        key: 'rsa_pss',
        label: 'RSA (PSS)',
        byteFields: [],
        showSalt: false,
        showCounter: false
      }
    ]
  },
  {
    key: 'ecc',
    label: 'ECC',
    mode: 'asymmetric',
    keyInputType: 'text',
    keyLabel: 'Key Pair',
    baseGenerateAction: {
      label: 'Generate Keys',
      fields: ['publicKey', 'privateKey'],
      outputKind: 'text'
    },
    theory: [
      {
        title: 'Mechanism of Action',
        content: 'Elliptic Curve Cryptography (ECC) is an approach to public-key cryptography based on the algebraic structure of elliptic curves over finite fields. Its security relies on the intractability of the Elliptic Curve Discrete Logarithm Problem (ECDLP).'
      },
      {
        title: 'History',
        content: 'The use of elliptic curves in cryptography was suggested independently by Neal Koblitz and Victor Miller in 1985. It gained widespread standardization (FIPS 186-4) in the 2000s as computing transitioned to mobile environments.'
      },
      {
        title: 'Usage',
        content: 'Provides equivalent cryptographic strength to RSA using significantly smaller key sizes (e.g., a 256-bit ECC key matches a 3072-bit RSA key). It is the modern standard for digital signatures (ECDSA) and key agreement protocols (ECDH).'
      }
    ],
    variants: [
      {
        key: 'ecc_p256',
        label: 'ECC (secp256r1)',
        byteFields: [],
        showSalt: false,
        showCounter: false
      },
      {
        key: 'ecc_p384',
        label: 'ECC (secp384r1)',
        byteFields: [],
        showSalt: false,
        showCounter: false
      }
    ]
  },
  {
    key: 'caesar',
    label: 'Caesar',
    mode: 'symmetric',
    keyInputType: 'number',
    keyLabel: 'Shift Key',
    baseKeyFieldConfig: {
      label: 'Shift Value',
      min: 0,
      max: 25,
      defaultValue: 3
    },
    baseGenerateAction: {
      label: 'Randomize Shift',
      fields: ['symmetric'],
      outputKind: 'number'
    },
    theory: [
      {
        title: 'Mechanism of Action',
        content: 'The Caesar cipher is a basic substitution cipher where each letter in the plaintext is replaced by a letter a fixed number of positions down the alphabet. For example, with a shift of 3, A becomes D, B becomes E, and so on. The alphabet wraps around, so Z would become C.'
      },
      {
        title: 'History',
        content: 'The cipher is named after Julius Caesar, who reportedly used it with a shift of three to protect important military messages. While it provided a reasonable level of security in ancient times when most of his enemies were illiterate, it is one of the earliest known and simplest ciphers.'
      },
      {
        title: 'Usage',
        content: 'Modern cryptography considers the Caesar cipher entirely insecure. It offers no real protection because it can be trivially broken by brute force (trying all 25 possible shifts) or frequency analysis. Today, it is mainly used for educational purposes or as a component in basic obfuscation puzzles like ROT13.'
      }
    ],
    variants: [
      {
        key: 'caesar_english',
        label: 'English Alphabet (A-Z)',
        byteFields: [],
        showSalt: false,
        showCounter: false
      }
    ]
  }
];

export const getAlgorithmOptions = () =>
  ENCRYPTION_REGISTRY.flatMap((group) =>
    group.variants.map((variant) => ({
      value: variant.key,
      label: variant.label,
    }))
  );

export const getConfigForVariant = (variantKey: string) => {
  for (const group of ENCRYPTION_REGISTRY) {
    const variant = group.variants.find((v) => v.key === variantKey);
    if (variant) {
      return {
        group,
        variant,
        activeKeyField: variant.baseKeyFieldOverride ?? group.baseKeyFieldConfig,
        activeGenerateAction: variant.generateActionOverride ?? group.baseGenerateAction
      };
    }
  }
  return null;
};