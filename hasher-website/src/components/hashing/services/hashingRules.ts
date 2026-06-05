export const getAvailableKdfOptions = (
  activeGroupKey: string,
  options: Array<{
    value: 'none' | 'pbkdf2' | 'hmac';
    label: string;
  }>
) => {
  if (activeGroupKey === 'md5') {
    return options.filter(
      option =>
        option.value === 'none' ||
        option.value === 'hmac'
    );
  }

  return options;
};