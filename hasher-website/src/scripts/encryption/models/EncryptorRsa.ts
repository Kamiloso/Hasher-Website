import { getBytes, bufferToHex, hexToBuffer } from "../../cryptoUtils";
import * as forge from "node-forge";

export type RsaVariant = "rsa_oaep" | "rsa_pkcs1";
export type RsaOperationMode = "encrypt" | "decrypt";

export interface RsaConfig {
  variant: RsaVariant | string;
  publicKey?: string;
  privateKey?: string;
  mode: RsaOperationMode;
}

export class EncryptorRSA {
  /**
   * Web Crypto API (OAEP) rygorystycznie wymaga formatu PKCS#8 (BEGIN PRIVATE KEY).
   * Jeśli dostaniemy klucz w klasycznym PKCS#1 (BEGIN RSA PRIVATE KEY), przepakowujemy go.
   */
  private normalizePrivateKey(pem: string): string {
    if (pem.includes("BEGIN RSA PRIVATE KEY")) {
      const privKey = forge.pki.privateKeyFromPem(pem);
      const asn1 = forge.pki.privateKeyToAsn1(privKey);
      const privateKeyInfo = forge.pki.wrapRsaPrivateKey(asn1);
      return forge.pki.privateKeyInfoToPem(privateKeyInfo);
    }
    return pem;
  }

  /**
   * Web Crypto API (OAEP) rygorystycznie wymaga formatu SPKI (BEGIN PUBLIC KEY).
   * Jeśli dostaniemy stary format (BEGIN RSA PUBLIC KEY), przepakowujemy go.
   */
  private normalizePublicKey(pem: string): string {
    if (pem.includes("BEGIN RSA PUBLIC KEY")) {
      const pubKey = forge.pki.publicKeyFromPem(pem);
      return forge.pki.publicKeyToPem(pubKey);
    }
    return pem;
  }

  /**
   * Helper konwertujący tekstowy format PEM na ArrayBuffer wymagany przez Web Crypto API.
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

  async process(input: string, config: RsaConfig): Promise<string> {
    const { variant, publicKey, privateKey, mode } = config;
    const hashAlgo = "SHA-256";

    try {
      // ====================================================================
      // 1. RSA-OAEP (Natywne Web Crypto API)
      // ====================================================================
      if (variant === "rsa_oaep") {
        if (mode === "encrypt") {
          if (!publicKey)
            throw new Error(
              "Public key (PEM) is required for RSA-OAEP encryption.",
            );

          const normalizedPublic = this.normalizePublicKey(publicKey);
          const keyBuffer = this.pemToArrayBuffer(normalizedPublic);
          const cryptoKey = await window.crypto.subtle.importKey(
            "spki",
            keyBuffer as BufferSource,
            { name: "RSA-OAEP", hash: hashAlgo },
            false,
            ["encrypt"],
          );

          const dataBytes = getBytes(input);
          const encryptedBuffer = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            cryptoKey,
            dataBytes as unknown as BufferSource,
          );

          return bufferToHex(encryptedBuffer as ArrayBuffer);
        }

        if (mode === "decrypt") {
          if (!privateKey)
            throw new Error(
              "Private key (PEM) is required for RSA-OAEP decryption.",
            );

          const normalizedPrivate = this.normalizePrivateKey(privateKey);
          const keyBuffer = this.pemToArrayBuffer(normalizedPrivate);
          const cryptoKey = await window.crypto.subtle.importKey(
            "pkcs8",
            keyBuffer as BufferSource,
            { name: "RSA-OAEP", hash: hashAlgo },
            false,
            ["decrypt"],
          );

          const encryptedBytes = hexToBuffer(input);
          const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            cryptoKey,
            encryptedBytes as unknown as BufferSource,
          );

          return new TextDecoder().decode(decryptedBuffer);
        }
      }

      // ====================================================================
      // 2. RSA-PKCS1-v1_5 (Klasyczny wariant z użyciem node-forge)
      // ====================================================================
      if (variant === "rsa_pkcs1") {
        if (mode === "encrypt") {
          if (!publicKey)
            throw new Error(
              "Public key (PEM) is required for RSA-PKCS1 encryption.",
            );

          const forgePublicKey = forge.pki.publicKeyFromPem(publicKey);
          const utf8Bytes = forge.util.encodeUtf8(input);
          const encrypted = forgePublicKey.encrypt(
            utf8Bytes,
            "RSAES-PKCS1-V1_5",
          );

          return forge.util.bytesToHex(encrypted);
        }

        if (mode === "decrypt") {
          if (!privateKey)
            throw new Error(
              "Private key (PEM) is required for RSA-PKCS1 decryption.",
            );

          const forgePrivateKey = forge.pki.privateKeyFromPem(privateKey);
          const encryptedBytesString = forge.util.hexToBytes(input);
          const decrypted = forgePrivateKey.decrypt(
            encryptedBytesString,
            "RSAES-PKCS1-V1_5",
          );

          return forge.util.decodeUtf8(decrypted);
        }
      }

      throw new Error(`Unsupported RSA variant: ${variant}`);
    } catch (error: any) {
      console.error(
        `[EncryptorRSA] Error during ${mode} with ${variant}:`,
        error,
      );
      throw new Error(
        `RSA ${mode} failed: ${error.message || "Check your keys and input format."}`,
      );
    }
  }
}

export const rsaAlgorithm = new EncryptorRSA();
