import { type TheoryBlock } from '../../../components/TheoryPanel';

export type KdfType = 'none' | 'pbkdf2' | 'hmac';
export type SaltPolicy = 'optional' | 'recommended' | 'none';

export interface Argon2Params {
  defaultMemoryKb: number;
  defaultParallelism: number;
  defaultTimeCost: number;
}

export interface HashAlgorithmVariant {
  id: string;
  label: string;
  saltPolicy: SaltPolicy;
  saltLabel: string;
  defaultSalt: string;
  defaultKdf: KdfType;
  allowKdf: boolean;
  argon2Params?: Argon2Params;
  defaultHmacKey?: string;
}

export interface HashAlgorithmGroup {
  id: string;
  label: string;
  theory: TheoryBlock[];
  variants: HashAlgorithmVariant[];
}

export interface KdfOption {
  value: KdfType;
  label: string;
}

export const KDF_OPTIONS: KdfOption[] = [
  { value: 'none', label: 'No KDF (Classic Digest)' },
  { value: 'hmac', label: 'HMAC' },
  { value: 'pbkdf2', label: 'PBKDF2' }
];

export const HASHING_GROUPS: HashAlgorithmGroup[] = [
  {
    id: 'sha',
    label: 'SHA',
    theory: [
      {
        title: 'Mechanism of Action',
        content: 'SHA-2 is built using the Merkle–Damgård structure, from a one-way compression function itself built using the Davies–Meyer structure from a specialized block cipher. SHA-3 is a subset of the broader cryptographic primitive family Keccak, based on a sponge construction.'
      },
      {
        title: 'History',
        content: 'SHA-1 was developed as part of the U.S. Government\'s Capstone project. SHA-2 was designed by the United States National Security Agency (NSA) and first published in 2001. SHA-3 was released by NIST on August 5, 2015.'
      },
      {
        title: 'Usage',
        content: 'SHA-2 basically consists of two hash algorithms: SHA-256 and SHA-512. The output size in bits is given by the extension to the \'SHA\' name. Configurable output sizes can also be obtained using the SHAKE-128 and SHAKE-256 functions.'
      }
    ],
    variants: [
      {
        id: 'sha256',
        label: 'SHA-256',
        saltPolicy: 'optional',
        saltLabel: 'Salt (optional)',
        defaultSalt: '',
        defaultKdf: 'none',
        allowKdf: true
      },
      {
        id: 'sha512',
        label: 'SHA-512',
        saltPolicy: 'optional',
        saltLabel: 'Salt (optional)',
        defaultSalt: '',
        defaultKdf: 'none',
        allowKdf: true
      },
      {
        id: 'sha3_256',
        label: 'SHA3-256',
        saltPolicy: 'optional',
        saltLabel: 'Salt (optional)',
        defaultSalt: '',
        defaultKdf: 'none',
        allowKdf: true
      },
      {
        id: 'sha1',
        label: 'SHA-1',
        saltPolicy: 'optional',
        saltLabel: 'Salt (optional)',
        defaultSalt: '',
        defaultKdf: 'none',
        allowKdf: true
      }
    ]
  },
  {
    id: 'argon2',
    label: 'Argon2',
    theory: [
      {
        title: 'Mechanism of Action',
        content: 'The Argon2 function uses a large, fixed-size memory region to make brute-force attacks computationally expensive. All three modes allow specification by three parameters that control: execution time, memory required, and degree of parallelism.'
      },
      {
        title: 'History',
        content: 'Argon2 is a key derivation function that was selected as the winner of the 2015 Password Hashing Competition. It was designed by Alex Biryukov, Daniel Dinu, and Dmitry Khovratovich from the University of Luxembourg.'
      },
      {
        title: 'Usage',
        content: 'RFC 9106 recommends using Argon2id if one does not know the difference between the types or if side-channel attacks are considered to be a viable threat. It serves as a memory-hard function for password hashing and proof-of-work applications.'
      }
    ],
    variants: [
      {
        id: 'argon2',
        label: 'Argon2',
        saltPolicy: 'recommended',
        saltLabel: 'Salt (recommended)',
        defaultSalt: '',
        defaultKdf: 'none',
        allowKdf: false,
        argon2Params: {
          defaultMemoryKb: 65536,
          defaultParallelism: 2,
          defaultTimeCost: 3
        }
      }
    ]
  },
  {
    id: 'blake',
    label: 'BLAKE',
    theory: [
      {
        title: 'Mechanism of Action',
        content: 'BLAKE is a cryptographic hash function based on Daniel J. Bernstein\'s ChaCha stream cipher, but a permuted copy of the input block, XORed with round constants, is added before each ChaCha round.'
      },
      {
        title: 'History',
        content: 'BLAKE was a finalist in the NIST hash function competition. BLAKE2 is a cryptographic hash function based on BLAKE, created by Jean-Philippe Aumasson, Samuel Neves, Zooko Wilcox-O\'Hearn, and Christian Winnerlein.'
      },
      {
        title: 'Usage',
        content: 'The design goal was to replace the widely used, but broken, MD5 and SHA-1 algorithms in applications requiring high performance in software. BLAKE2 supports keying, salting, personalization, and hash tree modes.'
      }
    ],
    variants: [
      {
        id: 'blake2b',
        label: 'BLAKE2b',
        saltPolicy: 'optional',
        saltLabel: 'Salt (optional)',
        defaultSalt: '',
        defaultKdf: 'none',
        allowKdf: true
      },
      {
        id: 'blake3',
        label: 'BLAKE3',
        saltPolicy: 'optional',
        saltLabel: 'Salt (optional)',
        defaultSalt: '',
        defaultKdf: 'none',
        allowKdf: true
      }
    ]
  },
  {
    id: 'md5',
    label: 'MD5',
    theory: [
      {
        title: 'Mechanism of Action',
        content: 'The MD5 message-digest algorithm is a widely used hash function producing a 128-bit hash value. MD5 uses the Merkle–Damgård construction.'
      },
      {
        title: 'History',
        content: 'MD5 was designed by Ronald Rivest in 1991 to replace an earlier hash function, MD4, and was specified in 1992 as RFC 1321.'
      },
      {
        title: 'Usage',
        content: 'MD5 can be used as a checksum to verify data integrity against unintentional corruption. Historically it was widely used as a cryptographic hash function; however, it has been found to suffer from extensive vulnerabilities.'
      }
    ],
    variants: [
      {
        id: 'md5',
        label: 'MD5',
        saltPolicy: 'optional',
        saltLabel: 'Salt (optional)',
        defaultSalt: '',
        defaultKdf: 'none',
        allowKdf: true
      }
    ]
  },
  {
    id: 'crc32',
    label: 'CRC32',
    theory: [
      {
        title: 'Mechanism of Action',
        content: 'Blocks of data entering these systems get a short check value attached, based on the remainder of a polynomial division of their contents. A CRC is called an n-bit CRC when its check value is n bits long.'
      },
      {
        title: 'History',
        content: 'The use of systematic cyclic codes, which encode messages by adding a fixed-length check value, for the purpose of error detection in communication networks, was first proposed by W. Wesley Peterson in 1961.'
      },
      {
        title: 'Usage',
        content: 'A cyclic redundancy check (CRC) is an error-detecting code commonly used in digital networks and storage devices to detect accidental changes to digital data. They are not suitable for protecting against intentional alteration of data.'
      }
    ],
    variants: [
      {
        id: 'crc32',
        label: 'CRC32',
        saltPolicy: 'none',
        saltLabel: '',
        defaultSalt: '',
        defaultKdf: 'none',
        allowKdf: false
      }
    ]
  },
];

export const getAlgorithmOptions = () =>
  HASHING_GROUPS.flatMap((group) =>
    group.variants.map((variant) => ({
      value: variant.id,
      label: variant.label
    }))
  );

export const getAlgorithmConfig = (variantId: string): HashAlgorithmVariant | undefined =>
  HASHING_GROUPS.flatMap((group) => group.variants).find((v) => v.id === variantId);

export const findGroupForVariant = (variantId: string): HashAlgorithmGroup =>
  HASHING_GROUPS.find((group) => group.variants.some((variant) => variant.id === variantId)) ?? HASHING_GROUPS[0];

export const ALGORITHM_KEYS = getAlgorithmOptions().map((option) => option.value);