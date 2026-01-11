import React from 'react';
import { Field } from '@/types';

interface DividerFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
}

export const DividerField: React.FC<DividerFieldProps> = ({ field }) => {
  return (
    <div className="w-full py-4">
        <hr className="border-t border-gray-300" />
    </div>
  );
};
