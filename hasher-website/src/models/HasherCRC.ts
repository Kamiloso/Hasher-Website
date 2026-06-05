import { getBytes } from '../utils/cryptoUtils';

export type CrcOperationMode = 'digest';

export interface CrcConfig {
  mode: CrcOperationMode;
}

export class HasherCRC {
  // Wstępnie wygenerowana tabela dla wielomianu 0xEDB88320 (IEEE 802.3)
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
      // 1. Konwersja tekstu na bajty przy użyciu Twojej istniejącej funkcji pomocniczej
      const bytes = getBytes(plainText);
      
      // 2. Obliczenie sumy kontrolnej CRC32
      let crc = 0 ^ (-1); // Inicjalizacja wartością 0xFFFFFFFF

      for (let i = 0; i < bytes.length; i++) {
        crc = (crc >>> 8) ^ HasherCRC.crcTable[(crc ^ bytes[i]) & 0xFF];
      }

      // 3. Odwrócenie bitów na koniec (XOR z 0xFFFFFFFF) i konwersja na Unsigned 32-bit
      const finalCrc = (crc ^ (-1)) >>> 0;

      // 4. Zwrócenie wyniku jako ciąg szesnastkowy (Hex) dopasowany do stylistyki MD5
      // padding '0', aby wynik zawsze miał 8 znaków (np. "00fa12bc")
      return finalCrc.toString(16).padStart(8, '0');

    } catch (error) {
      console.error(`[HasherCRC] Error in mode ${mode}:`, error);
      throw error;
    }
  }
}

export const crcAlgorithm = new HasherCRC();