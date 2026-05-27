export const generateByteSequence = (byteLength: number) => {
  return Array.from({ length: byteLength }, () => {
    const randomByte = Math.floor(Math.random() * 256);
    return randomByte.toString(16).toUpperCase().padStart(2, '0');
  });
};

export const generateTextSequence = (label: string) => {
  const suffix = Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 8).toUpperCase()).join('-');
  return `${label}\n${suffix}`;
};