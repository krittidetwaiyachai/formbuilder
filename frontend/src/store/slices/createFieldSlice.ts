import { StateCreator } from 'zustand';
import { FormBuilderState } from '../formStore';
import { Field, FieldType, Form } from '@/types';
import { generateUUID } from '@/utils/uuid';
import { generateGroupTemplate } from '@/utils/form-templates';

export interface FieldSlice {
  addField: (field: Omit<Field, 'id' | 'formId'>, id?: string) => Field | undefined;
  addGroupTemplate: (template: string) => void;
  addBundle: (bundle: { title: string, fields: any[] }) => void;
  updateField: (fieldId: string, updates: Partial<Field>) => void;
  deleteField: (fieldId: string) => void;
  duplicateField: (fieldId: string) => void;
  reorderFields: (startIndex: number, endIndex: number, skipHistory?: boolean) => void;
}

const getDescendantIds = (parentId: string, allFields: Field[]): string[] => {
  const children = allFields.filter(f => f.groupId === parentId);
  let ids = children.map(c => c.id);
  children.forEach(child => {
      ids = [...ids, ...getDescendantIds(child.id, allFields)];
  });
  return ids;
};

export const createFieldSlice: StateCreator<FormBuilderState, [], [], FieldSlice> = (set, get) => ({
  addField: (fieldData, id) => {
    const { currentForm, selectedFieldId } = get();
    if (!currentForm) return;

    let insertIndex = currentForm.fields?.length || 0;
    
    if (selectedFieldId) {
        const selectedField = currentForm.fields?.find(f => f.id === selectedFieldId);
        if (selectedField) {
            insertIndex = selectedField.order + 1;
        }
    }

    const newField: Field = {
      ...fieldData,
      id: id || `field-${Date.now()}`,
      formId: currentForm.id,
      order: insertIndex,
      required: fieldData.required ?? false,
      groupId: selectedFieldId ? currentForm.fields?.find(f => f.id === selectedFieldId)?.groupId : undefined
    };

    const currentFields = currentForm.fields || [];
    const updatedFields = currentFields.map(f => {
        if (f.order >= insertIndex) {
            return { ...f, order: f.order + 1 };
        }
        return f;
    });

    updatedFields.splice(insertIndex, 0, newField);
    updatedFields.forEach((f, i) => f.order = i);

    const newForm = { ...currentForm, fields: updatedFields };
    set({ currentForm: newForm });
    
    get().selectField(newField.id, true);

    
    get().emitChange(newForm);
    get().saveToHistory();

    return newField;
  },

  addGroupTemplate: (template) => {
    const { currentForm, selectedFieldId } = get();
    if (!currentForm) return;

    let insertIndex = currentForm.fields?.length || 0;
    if (selectedFieldId) {
        const selectedField = currentForm.fields?.find(f => f.id === selectedFieldId);
        if (selectedField) {
             insertIndex = selectedField.order + 1;
        }
    }

    const templateResult = generateGroupTemplate(template, currentForm.id, insertIndex);
    const newFields = [templateResult.groupField, ...templateResult.childFields];

    const currentAllFields = currentForm.fields || [];
    const updatedFields = currentAllFields.map(f => {
        if (f.order >= insertIndex) {
            return { ...f, order: f.order + newFields.length };
        }
        return f;
    });

    updatedFields.splice(insertIndex, 0, ...newFields);
    updatedFields.forEach((f, i) => f.order = i);

    const newForm = { ...currentForm, fields: updatedFields };
    set({ currentForm: newForm });
    
    get().selectField(templateResult.groupField.id);
    
    get().emitChange(newForm);
    get().saveToHistory();
  },

  addBundle: (bundle) => {
      const { currentForm, selectedFieldId } = get();
      if (!currentForm) return;

      let insertIndex = currentForm.fields?.length || 0;
      if (selectedFieldId) {
          const selectedField = currentForm.fields?.find(f => f.id === selectedFieldId);
          if (selectedField) {
               insertIndex = selectedField.order + 1;
          }
      }
      
      const groupId = `field-${Date.now()}-group`;
      const groupField: Field = {
          id: groupId,
          formId: currentForm.id,
          type: FieldType.GROUP,
          label: bundle.title,
          order: insertIndex,
          required: false,
      };

      const childFields = bundle.fields.map((f, index) => ({
          id: `field-${Date.now()}-${index}`,
          formId: currentForm.id,
          type: f.type,
          label: f.label,
          order: 0,
          groupId: groupId,
          options: f.options,
          validation: f.validation,
          required: f.required ?? false,
          placeholder: f.placeholder,
          isPII: f.isPII ?? false,
          shrink: f.shrink
      }));
      
      const allNewFields = [groupField, ...childFields];
      
      const currentAllFields = currentForm.fields || [];
      const updatedFields = currentAllFields.map(f => {
          if (f.order >= insertIndex) {
              return { ...f, order: f.order + allNewFields.length };
          }
          return f;
      });

      updatedFields.splice(insertIndex, 0, ...allNewFields);
      updatedFields.forEach((f, i) => f.order = i);

      const newForm = { ...currentForm, fields: updatedFields };
      set({ currentForm: newForm });
      
      get().emitChange(newForm);
      get().saveToHistory();
      get().selectField(groupId);
  },

  updateField: (fieldId, updates) => {
    const form = get().currentForm;
    if (!form) return;

    const newForm = {
        ...form,
        fields: form.fields?.map((f) =>
          f.id === fieldId ? { ...f, ...updates } : f
        ),
    };

    set({ currentForm: newForm });
    
    get().emitChange(newForm);
    get().saveToHistory();
  },

  deleteField: (fieldId) => {
    const form = get().currentForm;
    if (!form || !form.fields) return;

    const idsToDelete = [fieldId, ...getDescendantIds(fieldId, form.fields)];

    const remainingFields = form.fields.filter((f) => !idsToDelete.includes(f.id));

    const pageCount = remainingFields.filter(f => f.type === FieldType.PAGE_BREAK).length + 1;
    let newPageSettings = [...(form.pageSettings || [])];

    if (newPageSettings.length > pageCount) {
        newPageSettings = newPageSettings.slice(0, pageCount);
    }
    while (newPageSettings.length < pageCount) {
        newPageSettings.push({ id: generateUUID(), title: `Page ${newPageSettings.length + 1}` });
    }

    const newForm = {
        ...form,
        fields: remainingFields,
        pageSettings: newPageSettings,
        conditions: form.conditions?.filter((c) => !idsToDelete.includes(c.sourceFieldId) && !idsToDelete.includes(c.targetFieldId)),
    };

    set({
      currentForm: newForm,
      selectedFieldId: get().selectedFieldId && idsToDelete.includes(get().selectedFieldId!) ? null : get().selectedFieldId,
    });
    
    
    get().emitChange(newForm);
    get().saveToHistory();
  },

  duplicateField: (fieldId) => {
    const form = get().currentForm;
    if (!form || !form.fields) return;

    const fieldIndex = form.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;

    const fieldToClone = form.fields[fieldIndex];
    const newField: Field = {
        ...fieldToClone,
        id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        label: `${fieldToClone.label}`, 
        order: fieldIndex + 1
    };

    const newFields = [...form.fields];
    newFields.splice(fieldIndex + 1, 0, newField);
    
    newFields.forEach((f, i) => f.order = i);

    const newForm = { ...form, fields: newFields };
    set({ currentForm: newForm });
    
    get().selectField(newField.id, false);
    
    
    get().emitChange(newForm);
    get().saveToHistory();
  },

  reorderFields: (startIndex, endIndex, skipHistory = false) => {
    const form = get().currentForm;
    if (!form || !form.fields) return;

    const newFields = Array.from(form.fields);
    const [removed] = newFields.splice(startIndex, 1);
    newFields.splice(endIndex, 0, removed);

    newFields.forEach((field, index) => {
      field.order = index;
    });

    const newForm = { ...form, fields: newFields };
    set({ currentForm: newForm });
    
    if (!skipHistory) {
      get().saveToHistory();
      
      get().emitChange(newForm); 
    }
  }
});
