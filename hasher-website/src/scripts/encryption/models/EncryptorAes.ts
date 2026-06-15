import { getBytes, bufferToHex, hexToBuffer } from "../../cryptoUtils";

export type AesVariant = "aes_gcm" | "aes_cbc" | "aes_ctr";
export type AesOperationMode = "encrypt" | "decrypt";

export interface AesConfig {
  variant: AesVariant | string;
  key: Uint8Array;
  iv?: Uint8Array;
  nonce?: Uint8Array;
  mode: AesOperationMode;
}

export class EncryptorAES {
  async process(input: string, config: AesConfig): Promise<string> {
    const { variant, key, iv, nonce, mode } = config;

    // 1. Walidacja klucza głównego
    if (!key || key.length === 0) {
      throw new Error("Symmetric key is required for AES.");
    }

    // 2. Mapowanie wariantów AES na specyfikację Web Crypto API
    let algoName = "";
    let algoParams: any = {};

    if (variant === "aes_gcm") {
      algoName = "AES-GCM";
      if (!nonce || nonce.length === 0) {
        throw new Error("Nonce is required for AES-GCM.");
      }
      algoParams = { name: "AES-GCM", iv: nonce as unknown as BufferSource };
    } else if (variant === "aes_cbc") {
      algoName = "AES-CBC";
      if (!iv || iv.length !== 16) {
        throw new Error(
          `AES-CBC requires exactly 16 bytes for IV. Got ${iv?.length || 0} bytes.`,
        );
      }
      algoParams = { name: "AES-CBC", iv: iv as unknown as BufferSource };
    } else if (variant === "aes_ctr") {
      algoName = "AES-CTR";
      if (!iv || iv.length !== 16) {
        throw new Error(
          `AES-CTR requires exactly 16 bytes for the Initial Counter Block (IV). Got ${iv?.length || 0} bytes.`,
        );
      }
      // Domyślna długość licznika dla AES-CTR to 64 bity
      algoParams = {
        name: "AES-CTR",
        counter: iv as unknown as BufferSource,
        length: 64,
      };
    } else {
      throw new Error(`Unsupported AES variant: ${variant}`);
    }

    try {
      // 3. Import klucza do formatu wewnętrznego przeglądarki
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        key as unknown as BufferSource,
        { name: algoName },
        false,
        ["encrypt", "decrypt"],
      );

      // 4. Operacja Szyfrowania / Deszyfrowania
      if (mode === "encrypt") {
        const dataBytes = getBytes(input);
        const encryptedBuffer = await window.crypto.subtle.encrypt(
          algoParams,
          cryptoKey,
          dataBytes as unknown as BufferSource,
        );
        return bufferToHex(encryptedBuffer as ArrayBuffer);
      } else if (mode === "decrypt") {
        const encryptedBytes = hexToBuffer(input);
        const decryptedBuffer = await window.crypto.subtle.decrypt(
          algoParams,
          cryptoKey,
          encryptedBytes as unknown as BufferSource,
        );
        return new TextDecoder().decode(decryptedBuffer);
      } else {
        throw new Error(`Unsupported operation mode: ${mode}`);
      }
    } catch (error: any) {
      console.error(
        `[EncryptorAES] Error during ${mode} with ${variant}:`,
        error,
      );
      throw new Error(
        `AES ${mode} failed: ${error.message || error.name || "Unknown Web Crypto Error"}`,
      );
    }
  }
}

export const aesAlgorithm = new EncryptorAES();
