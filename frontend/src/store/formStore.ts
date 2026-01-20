import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';
import { Form, Field, FieldType, FieldCondition, LogicRule, LogicCondition, LogicAction } from '@/types';
import api from '@/lib/api';
import { generateGroupTemplate } from '@/utils/form-templates';
import { generateUUID } from '@/utils/uuid';

interface HistoryState {
  form: Form;
  timestamp: number;
}

interface FormBuilderState {
  currentForm: Form | null;
  socket: Socket | null;
  selectedFieldId: string | null;
  additionalSelectedIds: string[];
  shouldFocusField: boolean;
  history: HistoryState[];
  historyIndex: number;
  setCurrentForm: (form: Form | null) => void;
  updateForm: (updates: Partial<Form>, emit?: boolean) => void;
  addField: (field: Omit<Field, 'id' | 'formId'>, id?: string) => Field | undefined;
  addGroupTemplate: (template: string) => void;
  addBundle: (bundle: { title: string, fields: any[] }) => void;
  updateField: (fieldId: string, updates: Partial<Field>) => void;
  deleteField: (fieldId: string) => void;
  duplicateField: (fieldId: string) => void;
  reorderFields: (startIndex: number, endIndex: number, skipHistory?: boolean) => void;
  selectField: (fieldId: string | null, autoFocus?: boolean) => void;
  selectAllFields: () => void;
  toggleFieldSelection: (fieldId: string) => void;
  deselectAll: () => void;
  deleteSelectedFields: () => void;
  copyFields: () => void;
  cutFields: () => void;
  pasteFields: () => void;
  setShouldFocusField: (shouldFocus: boolean) => void;
  loadForm: (formId: string) => Promise<void>;
  saveForm: () => Promise<any>;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  clipboard: Field[] | null;
  addCondition: (condition: Omit<FieldCondition, 'id' | 'formId'>) => void;
  updateCondition: (conditionId: string, updates: Partial<FieldCondition>) => void;
  deleteCondition: (conditionId: string) => void;
  addLogicRule: (name?: string) => void;
  updateLogicRule: (ruleId: string, updates: Partial<LogicRule>) => void;
  deleteLogicRule: (ruleId: string) => void;
  addConditionToRule: (ruleId: string) => void;
  removeConditionFromRule: (ruleId: string, conditionId: string) => void;
  addActionToRule: (ruleId: string) => void;
  removeActionFromRule: (ruleId: string, actionId: string) => void;
  updateRuleCondition: (ruleId: string, conditionId: string, updates: Partial<LogicCondition>) => void;
  updateRuleAction: (ruleId: string, actionId: string, updates: Partial<LogicAction>) => void;
  activeSidebarTab: 'properties' | 'theme' | 'settings' | 'logic' | 'builder';
  setActiveSidebarTab: (tab: 'properties' | 'theme' | 'settings' | 'logic' | 'builder') => void;
  shouldScrollToQuizSettings: boolean;
  setShouldScrollToQuizSettings: (shouldScroll: boolean) => void;
  focusedLogicRuleId: string | null;
  setFocusedLogicRuleId: (id: string | null) => void;
}

