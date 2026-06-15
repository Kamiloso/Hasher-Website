import { getBytes, bufferToHex, hexToBuffer } from "../../cryptoUtils";

export type EccVariant = "ecc_p256" | "ecc_p384";
export type EccOperationMode = "encrypt" | "decrypt";

export interface EccConfig {
  variant: EccVariant | string;
  publicKey?: string;
  privateKey?: string;
  mode: EccOperationMode;
}

export class EncryptorECC {
  /**
   * Helper konwertujący tekstowy format PEM na ArrayBuffer.
   */
  private pemToArrayBuffer(pem: string): ArrayBuffer {
    const b64Lines = pem.replace(/(-----(BEGIN|END)(.*)-----|\n|\r)/g, "");
    const byteStr = atob(b64Lines);
    const bytes = new Uint8Array(byteStr.length);
    for (let i = 0; i < byteStr.length; i++) {
      bytes[i] = byteStr.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async process(input: string, config: EccConfig): Promise<string> {
    const { variant, publicKey, privateKey, mode } = config;
    const namedCurve = variant === "ecc_p256" ? "P-256" : "P-384";

    try {
      if (mode === "encrypt") {
        if (!publicKey)
          throw new Error("Public key (PEM) is required for ECC encryption.");

        // 1. Import klucza publicznego Odbiorcy (w formacie SPKI)
        const keyBuffer = this.pemToArrayBuffer(publicKey);
        const recipientPubKey = await window.crypto.subtle.importKey(
          "spki",
          keyBuffer as BufferSource,
          { name: "ECDH", namedCurve },
          false,
          [],
        );

        // 2. Generowanie tymczasowej pary kluczy (Ephemeral KeyPair)
        const ephemeralKeyPair = await window.crypto.subtle.generateKey(
          { name: "ECDH", namedCurve },
          true,
          ["deriveKey"],
        );

        // 3. Zmieszanie kluczy w celu wygenerowania potężnego klucza symetrycznego AES-GCM
        const derivedKey = await window.crypto.subtle.deriveKey(
          { name: "ECDH", public: recipientPubKey },
          ephemeralKeyPair.privateKey,
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt"],
        );

        // 4. Właściwe szyfrowanie wiadomości kluczem AES-GCM
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const dataBytes = getBytes(input);
        const ciphertextBuffer = await window.crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          derivedKey,
          dataBytes as unknown as BufferSource,
        );

        // 5. Budowanie ostatecznej paczki (Tymczasowy klucz publiczny RAW + IV + Szyfrogram)
        const ephemeralPubRawBuffer = await window.crypto.subtle.exportKey(
          "raw",
          ephemeralKeyPair.publicKey,
        );
        const ephemeralPubRaw = new Uint8Array(
          ephemeralPubRawBuffer as ArrayBuffer,
        );
        const ciphertext = new Uint8Array(ciphertextBuffer as ArrayBuffer);

        const finalPayload = new Uint8Array(
          ephemeralPubRaw.length + iv.length + ciphertext.length,
        );
        finalPayload.set(ephemeralPubRaw, 0);
        finalPayload.set(iv, ephemeralPubRaw.length);
        finalPayload.set(ciphertext, ephemeralPubRaw.length + iv.length);

        return bufferToHex(finalPayload.buffer as ArrayBuffer);
      }

      if (mode === "decrypt") {
        if (!privateKey)
          throw new Error("Private key (PEM) is required for ECC decryption.");

        // Obliczenie długości tymczasowego klucza na podstawie wybranej krzywej
        const rawKeyLen = namedCurve === "P-256" ? 65 : 97;
        const inputBytes = new Uint8Array(hexToBuffer(input));

        if (inputBytes.length < rawKeyLen + 12) {
          throw new Error("Invalid ciphertext format or length.");
        }

        // 1. Rozłożenie odebranej paczki na składowe
        const ephemeralPubRaw = inputBytes.slice(0, rawKeyLen);
        const iv = inputBytes.slice(rawKeyLen, rawKeyLen + 12);
        const ciphertext = inputBytes.slice(rawKeyLen + 12);

        // 2. Import klucza prywatnego Odbiorcy
        const privKeyBuffer = this.pemToArrayBuffer(privateKey);
        const recipientPrivKey = await window.crypto.subtle.importKey(
          "pkcs8",
          privKeyBuffer as BufferSource,
          { name: "ECDH", namedCurve },
          false,
          ["deriveKey"],
        );

        // 3. Import tymczasowego klucza z samej wiadomości
        const ephemeralPubKey = await window.crypto.subtle.importKey(
          "raw",
          ephemeralPubRaw as unknown as BufferSource,
          { name: "ECDH", namedCurve },
          false,
          [],
        );

        // 4. Odtworzenie tego samego klucza AES-GCM
        const derivedKey = await window.crypto.subtle.deriveKey(
          { name: "ECDH", public: ephemeralPubKey },
          recipientPrivKey,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"],
        );

        // 5. Właściwe deszyfrowanie wiadomości
        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv },
          derivedKey,
          ciphertext as unknown as BufferSource,
        );

        return new TextDecoder().decode(decryptedBuffer);
      }

      throw new Error(`Unsupported operation mode: ${mode}`);
    } catch (error: any) {
      console.error(
        `[EncryptorECC] Error during ${mode} with ${variant}:`,
        error,
      );
      throw new Error(
        `ECC ${mode} failed: ${error.message || "Check your keys and input format."}`,
      );
    }
  }
}

export const eccAlgorithm = new EncryptorECC();
