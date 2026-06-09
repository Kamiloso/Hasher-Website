export type BlakeVariant = 'BLAKE2b' | 'BLAKE3';
export type BlakeOperationMode = 'digest' | 'hmac';

export interface BlakeConfig {
    variant: BlakeVariant;
    mode: BlakeOperationMode;
    salt?: string;
    hmacKey?: string;
}

export class HasherBLAKE {
    async hash(plainText: string, config: BlakeConfig): Promise<string> {
        throw new Error("NotImplemented: BLAKE family algorithms are pending implementation.");
    }
}

export const blakeAlgorithm = new HasherBLAKE();