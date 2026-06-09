import { getBytes } from '../../../scripts/cryptoUtils';

export type CrcOperationMode = 'digest';

export interface CrcConfig {
  mode: CrcOperationMode;
}

export class HasherCRC {
  private static crcTable: Int32Array = HasherCRC.makeTable();

  private static makeTable(): Int32Array {
    const table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    return table;
  }

  async hash(plainText: string, config: CrcConfig): Promise<string> {
    const { mode } = config;

    if (mode !== 'digest') {
      throw new Error(`Unsupported operation mode: ${mode}`);
    }

    try {
      const bytes = getBytes(plainText);
      
      let crc = 0 ^ (-1);

      for (let i = 0; i < bytes.length; i++) {
        crc = (crc >>> 8) ^ HasherCRC.crcTable[(crc ^ bytes[i]) & 0xFF];
      }

      const finalCrc = (crc ^ (-1)) >>> 0;

      return finalCrc.toString(16).padStart(8, '0');

    } catch (error) {
      console.error(`[HasherCRC] Error in mode ${mode}:`, error);
      throw error;
    }
  }
}

export const crcAlgorithm = new HasherCRC();