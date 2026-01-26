import { StateCreator } from 'zustand';
import { FormBuilderState } from '../formStore';
import { Field } from '@/types';
import { generateUUID } from '@/utils/uuid';

export interface SelectionSlice {
  selectedFieldId: string | null;
  additionalSelectedIds: string[];
  clipboard: Field[] | null;
  
  selectField: (fieldId: string | null, autoFocus?: boolean) => void;
  selectAllFields: () => void;
  toggleFieldSelection: (fieldId: string) => void;
  deselectAll: () => void;
  deleteSelectedFields: () => void;
  copyFields: () => void;
  cutFields: () => void;
  pasteFields: () => void;
}

const getDescendantIds = (parentId: string, allFields: Field[]): string[] => {
    const children = allFields.filter(f => f.groupId === parentId);
    let ids = children.map(c => c.id);
    children.forEach(child => {
        ids = [...ids, ...getDescendantIds(child.id, allFields)];
    });
    return ids;
};

export const createSelectionSlice: StateCreator<FormBuilderState, [], [], SelectionSlice> = (set, get) => ({
  selectedFieldId: null,
  additionalSelectedIds: [],
  clipboard: null,

  selectField: (fieldId, autoFocus = false) => set({ 
    selectedFieldId: fieldId, 
    shouldFocusField: autoFocus,
    additionalSelectedIds: [], 
    activeSidebarTab: 'properties' 
  }),

  selectAllFields: () => {
    const form = get().currentForm;
    if (!form || !form.fields) return;
    
    const allIds = form.fields.map(f => f.id);
    if (allIds.length === 0) return;

    let primaryId = get().selectedFieldId;
    if (!primaryId || !allIds.includes(primaryId)) {
        primaryId = allIds[0];
    }
    
    set({
        selectedFieldId: primaryId,
        additionalSelectedIds: allIds.filter(id => id !== primaryId),
    });
  },

  toggleFieldSelection: (fieldId) => {
    const { selectedFieldId, additionalSelectedIds } = get();
    
    if (selectedFieldId === fieldId) {
        if (additionalSelectedIds.length > 0) {
            const [newPrimary, ...rest] = additionalSelectedIds;
            set({ selectedFieldId: newPrimary, additionalSelectedIds: rest });
        } else {
            set({ selectedFieldId: null });
        }
        return;
    }

    if (additionalSelectedIds.includes(fieldId)) {
        set({ additionalSelectedIds: additionalSelectedIds.filter(id => id !== fieldId) });
        return;
    }

    if (selectedFieldId === null) {
        set({ selectedFieldId: fieldId });
    } else {
        set({ additionalSelectedIds: [...additionalSelectedIds, fieldId] });
    }
  },

  deselectAll: () => set({ selectedFieldId: null, additionalSelectedIds: [] }),

  deleteSelectedFields: () => {
      const { selectedFieldId, additionalSelectedIds } = get();
      const initialIdsToDelete = [selectedFieldId, ...additionalSelectedIds].filter(Boolean) as string[];
      if (initialIdsToDelete.length === 0) return;
      
      const form = get().currentForm;
      if (!form || !form.fields) return;

      let allIdsToDelete = [...initialIdsToDelete];
      initialIdsToDelete.forEach(id => {
          allIdsToDelete = [...allIdsToDelete, ...getDescendantIds(id, form.fields!)];
      });

      allIdsToDelete = [...new Set(allIdsToDelete)];

      const newFields = form.fields.filter(f => !allIdsToDelete.includes(f.id));
      newFields.forEach((f, i) => f.order = i);

      const newForm = {
          ...form,
          fields: newFields,
          conditions: form.conditions?.filter((c) => !allIdsToDelete.includes(c.sourceFieldId) && !allIdsToDelete.includes(c.targetFieldId)),
      };

      set({
        currentForm: newForm,
        selectedFieldId: null,
        additionalSelectedIds: []
      });
      
      get().emitChange(newForm);
      get().saveToHistory();
  },

  copyFields: () => {
    const { currentForm, selectedFieldId, additionalSelectedIds } = get();
    if (!currentForm || !currentForm.fields) return;

    const idsToCopy = [selectedFieldId, ...additionalSelectedIds].filter(Boolean) as string[];
    if (idsToCopy.length === 0) return;

    const fieldsToCopy = currentForm.fields.filter(f => idsToCopy.includes(f.id));
    
    fieldsToCopy.sort((a, b) => a.order - b.order);

    set({ clipboard: fieldsToCopy });
  },

  cutFields: () => {
    get().copyFields();
    get().deleteSelectedFields();
  },

  pasteFields: () => {
    const { clipboard, currentForm, selectedFieldId } = get();
    if (!clipboard || clipboard.length === 0 || !currentForm) return;

    let insertIndex = currentForm.fields?.length || 0;
    if (selectedFieldId) {
        const selectedField = currentForm.fields?.find(f => f.id === selectedFieldId);
        if (selectedField) {
             insertIndex = selectedField.order + 1;
        }
    }

    const newFieldsToInsert = clipboard.map((f, i) => ({
        ...f,
        id: `field-${Date.now()}-${i}-${generateUUID()}`, 
        formId: currentForm.id,
        order: insertIndex + i,
        groupId: undefined 
    }));

    const currentFields = currentForm.fields || [];
    const updatedFields = currentFields.map(f => {
        if (f.order >= insertIndex) {
            return { ...f, order: f.order + newFieldsToInsert.length };
        }
        return f;
    });

    updatedFields.splice(insertIndex, 0, ...newFieldsToInsert);
    updatedFields.forEach((f, i) => f.order = i);

    const newForm = { ...currentForm, fields: updatedFields };
    set({ currentForm: newForm });
    
    if (newFieldsToInsert.length > 0) {
        set({ 
            selectedFieldId: newFieldsToInsert[0].id,
            additionalSelectedIds: newFieldsToInsert.slice(1).map(f => f.id)
        });
    }

    get().emitChange(newForm);
    get().saveToHistory();
  }
});
