import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { webcrypto } from 'node:crypto';

// ---------------------------------------------------------
// NODE ENVIRONMENT POLYFILL
// ---------------------------------------------------------
if (typeof globalThis.window === 'undefined') {
    (globalThis as any).window = {
        crypto: { subtle: webcrypto.subtle },
        btoa: (str: string) => Buffer.from(str, 'binary').toString('base64'),
        atob: (b64: string) => Buffer.from(b64, 'base64').toString('binary')
    };
}

// ---------------------------------------------------------
// IMPORTS 
// ---------------------------------------------------------
import { shaAlgorithm, type ShaVariant } from '../src/models/HasherSHA.ts';
import { md5Algorithm } from '../src/models/HasherMD5.ts';
import { blakeAlgorithm } from '../src/models/HasherBLAKE.ts';
import { crcAlgorithm } from '../src/models/HasherCRC.ts';
import { argon2Algorithm } from '../src/models/HasherArgon.ts';

// ---------------------------------------------------------
// TEST VECTORS
// ---------------------------------------------------------
const VERIFIED_VECTORS = {
    "MD5": [
        { input: "", expected: "d41d8cd98f00b204e9800998ecf8427e", desc: "Empty string" },
        { input: "a", expected: "0cc175b9c0f1b6a831c399e269772661", desc: "Single character" },
        { input: "abc", expected: "900150983cd24fb0d6963f7d28e17f72", desc: "Standard short string" },
        { input: "message digest", expected: "f96b697d7cb7938d525a2f31aaf161d0", desc: "Two words with space" }
    ],
    "SHA-1": [
        { input: "", expected: "da39a3ee5e6b4b0d3255bfef95601890afd80709", desc: "Empty string" },
        { input: "abc", expected: "a9993e364706816aba3e25717850c26c9cd0d89d", desc: "Standard short string" },
        { input: "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq", expected: "84983e441c3bd26ebaae4aa1f95129e5e54670f1", desc: "Block boundary crossing string" }
    ],
    "SHA-256": [
        { input: "", expected: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", desc: "Empty string" },
        { input: "abc", expected: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", desc: "Standard short string" },
        { input: "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq", expected: "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1", desc: "Block boundary crossing string" }
    ],
    "SHA-384": [
        { input: "", expected: "38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b", desc: "Empty string" },
        { input: "abc", expected: "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7", desc: "Standard short string" }
    ],
    "SHA-512": [
        { input: "", expected: "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e", desc: "Empty string" },
        { input: "abc", expected: "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f", desc: "Standard short string" }
    ],
    "SHA3-256": [
        { input: "", expected: "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a", desc: "Empty string" },
        { input: "abc", expected: "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532", desc: "Standard short string" }
    ],
    "BLAKE2b": [
        { input: "", expected: "786a02f742015903c6c6fd852552d272912f4740e15847618a86e217f71f5419d25e1031afee585313896444934eb04b903a685b1448b755d56f701afe9be2ce", desc: "Empty string (512-bit)" },
        { input: "abc", expected: "bddd813c634239723171ef3fee98579b94964e3bb1cb3e427262c8c068d52319da459e774bfde5d4e3661c6bfa6f1bc88f00b46eb05ce2399201a18c645b23d9", desc: "Standard short string (512-bit)"}
    ],
    "BLAKE3": [
        { input: "", expected: "af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262", desc: "Empty string" }
    ],
    "CRC32": [
        { input: "", expected: "00000000", desc: "Empty string" },
        { input: "123456789", expected: "cbf43926", desc: "Standard numeric validation string" }
    ]
};

describe('Active Hashing Algorithms (Digest Mode)', () => {

    describe('MD5 Validation', () => {
        for (const test of VERIFIED_VECTORS["MD5"]) {
            it(`should correctly hash: ${test.desc}`, async () => {
                const result = await md5Algorithm.hash(test.input, { mode: 'digest' });
                assert.equal(result, test.expected);
            });
        }
    });

    const shaVariants: ShaVariant[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512', 'SHA3-256'];

    for (const variant of shaVariants) {
        describe(`${variant} Validation`, () => {
            const vectors = VERIFIED_VECTORS[variant as keyof typeof VERIFIED_VECTORS];
            for (const test of vectors) {
                it(`should correctly hash: ${test.desc}`, async () => {
                    const result = await shaAlgorithm.hash(test.input, { variant: variant, mode: 'digest' });
                    assert.equal(result, test.expected);
                });
            }
        });
    }

    describe('BLAKE2b Validation', () => {
        for (const test of VERIFIED_VECTORS["BLAKE2b"]) {
            it.skip(`should correctly hash: ${test.desc}`, async () => {
                const result = await blakeAlgorithm.hash(test.input, { variant: 'BLAKE2b', mode: 'digest' });
                assert.equal(result, test.expected);
            });
        }
    });

    describe('BLAKE3 Validation', () => {
        for (const test of VERIFIED_VECTORS["BLAKE3"]) {
            it.skip(`should correctly hash: ${test.desc}`, async () => {
                const result = await blakeAlgorithm.hash(test.input, { variant: 'BLAKE3', mode: 'digest' });
                assert.equal(result, test.expected);
            });
        }
    });

    describe('CRC32 Validation', () => {
        for (const test of VERIFIED_VECTORS["CRC32"]) {
            it.skip(`should correctly hash: ${test.desc}`, async () => {
                const result = await crcAlgorithm.hash(test.input, { mode: 'digest' });
                assert.equal(result, test.expected);
            });
        }
    });
});

// ---------------------------------------------------------
// TEST SUITE: KEY DERIVATION FUNCTIONS
// ---------------------------------------------------------
describe('Key Derivation Functions (KDFs)', () => {

    it.skip('PBKDF2 should successfully generate a derived key', async () => {
        const result = await shaAlgorithm.hash("password", {
            variant: 'SHA-256',
            mode: 'pbkdf2',
            salt: 'random_salt',
            iterations: 600000
        });

        assert.ok(result.length > 0, "PBKDF2 failed to output a string");
        assert.match(result, /^[a-f0-9]+$/i, "PBKDF2 output is not valid hex");
    });

    it.skip('Argon2 should successfully generate a hash', async () => {
        const result = await argon2Algorithm.hash("password", {
            mode: 'argon2',
            salt: "random_salt",
            memoryKb: 65536,
            parallelism: 2,
            timeCost: 3
        });

        assert.ok(result.length > 0, "Argon2 failed to output a string");
        // Argon2 output depends heavily on specific implementation returns (raw hex vs encoded string).
        // This ensures the promise resolves successfully and returns data.
    });
});