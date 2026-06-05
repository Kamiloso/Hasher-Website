export type ArgonOperationMode = 'argon2';

export interface ArgonConfig {
    mode: ArgonOperationMode;
    salt: string;
    memoryKb?: number;
    parallelism?: number;
    timeCost?: number;
}

export class HasherArgon {
    async hash(plainText: string, config: ArgonConfig): Promise<string> {
        throw new Error("NotImplemented: Argon2 KDF is pending implementation.");
    }
}

export const argon2Algorithm = new HasherArgon();