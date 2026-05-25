export type EncryptionKeyInfo = {
    name: string;
    description: string;
    history: string;
    useCases: string[];
    properties: {
        symmetric: boolean;
        keyLength: number | null;
    }
}

export type HashingAlgorithmInfo = {
    name: string;
    description: string;
    history: string;
    useCases: string[];
    properties: {
        cryptographic: boolean;
        outputLength: number | null;
        collisionResilient: boolean;
        memoryHard: boolean;
        cpuHard: boolean;
    }
}