export const useFormStore = create<FormBuilderState>()(persist((set, get) => {
  // Helper to emit changes
  const emitChange = (form: Form | null) => {
      const socket = get().socket;
      if (form && socket && !form.id.startsWith('temp-')) {
          socket.emit('update_form_client', {
              formId: form.id,
              data: form
          });
      }
  };

  return {
  currentForm: null,
  socket: null,
  focusedLogicRuleId: null,
  setFocusedLogicRuleId: (id) => set({ focusedLogicRuleId: id }),
  activeSidebarTab: 'properties',
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  shouldScrollToQuizSettings: false,
  setShouldScrollToQuizSettings: (shouldScroll) => set({ shouldScrollToQuizSettings: shouldScroll }),
  selectedFieldId: null,
  additionalSelectedIds: [],
  clipboard: null,
  shouldFocusField: false,
  history: [],
  historyIndex: -1,
  setCurrentForm: (form) => {
    set({ 
      currentForm: form,
      history: form ? [{ form: JSON.parse(JSON.stringify(form)), timestamp: Date.now() }] : [],
      historyIndex: form ? 0 : -1,
    });
  },
  // ... (rest of methods)
  updateForm: (updates, emit = true) => {
    const form = get().currentForm;
    if (!form) return;
    const newForm = { ...form, ...updates };
    set({ currentForm: newForm });
    if (emit) emitChange(newForm);
    get().saveToHistory();
  },
  saveToHistory: () => {
    const state = get();
    const form = state.currentForm;
    if (!form) return;

    // สร้าง history ใหม่โดยตัดส่วนที่อยู่หลัง historyIndex ออก
    const newHistory = state.historyIndex >= 0 
      ? state.history.slice(0, state.historyIndex + 1)
      : [];
    
    // เพิ่ม state ปัจจุบันเข้าไปใน history
    newHistory.push({
      form: JSON.parse(JSON.stringify(form)),
      timestamp: Date.now(),
    });
    
    set({
      history: newHistory.slice(-50), // Keep last 50 states
      historyIndex: newHistory.length - 1,
    });
  },
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const newForm = JSON.parse(JSON.stringify(state.history[newIndex].form));
      set({
        currentForm: newForm,
        historyIndex: newIndex,
      });
      emitChange(newForm); // Emit undo
    }
  },
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const newForm = JSON.parse(JSON.stringify(state.history[newIndex].form));
      set({
        currentForm: newForm,
        historyIndex: newIndex,
      });
      emitChange(newForm); // Emit redo
    }
  },
  addField: (fieldData, id) => {
    const form = get().currentForm;
    if (!form) return;

    const insertOrder = fieldData.order !== undefined ? fieldData.order : (form.fields?.length || 0);
    
    const newField: Field = {
      id: id || `temp-${Date.now()}`,
      formId: form.id,
      ...fieldData,
      order: insertOrder,
    };

    const existingFields = form.fields || [];
    const updatedFields = existingFields.map((f) => ({
      ...f,
      order: f.order >= insertOrder ? f.order + 1 : f.order,
    }));
    
    updatedFields.splice(insertOrder, 0, newField);

    const newForm = { ...form, fields: updatedFields };
    set({ currentForm: newForm });
    
    emitChange(newForm); // Emit add
    get().saveToHistory();
    
    return newField;
    return newField;
  },
  addGroupTemplate: (template: string) => {
    const { currentForm, selectedFieldId } = get();
    if (!currentForm) return;

    // Use shared utility to generate fields
    const newFields = generateGroupTemplate(template, currentForm.id);
    const groupField = newFields[0]; // First one is always the group
    
    // Determine insert position: After selected or at end
    let insertIndex = currentForm.fields?.length || 0;
    
    // If a field is selected, insert after it
    if (selectedFieldId) {
        const selectedField = currentForm.fields?.find(f => f.id === selectedFieldId);
        if (selectedField) {
            // If selected is in a group, find the group's index
            if (selectedField.groupId) {
                 const parentGroup = currentForm.fields?.find(f => f.id === selectedField.groupId);
                 if (parentGroup) insertIndex = parentGroup.order + 1;
                 else insertIndex = currentForm.fields?.length || 0; // Fallback
            } else {
                 insertIndex = selectedField.order + 1;
            }
        }
    }

    // Set order for the new group
    groupField.order = insertIndex;

    // Shift existing TOP-LEVEL fields
    const currentAllFields = currentForm.fields || [];
    const updatedFields = currentAllFields.map(f => {
        // Only shift roots that are after insert position
        if (!f.groupId && f.order >= insertIndex) {
            return { ...f, order: f.order + 1 };
        }
        return f;
    });

    // Add new template fields
    updatedFields.push(...newFields);

    const newForm = { ...currentForm, fields: updatedFields };
    set({ currentForm: newForm });
    
    emitChange(newForm);
    get().saveToHistory();
    get().selectField(groupField.id); // Select the new group
  },
  
  addBundle: (bundle: { title: string, fields: any[] }) => {
      const { currentForm } = get();
      if (!currentForm) return;

      const insertIndex = currentForm.fields?.length || 0;
      // TODO: Refine insert index logic based on selection if needed, similar to addGroupTemplate
      // For now, appending to end or simple logic is safe.
      
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
          order: 0, // Order within group? No, flat list order? 
          // Our system seems to use flat list order?
          // If using flat list, they need to be inserted AFTER group.
          // Wait, FieldType.GROUP usually implies nesting in UI, but flat data structure?
          // Looking at `addGroupTemplate` (lines 174+), it produces a flat list.
          // Children usually have `groupId` set.
          groupId: groupId,
          options: f.options,
          validation: f.validation,
          required: f.required ?? false,
          placeholder: f.placeholder,
          isPII: f.isPII ?? false,
          shrink: f.shrink
      }));
      
      // Update orders
      // Group order = insertIndex
      // Children order = insertIndex + 1 + i
      
      childFields.forEach((f, i) => f.order = insertIndex + 1 + i);
      
      const allNewFields = [groupField, ...childFields];
      
      // Merge with existing
      const existingFields = currentForm.fields || [];
      // Insert at end for simplicity for now, or splice if we want specific position
      // Let's just push for robustness first.
      
      const updatedFields = [...existingFields, ...allNewFields];
      // Re-index everything to be safe?
      updatedFields.forEach((f, i) => f.order = i);

      const newForm = { ...currentForm, fields: updatedFields };
      set({ currentForm: newForm });
      emitChange(newForm);
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
    emitChange(newForm); // Emit update field
    get().saveToHistory();
  },
  deleteField: (fieldId) => {
    const form = get().currentForm;
    if (!form || !form.fields) return;

    // Helper to find all descendant IDs
    const getDescendantIds = (parentId: string, allFields: Field[]): string[] => {
        const children = allFields.filter(f => f.groupId === parentId);
        let ids = children.map(c => c.id);
        children.forEach(child => {
            ids = [...ids, ...getDescendantIds(child.id, allFields)];
        });
        return ids;
    };

    const idsToDelete = [fieldId, ...getDescendantIds(fieldId, form.fields)];

    const remainingFields = form.fields.filter((f) => !idsToDelete.includes(f.id));

    // Sync Page Settings based on remaining Page Breaks
    const pageCount = remainingFields.filter(f => f.type === FieldType.PAGE_BREAK).length + 1;
    let newPageSettings = [...(form.pageSettings || [])];

    if (newPageSettings.length > pageCount) {
        newPageSettings = newPageSettings.slice(0, pageCount);
    }
    // Ensure we have enough (just in case, though delete usually reduces)
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
    
    emitChange(newForm); // Emit delete
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
        label: `${fieldToClone.label}`, // Keep same label as requested in modern implementations usually, or add copy suffix? User asked for "Duplicate", usually implies exact copy or "Copy". I'll keep exact scaling.
        order: fieldIndex + 1
    };

    const newFields = [...form.fields];
    newFields.splice(fieldIndex + 1, 0, newField);
    
    // Re-index all
    newFields.forEach((f, i) => f.order = i);

    const newForm = { ...form, fields: newFields };
    set({ currentForm: newForm });
    
    // Select the new field? Usually yes.
    get().selectField(newField.id, false);
    
    emitChange(newForm);
    get().saveToHistory();
  },
  reorderFields: (startIndex, endIndex, skipHistory = false) => {
    const form = get().currentForm;
    if (!form || !form.fields) return;

    const newFields = Array.from(form.fields);
    const [removed] = newFields.splice(startIndex, 1);
    newFields.splice(endIndex, 0, removed);

    // Update order
    newFields.forEach((field, index) => {
      field.order = index;
    });

    const newForm = { ...form, fields: newFields };
    set({ currentForm: newForm });
    
    // บันทึก history เฉพาะเมื่อไม่ skip
    if (!skipHistory) {
      get().saveToHistory();
      // Only emit if not skipping history (dragging usually emits multiple times, might want to debounce or emit on drop)
      // But for now, safe to emit.
      emitChange(newForm); 
    }
  },
  selectField: (fieldId, autoFocus = false) => set({ 
    selectedFieldId: fieldId, 
    shouldFocusField: autoFocus,
    additionalSelectedIds: [], // Clear multi-selection when single selecting
    activeSidebarTab: 'properties' // Auto-switch to properties tab
  }),
  selectAllFields: () => {
    const form = get().currentForm;
    if (!form || !form.fields) return;
    
    // Select the first one as primary (if none selected), others as additional
    const allIds = form.fields.map(f => f.id);
    if (allIds.length === 0) return;

    // Use current selected if valid, otherwise first
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
    
    // Case 1: Toggling the Primary Selection
    if (selectedFieldId === fieldId) {
        if (additionalSelectedIds.length > 0) {
            // Promote first additional to primary, remove it from additional
            const [newPrimary, ...rest] = additionalSelectedIds;
            set({ selectedFieldId: newPrimary, additionalSelectedIds: rest });
        } else {
            // Deselect completely if it was the only one
            set({ selectedFieldId: null });
        }
        return;
    }

    // Case 2: Toggling an Additional Selection
    if (additionalSelectedIds.includes(fieldId)) {
        set({ additionalSelectedIds: additionalSelectedIds.filter(id => id !== fieldId) });
        return;
    }

    // Case 3: Adding New Selection (Ctrl+Click on unselected)
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
      
      // Helper to find all descendant IDs (duplicated from deleteField for now, or could be extracted)
      const getDescendantIds = (parentId: string, allFields: Field[]): string[] => {
        const children = allFields.filter(f => f.groupId === parentId);
        let ids = children.map(c => c.id);
        children.forEach(child => {
            ids = [...ids, ...getDescendantIds(child.id, allFields)];
        });
        return ids;
      };

      let allIdsToDelete = [...initialIdsToDelete];
      initialIdsToDelete.forEach(id => {
          allIdsToDelete = [...allIdsToDelete, ...getDescendantIds(id, form.fields!)];
      });

      // Dedup
      allIdsToDelete = [...new Set(allIdsToDelete)];

      const newFields = form.fields.filter(f => !allIdsToDelete.includes(f.id));
      newFields.forEach((f, i) => f.order = i); // Re-index

      // Sync Page Settings based on remaining Page Breaks
      const pageCount = newFields.filter(f => f.type === FieldType.PAGE_BREAK).length + 1;
      let newPageSettings = [...(form.pageSettings || [])];

      if (newPageSettings.length > pageCount) {
          newPageSettings = newPageSettings.slice(0, pageCount);
      }
      while (newPageSettings.length < pageCount) {
          newPageSettings.push({ id: generateUUID(), title: `Page ${newPageSettings.length + 1}` });
      }

      set({ 
          currentForm: { ...form, fields: newFields, pageSettings: newPageSettings },
          selectedFieldId: null,
          additionalSelectedIds: []
      });
      emitChange({ ...form, fields: newFields });
      get().saveToHistory();
  },

  copyFields: () => {
    const { currentForm, selectedFieldId, additionalSelectedIds } = get();
    if (!currentForm || !currentForm.fields) return;

    const idsToCopy = [selectedFieldId, ...additionalSelectedIds].filter(Boolean) as string[];
    if (idsToCopy.length === 0) return;

    const fieldsToCopy = currentForm.fields.filter(f => idsToCopy.includes(f.id));
    // Sort by order to preserve relative arrangement
    fieldsToCopy.sort((a, b) => a.order - b.order); 

    set({ clipboard: JSON.parse(JSON.stringify(fieldsToCopy)) });
  },

  cutFields: () => {
      get().copyFields(); // Copy first
      const { selectedFieldId, additionalSelectedIds } = get();
      const idsToDelete = [selectedFieldId, ...additionalSelectedIds].filter(Boolean) as string[];
      
      // Batch Delete
      const form = get().currentForm;
      if (!form || !form.fields) return;
      
      const newFields = form.fields.filter(f => !idsToDelete.includes(f.id));
      
      // Re-index
      newFields.forEach((f, i) => f.order = i);

      set({ 
          currentForm: { ...form, fields: newFields },
          selectedFieldId: null,
          additionalSelectedIds: []
      });
      get().saveToHistory();
  },

  pasteFields: () => {
      const { clipboard, currentForm, selectedFieldId } = get();
      if (!clipboard || !currentForm || !currentForm.fields) return;

      const newFields = JSON.parse(JSON.stringify(clipboard)); // Deep copy from clipboard
      
      // Determine insert index: After the last selected field, or at end
      let insertIndex = currentForm.fields.length;
      if (selectedFieldId) {
          const selectedField = currentForm.fields.find(f => f.id === selectedFieldId);
          if (selectedField) insertIndex = selectedField.order + 1;
      }

      // Generate new IDs and adjust Objects
      const fieldsToAdd = newFields.map((field: Field, index: number) => ({
          ...field,
          id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          order: insertIndex + index // Temporary
      }));

      const existingFields = [...currentForm.fields];
      existingFields.splice(insertIndex, 0, ...fieldsToAdd);

      // Re-index all
      existingFields.forEach((f, i) => f.order = i);

      set({
          currentForm: { ...currentForm, fields: existingFields },
          // Select the pasted fields
          selectedFieldId: fieldsToAdd[0].id,
          additionalSelectedIds: fieldsToAdd.slice(1).map((f: Field) => f.id)
      });
      get().saveToHistory();
  },

  addCondition: (conditionData) => {
    const form = get().currentForm;
    if (!form) return;

    const newCondition: FieldCondition = {
      id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      formId: form.id,
      ...conditionData,
    };

    const newForm = {
      ...form,
      conditions: [...(form.conditions || []), newCondition],
    };

    set({ currentForm: newForm });
    emitChange(newForm);
    get().saveToHistory();
  },

  updateCondition: (conditionId, updates) => {
    const form = get().currentForm;
    if (!form) return;

    const newForm = {
      ...form,
      conditions: form.conditions?.map((c) =>
        c.id === conditionId ? { ...c, ...updates } : c
      ),
    };

    set({ currentForm: newForm });
    emitChange(newForm);
    get().saveToHistory();
  },

  deleteCondition: (conditionId) => {
    const form = get().currentForm;
    if (!form) return;

    const newForm = {
      ...form,
      conditions: form.conditions?.filter((c) => c.id !== conditionId),
    };

    set({ currentForm: newForm });
    emitChange(newForm);
    get().saveToHistory();
  },

  setShouldFocusField: (shouldFocus) => set({ shouldFocusField: shouldFocus }),
  loadForm: async (formId: string) => {
    const { currentForm: localForm, history, socket: existingSocket } = get();
    const hasMatchingHistory = localForm?.id === formId && history.length > 0;

    // --- Socket Initialization ---
    // If socket exists but disconnected, or connected to wrong form (hypothetically), or not existing
    let socket = existingSocket;
    if (!socket) {
        // Determine socket URL for forms namespace
        // In production: use VITE_API_URL (without /api)
        // In development: use localhost:3000 or let proxy handle it
        const socketUrl = import.meta.env.VITE_API_URL;
        let baseUrl: string;
        
        if (socketUrl) {
          baseUrl = socketUrl.replace('/api', '');
        } else {
          baseUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
        }
        
        socket = io(`${baseUrl}/forms`, {
          transports: ['websocket', 'polling'],
          path: '/socket.io',
          autoConnect: true,
        }); 
        set({ socket });

        socket.on('connect', () => {

        });
        
        // Listen for Remote Updates
        socket.on('form_updated', (remoteForm: Form) => {

             // Update local state WITHOUT emitting back
             // Also prevent overwriting if we are currently dragging? (Maybe too complex for now)
             // Ideally we should merge, but for now Last Write Wins replacment
             set({ currentForm: remoteForm });
             // We might NOT want to save to history for every remote keystroke
             // or maybe we do? Let's just update view for now.
        });
    }
    
    // Join Room
    if (socket && !formId.startsWith('temp-')) {
        socket.emit('join_form', formId);
    }

    try {
      const response = await api.get(`/forms/${formId}`);
      const form = response.data.form;
      
      if (hasMatchingHistory) {

          if (form && localForm) {
            set({ currentForm: { ...localForm, updatedAt: form.updatedAt } });
          }
          return;
      } else {
          set({ 
            currentForm: form,
            history: form ? [{ form: JSON.parse(JSON.stringify(form)), timestamp: Date.now() }] : [],
            historyIndex: form ? 0 : -1,
          });
      }
    } catch (error: any) {
      console.error('Failed to load form:', error);
      // If network error and we have local history, rely on it
      if ((error.code === 'ERR_NETWORK' || error.message?.includes('CONNECTION_REFUSED')) && hasMatchingHistory) {
          console.warn('Backend not available, using local persisted form');
          return; 
      }
      
      // If it's a network error or connection refused, create a temporary form
      if (error.code === 'ERR_NETWORK' || error.message?.includes('CONNECTION_REFUSED')) {
        console.warn('Backend not available, using temporary form');
        // Don't set currentForm to avoid breaking the UI
        // The component will handle this case
      }
      // Re-throw to let component handle it
      throw error;
    }
  },
  saveForm: async () => {
    const form = get().currentForm;
    if (!form) return;

    try {
      const isNewForm = form.id.startsWith('temp-');
      
      // DEBUG: Check fields before save

      
      const payload = {
        title: form.title || 'Untitled Form',
        description: form.description,
        status: form.status,
        isQuiz: form.isQuiz,
        quizSettings: form.quizSettings,
        welcomeSettings: form.welcomeSettings,
        thankYouSettings: form.thankYouSettings,
        settings: form.settings,
        pageSettings: form.pageSettings,
        fields: form.fields?.map((f) => ({
           id: f.id, // Include ID to preserve it (fixes Foreign Key error)
           type: f.type,
           label: f.label,
           placeholder: f.placeholder,
           required: f.required,
           validation: f.validation,
           order: f.order,
           options: f.options,
           correctAnswer: f.correctAnswer,
           score: f.score,
           groupId: f.groupId,
           shrink: f.shrink,
           isPII: f.isPII,
        })),
        conditions: form.conditions?.filter(c => {
             // Sanitize: Only keep conditions where both source and target exist in current fields
             const validIds = new Set(form.fields?.map(f => f.id) || []);
             return validIds.has(c.sourceFieldId) && validIds.has(c.targetFieldId);
        }).map((c) => ({
             sourceFieldId: c.sourceFieldId,
             targetFieldId: c.targetFieldId,
             operator: c.operator,
             value: c.value,
             action: c.action,
        })),
        logicRules: form.logicRules?.map(rule => ({
          id: rule.id,
          name: rule.name,
          logicType: rule.logicType,
          conditions: rule.conditions.map(c => ({
            id: c.id,
            fieldId: c.fieldId,
            operator: c.operator,
            value: c.value,
          })),
          actions: rule.actions.map(a => ({
            id: a.id,
            type: a.type,
            fieldId: a.fieldId,
          })),
        })),
      };

      let response;
      if (isNewForm) {
        // Create new form (POST)
        response = await api.post('/forms', payload);
        
        // Update local store with real ID and data from server
        const savedForm = response.data.form;
        set({ 
            currentForm: savedForm,
            // Update history to reflect the real ID
            history: [{ form: JSON.parse(JSON.stringify(savedForm)), timestamp: Date.now() }],
            historyIndex: 0
        });
        get().saveToHistory();
        
        return savedForm;
      } else {
        // Update existing form (PATCH)
        response = await api.patch(`/forms/${form.id}`, payload);
        return response.data.form;
      }
    } catch (error: any) {
      console.error('Failed to save form:', error);
      console.error('Error saving form:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  },

  addLogicRule: (name?: string) => {
    const { currentForm } = get();
    if (!currentForm) return;

    const existingRules = currentForm.logicRules || [];
    
    const newRule: LogicRule = {
      id: `rule-${Date.now()}`,
      name: name || `Condition ${existingRules.length + 1}`,
      logicType: 'and',
      conditions: [{
        id: `cond-${Date.now()}`,
        fieldId: '',
        operator: 'EQUALS',
        value: ''
      }],
      actions: [{
        id: `action-${Date.now()}`,
        type: 'show',
        fieldId: ''
      }]
    };

    set({
      currentForm: {
        ...currentForm,
        logicRules: [...existingRules, newRule]
      }
    });
    get().saveToHistory();
  },

  updateLogicRule: (ruleId: string, updates: Partial<LogicRule>) => {
    const { currentForm } = get();
    if (!currentForm?.logicRules) return;

    set({
      currentForm: {
        ...currentForm,
        logicRules: currentForm.logicRules.map(rule =>
          rule.id === ruleId ? { ...rule, ...updates } : rule
        )
      }
    });
    get().saveToHistory();
  },

  deleteLogicRule: (ruleId: string) => {
    const { currentForm } = get();
    if (!currentForm?.logicRules) return;

    set({
      currentForm: {
        ...currentForm,
        logicRules: currentForm.logicRules.filter(rule => rule.id !== ruleId)
      }
    });
    get().saveToHistory();
  },

  addConditionToRule: (ruleId: string) => {
    const { currentForm } = get();
    if (!currentForm?.logicRules) return;

    const newCondition: LogicCondition = {
      id: `cond-${Date.now()}`,
      fieldId: '',
      operator: 'EQUALS',
      value: ''
    };

    set({
      currentForm: {
        ...currentForm,
        logicRules: currentForm.logicRules.map(rule =>
          rule.id === ruleId
            ? { ...rule, conditions: [...rule.conditions, newCondition] }
            : rule
        )
      }
    });
    get().saveToHistory();
  },

  removeConditionFromRule: (ruleId: string, conditionId: string) => {
    const { currentForm } = get();
    if (!currentForm?.logicRules) return;

    set({
      currentForm: {
        ...currentForm,
        logicRules: currentForm.logicRules.map(rule =>
          rule.id === ruleId
            ? { ...rule, conditions: rule.conditions.filter(c => c.id !== conditionId) }
            : rule
        )
      }
    });
    get().saveToHistory();
  },

  addActionToRule: (ruleId: string) => {
    const { currentForm } = get();
    if (!currentForm?.logicRules) return;

    const newAction: LogicAction = {
      id: `action-${Date.now()}`,
      type: 'show',
      fieldId: ''
    };

    set({
      currentForm: {
        ...currentForm,
        logicRules: currentForm.logicRules.map(rule =>
          rule.id === ruleId
            ? { ...rule, actions: [...rule.actions, newAction] }
            : rule
        )
      }
    });
    get().saveToHistory();
  },

  removeActionFromRule: (ruleId: string, actionId: string) => {
    const { currentForm } = get();
    if (!currentForm?.logicRules) return;

    set({
      currentForm: {
        ...currentForm,
        logicRules: currentForm.logicRules.map(rule =>
          rule.id === ruleId
            ? { ...rule, actions: rule.actions.filter(a => a.id !== actionId) }
            : rule
        )
      }
    });
    get().saveToHistory();
  },

  updateRuleCondition: (ruleId: string, conditionId: string, updates: Partial<LogicCondition>) => {
    const { currentForm } = get();
    if (!currentForm?.logicRules) return;

    set({
      currentForm: {
        ...currentForm,
        logicRules: currentForm.logicRules.map(rule =>
          rule.id === ruleId
            ? {
                ...rule,
                conditions: rule.conditions.map(c =>
                  c.id === conditionId ? { ...c, ...updates } : c
                )
              }
            : rule
        )
      }
    });
    get().saveToHistory();
  },

  updateRuleAction: (ruleId: string, actionId: string, updates: Partial<LogicAction>) => {
    const { currentForm } = get();
    if (!currentForm?.logicRules) return;

    set({
      currentForm: {
        ...currentForm,
        logicRules: currentForm.logicRules.map(rule =>
          rule.id === ruleId
            ? {
                ...rule,
                actions: rule.actions.map(a =>
                  a.id === actionId ? { ...a, ...updates } : a
                )
              }
            : rule
        )
      }
    });
    get().saveToHistory();
  },
  };
}, {
  name: 'form-builder-storage',
  partialize: (state) => ({ 
      history: state.history, 
      historyIndex: state.historyIndex,
      clipboard: state.clipboard,
      currentForm: state.currentForm // Also persist current form state for full recovery
  }),
}));

