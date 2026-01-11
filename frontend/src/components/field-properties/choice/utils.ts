export const parseOptions = (text: string) => {
  return text.split('\n').filter(line => line.trim()).map(line => {
      const [label, value] = line.split(':');
      return {
          label: label?.trim() || value?.trim() || '',
          value: value?.trim() || label?.trim() || '',
      };
  });
};

export const formatOptionsToText = (options: { label: string; value: string }[]) => {
  if (!Array.isArray(options)) return '';
  return options.map((opt) => opt.label === opt.value ? opt.label : `${opt.label}:${opt.value}`).join('\n');
};
