import { useMemo } from 'react';
import { FieldType } from '@/types';
import type { Field } from '@/types';

export const useFieldStyle = (field: Field, disableHover: boolean = false) => {
    const getFieldStyle = () => {
        switch (field.type) {
            case FieldType.TEXT:
            case FieldType.TEXTAREA:
                return {
                    cardBorder: 'border-l-4 border-l-blue-500',
                    iconColor: 'text-blue-500',
                    bgGradient: 'bg-gradient-to-r from-blue-50/50 to-transparent',
                    inputBorder: 'border-blue-200',
                    overlayBorder: 'border-blue-500'
                };

            case FieldType.NUMBER:
                return {
                    cardBorder: 'border-l-4 border-l-amber-500',
                    iconColor: 'text-amber-500',
                    bgGradient: 'bg-gradient-to-r from-amber-50/50 to-transparent',
                    inputBorder: 'border-amber-200',
                    overlayBorder: 'border-amber-500'
                };

            case FieldType.EMAIL:
            case FieldType.PHONE:
                return {
                    cardBorder: 'border-l-4 border-l-purple-600',
                    iconColor: 'text-purple-600',
                    bgGradient: 'bg-gradient-to-r from-purple-50/50 to-transparent',
                    inputBorder: 'border-purple-200',
                    overlayBorder: 'border-purple-600'
                };

            case FieldType.DROPDOWN:
            case FieldType.CHECKBOX:
            case FieldType.RADIO:
            case FieldType.MATRIX:
                return {
                    cardBorder: 'border-l-4 border-l-pink-500',
                    iconColor: 'text-pink-500',
                    bgGradient: 'bg-gradient-to-r from-pink-50/50 to-transparent',
                    inputBorder: 'border-pink-200',
                    overlayBorder: 'border-pink-500'
                };

            case FieldType.DATE:
            case FieldType.TIME:
            case FieldType.RATE:
                return {
                    cardBorder: 'border-l-4 border-l-teal-500',
                    iconColor: 'text-teal-500',
                    bgGradient: 'bg-gradient-to-r from-teal-50/50 to-transparent',
                    inputBorder: 'border-teal-200',
                    overlayBorder: 'border-teal-500'
                };

            case FieldType.FULLNAME:
            case FieldType.ADDRESS:
                return {
                    cardBorder: 'border-l-4 border-l-orange-500',
                    iconColor: 'text-orange-500',
                    bgGradient: 'bg-gradient-to-r from-orange-50/50 to-transparent',
                    inputBorder: 'border-orange-200',
                    overlayBorder: 'border-orange-500'
                };

            case FieldType.HEADER:
            case FieldType.PARAGRAPH:
            case FieldType.DIVIDER:
            case FieldType.SECTION_COLLAPSE:
            case FieldType.GROUP:
                return {
                    cardBorder: 'border-l-4 border-l-slate-600',
                    iconColor: 'text-slate-600',
                    bgGradient: 'bg-gradient-to-r from-slate-100 to-transparent',
                    inputBorder: 'border-transparent',
                    overlayBorder: 'border-slate-600'
                };

            case FieldType.PAGE_BREAK:
                return {
                    cardBorder: 'border-l-4 border-l-slate-500 border-y border-r border-gray-200 rounded-lg overflow-hidden shadow-sm',
                    iconColor: 'text-slate-500',
                    bgGradient: 'bg-gradient-to-r from-slate-100 to-transparent',
                    inputBorder: 'border-transparent',
                    overlayBorder: 'border-slate-500'
                };

            case FieldType.SUBMIT:
                return {
                    cardBorder: 'border-l-4 border-l-emerald-500',
                    iconColor: 'text-emerald-500',
                    bgGradient: 'bg-gradient-to-r from-emerald-50/50 to-transparent',
                    inputBorder: 'border-emerald-200',
                    overlayBorder: 'border-emerald-500'
                };

            default:
                return {
                    cardBorder: 'border-l-4 border-l-gray-400',
                    iconColor: 'text-gray-400',
                    bgGradient: 'bg-white',
                    inputBorder: 'border-gray-200',
                    overlayBorder: 'border-gray-400'
                };
        }
    };

    return useMemo(() => getFieldStyle(), [field.type, disableHover]);
};
