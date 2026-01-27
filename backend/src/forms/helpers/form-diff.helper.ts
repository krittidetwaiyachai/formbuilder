export class FormDiffHelper {
  static calculateDiff(originalForm: any, newFormData: any) {
    const activityDetails: any = { 
      changes: [], 
      addedFields: [], 
      deletedFields: [], 
      updatedFields: [] 
    };

    
    const settingsChanges = this.getSettingsChanges(originalForm, newFormData);
    if (settingsChanges.length > 0) {
      activityDetails.settingsChanges = settingsChanges;
      activityDetails.changes = [...activityDetails.changes, ...settingsChanges.map(c => c.property)];
    }

    
    if (newFormData.fields) {
      this.calculateFieldChanges(originalForm.fields || [], newFormData.fields, activityDetails);
    }

    
    if (newFormData.logicRules) {
      this.calculateLogicChanges(originalForm.logicRules || [], newFormData.logicRules, activityDetails);
    }

    return activityDetails;
  }

  private static getSettingsChanges(originalForm: any, formData: any) {
    const settingsChanges: any[] = [];
    const ignoreKeys = ['fields', 'conditions', 'logicRules'];
    
    Object.keys(formData).forEach(key => {
      if (ignoreKeys.includes(key)) return;

      const oldValue = originalForm[key];
      const newValue = formData[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        settingsChanges.push({ property: key, before: oldValue, after: newValue });
      }
    });

    return settingsChanges;
  }

  private static calculateFieldChanges(originalFields: any[], newFields: any[], activityDetails: any) {
    const originalFieldIds = new Set(originalFields.map(f => f.id));
    const newFieldIds = new Set(newFields.map(f => f.id));

    
    newFields.forEach((f: any) => {
      if (!originalFieldIds.has(f.id)) {
        activityDetails.addedFields.push({ id: f.id, type: f.type, label: f.label, groupId: f.groupId });
      }
    });

    
    originalFields.forEach((f: any) => {
      if (!newFieldIds.has(f.id)) {
        activityDetails.deletedFields.push({ id: f.id, type: f.type, label: f.label, groupId: f.groupId });
      }
    });

    
    newFields.forEach((newField: any) => {
      if (originalFieldIds.has(newField.id)) {
        const oldField = originalFields.find(f => f.id === newField.id);
        const fieldChanges = this.getFieldPropertyChanges(oldField, newField);

        if (fieldChanges.length > 0) {
          activityDetails.updatedFields.push({ 
            id: newField.id, 
            label: newField.label, 
            type: newField.type,
            groupId: newField.groupId,
            changes: fieldChanges 
          });
        }
      }
    });

    if (activityDetails.addedFields.length > 0 || 
        activityDetails.deletedFields.length > 0 || 
        activityDetails.updatedFields.length > 0) {
       activityDetails.changes.push('fields');
    }
  }

  private static getFieldPropertyChanges(oldField: any, newField: any) {
    const fieldChanges: any[] = [];
    
    const normalize = (val: any) => {
       if (val === 0 || val === false) return val;
       if (val === null || val === undefined || val === '') return null;
       if (Array.isArray(val) && val.length === 0) return null;
       return val;
    };

    
    ['label', 'placeholder', 'required', 'shrink', 'groupId', 'score', 'correctAnswer', 'isPII'].forEach(prop => {
        const oldVal = normalize(oldField[prop]);
        const newVal = normalize(newField[prop]);
        
        const isBooleanProp = ['required', 'shrink', 'isPII'].includes(prop);
        const normalizedOld = isBooleanProp && oldVal === false ? null : oldVal;
        const normalizedNew = isBooleanProp && newVal === false ? null : newVal;
        
        if (JSON.stringify(normalizedOld) !== JSON.stringify(normalizedNew)) {
            fieldChanges.push({ property: prop, before: oldVal, after: newVal });
        }
    });

    
    this.compareNestedObject(oldField.validation, newField.validation, 'validation', fieldChanges, normalize);
    this.compareNestedObject(oldField.options, newField.options, '', fieldChanges, normalize); 

    return fieldChanges;
  }

  private static compareNestedObject(oldObj: any, newObj: any, prefix: string, changes: any[], normalize: (v: any) => any) {
      const oldData = oldObj || {};
      const newData = newObj || {};
      const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

      keys.forEach(key => {
          if (!isNaN(Number(key))) return; 
          
          let oldVal = oldData[key];
          let newVal = newData[key];

          
          if (key === 'items') {
             
             const oldItems = Array.isArray(oldVal) ? oldVal : [];
             const newItems = Array.isArray(newVal) ? newVal : [];
             
             const sortedOld = [...oldItems].sort((a: any, b: any) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
             const sortedNew = [...newItems].sort((a: any, b: any) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
             
             if (JSON.stringify(sortedOld) === JSON.stringify(sortedNew)) return;
          }

          if (typeof oldVal === 'object' && oldVal !== null && !Array.isArray(oldVal)) {
             
             const nestedKeys = new Set([...Object.keys(oldVal || {}), ...Object.keys(newVal || {})]);
             nestedKeys.forEach(nKey => {
                 let oVal = normalize(oldVal[nKey]);
                 let nVal = normalize(newVal?.[nKey]);
                 
                 
                 if (typeof nVal === 'boolean' || typeof oVal === 'boolean') {
                    oVal = oVal === null ? false : oVal;
                    nVal = nVal === null ? false : nVal;
                 }

                 if (JSON.stringify(oVal) !== JSON.stringify(nVal)) {
                     changes.push({ 
                        property: prefix ? `${prefix}.${key}.${nKey}` : `${key}.${nKey}`, 
                        before: oVal, 
                        after: nVal 
                     });
                 }
             });
          } else {
             oldVal = normalize(oldVal);
             newVal = normalize(newVal);
             
             if (typeof newVal === 'boolean' || typeof oldVal === 'boolean') {
                 oldVal = oldVal === null ? false : oldVal;
                 newVal = newVal === null ? false : newVal;
             }
             
             if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                 changes.push({ 
                    property: prefix ? `${prefix}.${key}` : key, 
                    before: oldVal, 
                    after: newVal 
                 });
             }
          }
      });
  }

  private static calculateLogicChanges(originalLogicRules: any[], newLogicRules: any[], activityDetails: any) {
      const logicChanges: any = { added: [], deleted: [], updated: [] };
      const originalRuleIds = new Set(originalLogicRules.map(r => r.id));
      const newRuleIds = new Set(newLogicRules.map(r => r.id));

      newLogicRules.forEach((r: any) => {
        if (!originalRuleIds.has(r.id)) {
          logicChanges.added.push({ id: r.id, name: r.name, type: r.logicType });
        }
      });

      originalLogicRules.forEach((r: any) => {
        if (!newRuleIds.has(r.id)) {
          logicChanges.deleted.push({ id: r.id, name: r.name, type: r.logicType });
        }
      });

      newLogicRules.forEach((newRule: any) => {
        if (originalRuleIds.has(newRule.id)) {
          const oldRule = originalLogicRules.find(r => r.id === newRule.id);
          const ruleChanges = [];

          if (oldRule.name !== newRule.name) {
            ruleChanges.push({ property: 'name', before: oldRule.name, after: newRule.name });
          }
          if (oldRule.logicType !== newRule.logicType) {
            ruleChanges.push({ property: 'logicType', before: oldRule.logicType, after: newRule.logicType });
          }

          const simplify = (items: any[]) => items.map((item: any) => {
            const clean: any = { fieldId: item.fieldId || null };
            if (item.operator !== undefined) clean.operator = item.operator;
            if (item.value !== undefined) clean.value = item.value || null;
            if (item.type !== undefined) clean.type = item.type;
            return clean;
          });

          const oldConditions = simplify(oldRule.conditions || []);
          const newConditions = simplify(newRule.conditions || []);
          if (JSON.stringify(oldConditions) !== JSON.stringify(newConditions)) {
            ruleChanges.push({ property: 'conditions', before: oldRule.conditions, after: newRule.conditions });
          }

          const oldActions = simplify(oldRule.actions || []);
          const newActions = simplify(newRule.actions || []);
          if (JSON.stringify(oldActions) !== JSON.stringify(newActions)) {
            ruleChanges.push({ property: 'actions', before: oldRule.actions, after: newRule.actions });
          }

          if (ruleChanges.length > 0) {
            logicChanges.updated.push({
              id: newRule.id,
              name: newRule.name,
              changes: ruleChanges,
            });
          }
        }
      });

      if (logicChanges.added.length > 0 || logicChanges.deleted.length > 0 || logicChanges.updated.length > 0) {
        activityDetails.logicChanges = logicChanges;
        activityDetails.changes.push('logic');
      }
  }
}
