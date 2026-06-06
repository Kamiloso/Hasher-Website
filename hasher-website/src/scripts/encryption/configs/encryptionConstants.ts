import { type TheoryBlock } from '../../../components/TheoryPanel';

// TODO: Remove config, add data to ts file
import encryptionData from './encryption.json';

export const ENCRYPTION_DATA =
  encryptionData as unknown as EncryptionDataset;

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


export type EncryptionDataset = {
  algorithmOptions: Array<{ value: string; label: string }>;
  theory: Record<string, TheoryBlock[]>;
} & Record<string, EncryptionConfigShape>;

export type EncryptionConfigShape = {
  label: string;
  mode: 'symmetric' | 'asymmetric' | 'stream';
  keyInputType: 'byte' | 'text';
  keyLabel: string;
  keyPlaceholder: string;
  keyTextPlaceholder?: string;
  keyByteField: {
    label: string;
    byteLength: number;
    columns: number;
  };
  byteFields: Array<{
    key: string;
    label: string;
    byteLength: number;
    columns?: number;
    placeholder?: string;
  }>;
  generateAction?: {
    label: string;
    fields: string[];
    outputKind: 'bytes' | 'text';
  };
  showSalt: boolean;
  saltLabel: string;
  saltPlaceholder: string;
  showCounter: boolean;
  counterLabel?: string;
  counterPlaceholder?: string;
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

export const findGroupForVariant = (groups: VariantGroup[], variantKey: string) => {
  return groups.find((group) => group.variants.some((variant) => variant.key === variantKey)) ?? groups[0];
};
