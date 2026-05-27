type KeySizeOption = {
  value: number;
  label: string;
};

export type VariantGroup = {
  key: string;
  label: string;
  variants: Array<{ key: string; label: string }>;
  keySizeLabel?: string;
  keySizeOptions?: KeySizeOption[];
  keySizeDefault?: number;
};

export const ENCRYPTION_VARIANT_GROUPS: VariantGroup[] = [
  {
    key: 'aes',
    label: 'AES',
    keySizeLabel: 'AES Key Size',
    keySizeOptions: [
      { value: 16, label: '16 bytes' },
      { value: 24, label: '24 bytes' },
      { value: 32, label: '32 bytes' }
    ],
    keySizeDefault: 32,
    variants: [
      { key: 'aes_gcm', label: 'GCM' },
      { key: 'aes_cbc', label: 'CBC' },
      { key: 'aes_ctr', label: 'CTR' }
    ]
  },
  {
    key: 'chacha',
    label: 'ChaCha',
    variants: [
      { key: 'chacha20', label: 'ChaCha20' },
      { key: 'chacha20_poly1305', label: 'ChaCha20-Poly1305' }
    ]
  },
  {
    key: 'rsa',
    label: 'RSA',
    keySizeLabel: 'RSA Key Size',
    keySizeOptions: [
      { value: 1024, label: '1024 bits' },
      { value: 2048, label: '2048 bits' },
      { value: 4096, label: '4096 bits' }
    ],
    keySizeDefault: 2048,
    variants: [
      { key: 'rsa_oaep', label: 'OAEP' },
      { key: 'rsa_pss', label: 'PSS' }
    ]
  },
  {
    key: 'ecc',
    label: 'ECC',
    variants: [
      { key: 'ecc_p256', label: 'P-256' },
      { key: 'ecc_p384', label: 'P-384' }
    ]
  }
];

export const HASHING_VARIANT_GROUPS: VariantGroup[] = [
  {
    key: 'sha',
    label: 'SHA',
    variants: [
      { key: 'sha256', label: 'SHA-256' },
      { key: 'sha512', label: 'SHA-512' },
      { key: 'sha3_256', label: 'SHA3-256' },
      { key: 'sha1', label: 'SHA-1' }
    ]
  },
  {
    key: 'argon2',
    label: 'Argon2',
    variants: [{ key: 'argon2', label: '' }]
  },
  {
    key: 'md5',
    label: 'MD5',
    variants: [{ key: 'md5', label: '' }]
  },
  {
    key: 'blake',
    label: 'BLAKE',
    variants: [
      { key: 'blake2b', label: 'BLAKE2b' },
      { key: 'blake3', label: 'BLAKE3' }
    ]
  },
  {
    key: 'crc32',
    label: 'CRC32',
    variants: [{ key: 'crc32', label: '' }]
  }
];

export const findGroupForVariant = (groups: VariantGroup[], variantKey: string) => {
  return groups.find((group) => group.variants.some((variant) => variant.key === variantKey)) ?? groups[0];
};

export const findVariantLabel = (groups: VariantGroup[], variantKey: string) => {
  return groups.flatMap((group) => group.variants).find((variant) => variant.key === variantKey)?.label ?? variantKey;
};
