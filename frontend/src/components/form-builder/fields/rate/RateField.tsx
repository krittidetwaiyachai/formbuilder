import React from 'react';
import { Field } from '@/types';
import { Star, Heart, Shield, Zap, Flag, ThumbsUp, Smile } from 'lucide-react';

interface RateFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const RateField: React.FC<RateFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  const options = field.options || {};
  const maxRating = options.maxRating || 5;
  const iconType = options.icon || 'star';
  const defaultValue = options.defaultValue || 0;
  
  const getIcon = () => {
       switch(iconType) {
           case 'heart': return Heart;
           case 'shield': return Shield;
           case 'zap': return Zap;
           case 'flag': return Flag;
           case 'thumbsup': return ThumbsUp;
           case 'smile': return Smile;
           case 'star': default: return Star;
       }
  };

  const Icon = getIcon();

  // Color mapping based on icon type (optional)
  const getColorClass = (active: boolean) => {
      if (!active) return 'text-gray-300 fill-gray-100';
      if (iconType === 'heart') return 'text-red-400 fill-red-400';
      if (iconType === 'shield') return 'text-blue-400 fill-blue-400';
      if (iconType === 'zap') return 'text-amber-400 fill-amber-400';
      if (iconType === 'flag') return 'text-green-400 fill-green-400';
      if (iconType === 'thumbsup') return 'text-blue-500 fill-blue-500';
      if (iconType === 'smile') return 'text-yellow-500 fill-yellow-500';
      return 'text-yellow-400 fill-yellow-400'; // Default star
  };

  return (
    <div className={`flex items-center gap-2 py-2 px-4 rounded-xl border ${fieldStyle.inputBorder} bg-white max-w-fit ${disabledClass}`}>
      {Array.from({ length: maxRating }).map((_, index) => {
          const star = index + 1;
          const isActive = star <= defaultValue; // Show default value in builder
          return (
            <div key={star} className="relative group">
            <Icon 
                className={`w-8 h-8 transition-all duration-300 ${getColorClass(isActive)}`} 
            />
            </div>
        );
      })}
    </div>
  );
};
