export const caesarAlgorithm = {
  encrypt: (input: string, options: { 
    variant: string, 
    shift: number, 
    mode: 'encrypt' | 'decrypt' 
  }) => {
    const text = input.toUpperCase();
    
    const shift = options.mode === 'decrypt' 
      ? (26 - (options.shift % 26)) % 26 
      : options.shift % 26;

    let result = '';

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);

      if (charCode >= 65 && charCode <= 90) {
        result += String.fromCharCode(((charCode - 65 + shift) % 26) + 65);
      } else {
        result += text[i];
      }
    }

    return result;
  }
};