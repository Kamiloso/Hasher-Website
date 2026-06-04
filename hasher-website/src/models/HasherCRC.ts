export type CrcOperationMode = 'digest';

export interface CrcConfig {
    mode: CrcOperationMode;
}

export class HasherCRC {
    async hash(plainText: string, config: CrcConfig): Promise<string> {
        throw new Error("NotImplemented: CRC32 algorithm is pending implementation.");
    }
}

export const crcAlgorithm = new HasherCRC();