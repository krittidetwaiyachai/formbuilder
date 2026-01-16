import { useCallback } from 'react';
import { FieldType, Field } from '@/types';
import { UseFormTrigger, UseFormGetValues } from 'react-hook-form';

interface UseFormNavigationProps {
  currentPageIndex: number;
  setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>;
  currentCardIndex: number;
  setCurrentCardIndex: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  currentPageFields: Field[];
  currentField: Field | null;
  isCardLayout: boolean;
  trigger: UseFormTrigger<Record<string, unknown>>;
  getValues: UseFormGetValues<Record<string, unknown>>;
}

const inputFieldTypes = [
  FieldType.TEXT,
  FieldType.TEXTAREA,
  FieldType.NUMBER,
  FieldType.EMAIL,
  FieldType.PHONE,
  FieldType.DROPDOWN,
  FieldType.CHECKBOX,
  FieldType.RADIO,
  FieldType.DATE,
  FieldType.TIME,
  FieldType.RATE,
  FieldType.FULLNAME,
  FieldType.ADDRESS,
  FieldType.MATRIX,
  FieldType.TABLE,
];

export function useFormNavigation({
  currentPageIndex,
  setCurrentPageIndex,
  currentCardIndex,
  setCurrentCardIndex,
  totalPages,
  currentPageFields,
  currentField,
  isCardLayout,
  trigger,
  getValues,
}: UseFormNavigationProps) {

  const validateCurrentField = useCallback(async () => {
    if (isCardLayout && currentField) {
      const fieldName = `field_${currentField.id}`;
      if (currentField.validation?.required) {
        const result = await trigger(fieldName);
        return result;
      }
    }
    return true;
  }, [isCardLayout, currentField, trigger]);

  const validateCurrentPage = useCallback(async () => {
    const fieldsToValidate = currentPageFields
      .filter(f => inputFieldTypes.includes(f.type) || f.required || f.validation?.required)
      .flatMap(f => {
        const fieldName = `field_${f.id}`;
        if (f.type === FieldType.FULLNAME) {
          const parts = [];
          const opts = f.options || {};
          parts.push(`${fieldName}_first`, `${fieldName}_last`);
          if (opts.showPrefix) parts.push(`${fieldName}_prefix`);
          if (opts.showMiddleName) parts.push(`${fieldName}_middle`);
          if (opts.showSuffix) parts.push(`${fieldName}_suffix`);
          return parts;
        }
        if (f.type === FieldType.ADDRESS) {
          const parts = [];
          const opts = f.options || {};
          const showStreet = opts.showStreet !== false;
          const showCity = opts.showCity !== false;
          const showState = opts.showState !== false;
          const showZip = opts.showZip !== false;
          const showCountry = opts.showCountry !== false;
          if (showStreet) parts.push(`${fieldName}_street`);
          if (opts.showStreet2) parts.push(`${fieldName}_street2`);
          if (showCity) parts.push(`${fieldName}_city`);
          if (showState) parts.push(`${fieldName}_state`);
          if (showZip) parts.push(`${fieldName}_zip`);
          if (showCountry) parts.push(`${fieldName}_country`);
          if (Object.keys(opts).length === 0) {
            return [`${fieldName}_street`, `${fieldName}_street2`, `${fieldName}_city`, `${fieldName}_state`, `${fieldName}_zip`, `${fieldName}_country`];
          }
          return parts;
        }
        return [fieldName];
      });

    if (fieldsToValidate.length === 0) return true;

    const rhfValid = await trigger(fieldsToValidate);

    let manualValid = true;
    const requiredFields = currentPageFields.filter(f => f.required || f.validation?.required);

    const isEmpty = (val: unknown) => {
      if (val === undefined || val === null) return true;
      if (typeof val === 'string' && val.trim() === '') return true;
      if (Array.isArray(val) && val.length === 0) return true;
      if (typeof val === 'object' && Object.keys(val as object).length === 0) return true;
      return false;
    };

    for (const f of requiredFields) {
      const fieldName = `field_${f.id}`;
      if (f.type === FieldType.FULLNAME) {
        if (isEmpty(getValues(`${fieldName}_first`))) manualValid = false;
        else if (isEmpty(getValues(`${fieldName}_last`))) manualValid = false;
      } else if (f.type === FieldType.ADDRESS) {
        const opts = f.options || {};
        const vStreet = getValues(`${fieldName}_street`);
        const vCity = getValues(`${fieldName}_city`);
        if (opts.showStreet !== false && isEmpty(vStreet)) manualValid = false;
        else if (opts.showCity !== false && isEmpty(vCity)) manualValid = false;
      } else {
        if (isEmpty(getValues(fieldName))) manualValid = false;
      }
      if (!manualValid) break;
    }

    return rhfValid && manualValid;
  }, [currentPageFields, trigger, getValues]);

  const handleNextPage = useCallback(async () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(prev => prev + 1);
      setCurrentCardIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPageIndex, totalPages, setCurrentPageIndex, setCurrentCardIndex]);

  const handlePreviousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      setCurrentCardIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPageIndex, setCurrentPageIndex, setCurrentCardIndex]);

  const handleNext = useCallback(async () => {
    if (isCardLayout) {
      const isValid = await validateCurrentField();
      if (!isValid) return;
      if (currentCardIndex < currentPageFields.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else if (currentPageIndex < totalPages - 1) {
        handleNextPage();
      }
    } else {
      const isValid = await validateCurrentPage();
      if (!isValid) return;
      handleNextPage();
    }
  }, [isCardLayout, validateCurrentField, validateCurrentPage, currentCardIndex, currentPageFields.length, currentPageIndex, totalPages, setCurrentCardIndex, handleNextPage]);

  const handlePrevious = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    } else if (currentPageIndex > 0) {
      handlePreviousPage();
    }
  }, [currentCardIndex, currentPageIndex, setCurrentCardIndex, handlePreviousPage]);

  return {
    handleNext,
    handlePrevious,
    handleNextPage,
    handlePreviousPage,
    validateCurrentField,
    validateCurrentPage,
  };
}
