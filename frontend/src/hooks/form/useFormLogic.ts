import { useMemo } from 'react';
import { Field, LogicRule } from '@/types';

interface UseFormLogicProps {
  fields: Field[];
  logicRules: LogicRule[];
  formValues: Record<string, any>;
}

export const useFormLogic = ({ fields, logicRules, formValues }: UseFormLogicProps) => {
  const hiddenFieldIds = useMemo(() => {
    if (!logicRules || logicRules.length === 0) return new Set<string>();

    const showTargets = new Set<string>();      
    const currentlyVisible = new Set<string>(); 
    const currentlyHidden = new Set<string>();  

    logicRules.forEach(rule => {
      rule.actions.forEach(action => {
        if (action.type === 'show' && action.fieldId) {
          showTargets.add(action.fieldId);
        }
      });
    });

    logicRules.forEach(rule => {
      if (!rule.conditions || rule.conditions.length === 0) return;

      const conditionResults = rule.conditions.map(c => {
        const hasContent = (val: any): boolean => {
            if (val === undefined || val === null || val === "") return false;
            if (Array.isArray(val)) return val.length > 0;
            if (typeof val === 'object') return Object.keys(val).length > 0;
            return true;
        };

        const field = fields.find(f => f.id === c.fieldId);
        
        const children = fields.filter(f => f.groupId === c.fieldId);
        const isGroupTarget = children.length > 0 || field?.type === 'GROUP';

        let sourceValue = formValues[c.fieldId];
        if (isGroupTarget) {
             const activeValues: Record<string, any> = {};
             children.forEach(child => {
                const val = formValues[child.id];
                if (hasContent(val)) {
                    activeValues[child.id] = val;
                }
             });
             sourceValue = activeValues;
        }

        const targetValue = c.value;
        const operator = c.operator.toLowerCase();
        const tVal = String(targetValue || '').toLowerCase();

        let sourceValuesList: string[] = [];

        if (sourceValue === undefined || sourceValue === null) {
            sourceValuesList = [];
        } else if (Array.isArray(sourceValue)) {
            sourceValuesList = sourceValue
                .map(v => String(v).toLowerCase())
                .filter(v => v !== ''); 
        } else if (typeof sourceValue === 'object') {
            sourceValuesList = Object.values(sourceValue)
                .map(v => String(v).toLowerCase())
                .filter(v => v !== ''); 
        } else {
            const str = String(sourceValue).toLowerCase();
            sourceValuesList = str !== '' ? [str] : []; 
        }

        switch (operator) {
          case 'equals':
            return sourceValuesList.some(v => v === tVal);

          case 'not_equals':
            if (sourceValuesList.length === 0) return true;
            return !sourceValuesList.some(v => v === tVal);

          case 'contains':
             return sourceValuesList.some(v => v.includes(tVal));

          case 'not_contains':
             if (sourceValuesList.length === 0) return true;
             return !sourceValuesList.some(v => v.includes(tVal));

          case 'starts_with':
             return sourceValuesList.some(v => v.startsWith(tVal));

          case 'ends_with':
             return sourceValuesList.some(v => v.endsWith(tVal));

          case 'is_empty':
            return sourceValuesList.length === 0;

          case 'is_not_empty':
            return sourceValuesList.length > 0;

          case 'greater_than':
             return sourceValuesList.some(v => {
                 const n = Number(v);
                 return !isNaN(n) && n > Number(targetValue);
             });

          case 'less_than':
             return sourceValuesList.some(v => {
                 const n = Number(v);
                 return !isNaN(n) && n < Number(targetValue);
             });

          default:
            return false;
        }
      });

      let isRuleMet = false;
      if (rule.logicType === 'or') {
        isRuleMet = conditionResults.some(r => r);
      } else {
        isRuleMet = conditionResults.every(r => r);
      }

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

    const finalHiddenIds = new Set<string>();
    
    fields.forEach(field => {
        let isVisible = true;

        if (showTargets.has(field.id)) {
            isVisible = false; 
            if (currentlyVisible.has(field.id)) {
                isVisible = true;
            }
        }

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
