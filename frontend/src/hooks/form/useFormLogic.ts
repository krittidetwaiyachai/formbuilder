import { useMemo } from 'react';
import { Field, LogicRule } from '@/types';

interface UseFormLogicProps {
  fields: Field[];
  logicRules: LogicRule[];
  formValues: Record<string, any>;
}

export const useFormLogic = ({ fields, logicRules, formValues }: UseFormLogicProps) => {
  const hiddenFieldIds = useMemo(() => {
    // If no rules, nothing is hidden by logic (unless manually hidden, which is handled outside)
    if (!logicRules || logicRules.length === 0) return new Set<string>();

    const showTargets = new Set<string>();      // Fields that are targets of a SHOW action
    const currentlyVisible = new Set<string>(); // Fields explicitly SHOWN by a passing rule
    const currentlyHidden = new Set<string>();  // Fields explicitly HIDDEN by a passing rule

    // 1. Identify all targets of "SHOW" actions.
    // These fields become "Hidden by Default" unless a rule explicitly shows them.
    logicRules.forEach(rule => {
      rule.actions.forEach(action => {
        if (action.type === 'show' && action.fieldId) {
          showTargets.add(action.fieldId);
        }
      });
    });

    // 2. Evaluate each rule
    logicRules.forEach(rule => {
      if (!rule.conditions || rule.conditions.length === 0) return;

      // Evaluate all conditions in the rule
      const conditionResults = rule.conditions.map(c => {
        const sourceValue = formValues[c.fieldId]; // logic values are keyed by fieldId from PublicFormRenderer
        const targetValue = c.value;
        const operator = c.operator;

        // Handle string conversion for comparison
        let sVal = '';
        const tVal = String(targetValue || '').toLowerCase();

        // Complex value handling (Matrix, Checkbox array)
        if (typeof sourceValue === 'object' && sourceValue !== null) {
            if (Array.isArray(sourceValue)) {
                // Array (Checkbox): join for string search, or check specific
                sVal = sourceValue.join(',').toLowerCase();
            } else {
                // Object (Matrix): stringify or use values
                // For 'contains', we might want to search in values
                sVal = JSON.stringify(sourceValue).toLowerCase(); 
            }
        } else {
             sVal = String(sourceValue === undefined || sourceValue === null ? '' : sourceValue).toLowerCase();
        }

        switch (operator) {
          case 'equals':
            return sVal === tVal;
          case 'not_equals':
            return sVal !== tVal;
          case 'contains':
             // Enhanced contain for Arrays/Objects: check if ANY value matches
             if (typeof sourceValue === 'object' && sourceValue !== null) {
                 if (Array.isArray(sourceValue)) {
                     // Checkbox: check if array includes the value
                     return sourceValue.some(v => String(v).toLowerCase().includes(tVal));
                 } else {
                     // Matrix: check if any ROW value includes the target
                     return Object.values(sourceValue).some(v => String(v).toLowerCase().includes(tVal));
                 }
             }
            return sVal.includes(tVal);
          case 'not_contains':
             if (typeof sourceValue === 'object' && sourceValue !== null) {
                 if (Array.isArray(sourceValue)) {
                     return !sourceValue.some(v => String(v).toLowerCase().includes(tVal));
                 } else {
                     return !Object.values(sourceValue).some(v => String(v).toLowerCase().includes(tVal));
                 }
             }
            return !sVal.includes(tVal);
          case 'starts_with':
            return sVal.startsWith(tVal);
          case 'ends_with':
            return sVal.endsWith(tVal);
          case 'is_empty':
             if (Array.isArray(sourceValue)) return sourceValue.length === 0;
             if (typeof sourceValue === 'object' && sourceValue !== null) return Object.keys(sourceValue).length === 0;
            return !sourceValue || sourceValue.length === 0;
          case 'is_not_empty':
             if (Array.isArray(sourceValue)) return sourceValue.length > 0;
             if (typeof sourceValue === 'object' && sourceValue !== null) return Object.keys(sourceValue).length > 0;
            return !!sourceValue && sourceValue.length > 0;
          case 'greater_than':
             return Number(sourceValue) > Number(targetValue);
          case 'less_than':
             return Number(sourceValue) < Number(targetValue);
          // Add other operators as needed
          default:
            return false;
        }
      });

      // Combine conditions based on logicType (AND / OR)
      let isRuleMet = false;
      if (rule.logicType === 'or') {
        isRuleMet = conditionResults.some(r => r);
      } else {
        // Default to AND
        isRuleMet = conditionResults.every(r => r);
      }

      // 3. Apply Actions if Rule is Met
      if (isRuleMet) {
        rule.actions.forEach(action => {
            if (action.fieldId) {
                if (action.type === 'show') {
                    currentlyVisible.add(action.fieldId);
                } else if (action.type === 'hide') {
                    currentlyHidden.add(action.fieldId);
                }
            }
        });
      }
    });

    // 4. Calculate Final Visibility
    const finalHiddenIds = new Set<string>();

    fields.forEach(field => {
        let isVisible = true;

        // Rule 1: If it's a target of a SHOW action, it is HIDDEN by default...
        if (showTargets.has(field.id)) {
            isVisible = false; 
            // ...UNLESS it is strictly SHOWN by a passing rule
            if (currentlyVisible.has(field.id)) {
                isVisible = true;
            }
        }

        // Rule 2: If it is explicitly HIDDEN by a passing rule, it is hidden relative to Rule 1 result
        if (currentlyHidden.has(field.id)) {
            isVisible = false;
        }

        if (!isVisible) {
            finalHiddenIds.add(field.id);
        }
    });

    return finalHiddenIds;
  }, [logicRules, formValues, fields]);

  return { hiddenFieldIds };
};
