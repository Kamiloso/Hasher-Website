import type { ShaVariant } from '../models/HasherSHA';

export const getStrictShaVariant = (key: string): ShaVariant => {
  const normalized = key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  let map: Record<string, ShaVariant> = {
    'sha1': 'SHA-1',
    'sha256': 'SHA-256',
    'sha384': 'SHA-384',
    'sha512': 'SHA-512',
    'sha3256': 'SHA3-256'
  }

  return map[normalized] || 'SHA-256';
};