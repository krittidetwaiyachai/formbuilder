export const parseOptions = (text: string) => {
  return text.split('\n').filter(line => line.trim()).map(line => {
      const [label, value] = line.split(':');
      return {
          label: label?.trim() || value?.trim() || '',
          value: value?.trim() || label?.trim() || '',
      };
  });
};

export const formatOptionsToText = (options: any[]) => {
  if (!Array.isArray(options)) return '';
  return options.map((opt: any) => opt.label === opt.value ? opt.label : `${opt.label}:${opt.value}`).join('\n');
};
