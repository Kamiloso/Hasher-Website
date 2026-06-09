import { getBytes } from '../../../scripts/cryptoUtils';

export type ArgonVariant = 'argon2i' | 'argon2d' | 'argon2id';
export type ArgonOperationMode = 'kdf'; // Argon2 to algorytm KDF (Key Derivation Function), nie klasyczny digest

export interface ArgonConfig {
    mode: ArgonOperationMode;
    variant?: ArgonVariant; // Domyślnie 'argon2id'
    salt: string;
    
    memoryKb?: number;    // Domyślnie: 65536 (64 MB)
    timeCost?: number;    // Liczba iteracji, Domyślnie: 3
    parallelism?: number; // Liczba wątków, Domyślnie: 1 
    hashLength?: number;  // Długość zwracanego klucza w bajtach, Domyślnie: 32
}

export interface ArgonProvider {
    hash(plainText: string, config: ArgonConfig): Promise<string>;
}

export class HasherArgon implements ArgonProvider {
    async hash(plainText: string, config: ArgonConfig): Promise<string> {
        const { mode } = config;

        if (mode !== 'kdf') {
             throw new Error(`Unsupported operation mode for Argon2: ${mode}`);
        }

        if (!config.salt) {
            throw new Error("Argon2 requires a salt.");
        }

        const passwordBytes = getBytes(plainText);
        const saltBytes = getBytes(config.salt);
        
        // Zabezpieczenie minimalnych wymagań Argon2
        if (saltBytes.length < 8) {
            throw new Error("Argon2 salt must be at least 8 bytes long.");
        }

        // Wartości domyślne na bazie wytycznych OWASP dla Argon2id
        const variant = config.variant || 'argon2id';
        const memoryKb = config.memoryKb || 65536; 
        const timeCost = config.timeCost || 3;
        const parallelism = config.parallelism || 1;
        const hashLength = config.hashLength || 32;

        return new Promise((resolve, reject) => {
            const worker = new Worker(new URL('./argon.worker.ts', import.meta.url), { type: 'module' });

            worker.onmessage = (event) => {
                const { success, result, error } = event.data;
                worker.terminate(); 

                if (success) {
                    resolve(result);
                } else {
                    reject(new Error(`Argon2 Worker Error: ${error}`));
                }
            };

            worker.onerror = (err) => {
                worker.terminate();
                reject(err);
            };

            worker.postMessage({
                variant,
                passwordBytes,
                saltBytes,
                memoryKb,
                timeCost,
                parallelism,
                hashLength
            });
        });
    }
}

export const argonAlgorithm = new HasherArgon();