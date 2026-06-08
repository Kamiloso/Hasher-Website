import { argon2id, argon2i, argon2d } from 'hash-wasm';

self.onmessage = async (event: MessageEvent) => {
  // Odbieramy dane z głównego wątku (hasło i sól przesyłamy jako Uint8Array, by uniknąć problemów z kodowaniem)
  const { passwordBytes, saltBytes, memoryKb, timeCost, parallelism, hashLength, variant } = event.data;

  try {
    const options = {
        password: passwordBytes,
        salt: saltBytes,
        memorySize: memoryKb,
        iterations: timeCost,
        parallelism: parallelism,
        hashLength: hashLength,
        outputType: 'binary' as const
    };

    let rawResult: Uint8Array;

    switch (variant) {
        case 'argon2i':
            rawResult = await argon2i(options);
            break;
        case 'argon2d':
            rawResult = await argon2d(options);
            break;
        case 'argon2id':
        default:
            rawResult = await argon2id(options);
            break;
    }

    const resultHex = Array.from(rawResult)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

    self.postMessage({ success: true, result: resultHex });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};