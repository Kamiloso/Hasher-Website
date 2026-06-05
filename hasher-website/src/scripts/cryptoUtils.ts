// Converts a string to bytes (Uint8Array) using UTF-8 encoding
export function getBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

// Converts bytes (BufferSource) back to a string using UTF-8 decoding
export function getString(buffer: BufferSource): string {
  return new TextDecoder().decode(buffer);
}

// Converts bytes to a Base64 string
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Converts a Base64 string back to bytes (ArrayBuffer)
export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Converts bytes to a hexadecimal string
export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const hashArray = Array.from(bytes);
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Concatenates multiple byte arrays into one
export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, val) => acc + val.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}