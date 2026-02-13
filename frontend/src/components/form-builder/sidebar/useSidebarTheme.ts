import { FieldType } from '@/types';
import { useTranslation } from 'react-i18next';

export const useFieldLabels = () => {
    const { t } = useTranslation();
    return {
        'Text Fields': t('builder.categories.text'),
        'Choice Fields': t('builder.categories.choice'),
        'Date & Time': t('builder.categories.datetime'),
        'Rating': t('builder.categories.rating'),
        'Layout': t('builder.categories.layout'),
        'Short Text': t('builder.fields.short_text'),
        'Long Text': t('builder.fields.long_text'),
        'Email': t('builder.fields.email'),
        'Phone': t('builder.fields.phone'),
        'Number': t('builder.fields.number'),
        'Full Name': t('builder.fields.full_name'),
        'Address': t('builder.fields.address'),
        'Dropdown Menu': t('builder.fields.dropdown'),
        'Single Choice': t('builder.fields.single_choice'),
        'Multiple Choice': t('builder.fields.multiple_choice'),
        'Matrix Logic': t('builder.fields.matrix'),
        'Input Table': t('builder.fields.table'),
        'Date': t('builder.fields.date'),
        'Time': t('builder.fields.time'),
        'Star Rating': t('builder.fields.rating'),
        'Heading': t('builder.fields.heading'),
        'Text Block': t('builder.fields.text_block'),
        'Separator': t('builder.fields.separator'),
        'Page Break': t('builder.fields.page_break'),
        'Field Group': t('builder.fields.group'),

        'Type here...': t('builder.sidebar.type_here'),
        'Select option': t('builder.sidebar.select_option'),
        'Pick a date': t('builder.sidebar.pick_date'),
        'Pick a time': t('builder.sidebar.pick_time'),
        'Option 1': t('builder.sidebar.option_1'),
        'Submit': t('builder.sidebar.submit'),
        'PAGE BREAK': t('builder.sidebar.page_break'),
        'Column': t('builder.sidebar.column'),
    };
};

export const getFieldColorTheme = (type: FieldType) => {
    switch (type) {
        case FieldType.TEXT:
        case FieldType.TEXTAREA: return { border: 'border-blue-200', text: 'text-blue-600', bg: 'bg-blue-50', hover: 'group-hover:bg-blue-100', iconBg: 'bg-blue-100' };

        case FieldType.NUMBER: return { border: 'border-amber-200', text: 'text-amber-600', bg: 'bg-amber-50', hover: 'group-hover:bg-amber-100', iconBg: 'bg-amber-100' };

        case FieldType.EMAIL:
        case FieldType.PHONE: return { border: 'border-purple-200', text: 'text-purple-600', bg: 'bg-purple-50', hover: 'group-hover:bg-purple-100', iconBg: 'bg-purple-100' };

        case FieldType.DROPDOWN:
        case FieldType.RADIO:
        case FieldType.CHECKBOX:
        case FieldType.MATRIX:
        case FieldType.TABLE: return { border: 'border-pink-200', text: 'text-pink-600', bg: 'bg-pink-50', hover: 'group-hover:bg-pink-100', iconBg: 'bg-pink-100' };

        case FieldType.DATE:
        case FieldType.TIME:
        case FieldType.RATE: return { border: 'border-teal-200', text: 'text-teal-600', bg: 'bg-teal-50', hover: 'group-hover:bg-teal-100', iconBg: 'bg-teal-100' };

        case FieldType.FULLNAME:
        case FieldType.ADDRESS: return { border: 'border-orange-200', text: 'text-orange-600', bg: 'bg-orange-50', hover: 'group-hover:bg-orange-100', iconBg: 'bg-orange-100' };

        case FieldType.HEADER:
        case FieldType.PARAGRAPH:
        case FieldType.DIVIDER:
        case FieldType.PAGE_BREAK:
        case FieldType.GROUP: return { border: 'border-slate-200', text: 'text-slate-600', bg: 'bg-slate-50', hover: 'group-hover:bg-slate-100', iconBg: 'bg-slate-200' };

        case FieldType.SUBMIT: return { border: 'border-emerald-200', text: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'group-hover:bg-emerald-100', iconBg: 'bg-emerald-100' };

        default: return { border: 'border-gray-200', text: 'text-gray-600', bg: 'bg-gray-50', hover: 'group-hover:bg-gray-100', iconBg: 'bg-gray-100' };
    }
};
