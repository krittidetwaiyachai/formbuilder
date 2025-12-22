import { create } from 'zustand';
import { Form, Field, FieldType } from '@/types';
import api from '@/lib/api';

interface HistoryState {
  form: Form;
  timestamp: number;
}

interface FormBuilderState {
  currentForm: Form | null;
  selectedFieldId: string | null;
  shouldFocusField: boolean;
  history: HistoryState[];
  historyIndex: number;
  setCurrentForm: (form: Form | null) => void;
  updateForm: (updates: Partial<Form>) => void;
  addField: (field: Omit<Field, 'id' | 'formId'>, id?: string) => Field | undefined;
  updateField: (fieldId: string, updates: Partial<Field>) => void;
  deleteField: (fieldId: string) => void;
  reorderFields: (startIndex: number, endIndex: number, skipHistory?: boolean) => void;
  selectField: (fieldId: string | null, autoFocus?: boolean) => void;
  setShouldFocusField: (shouldFocus: boolean) => void;
  loadForm: (formId: string) => Promise<void>;
  saveForm: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

export const useFormStore = create<FormBuilderState>((set, get) => ({
  currentForm: null,
  selectedFieldId: null,
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
  updateForm: (updates) => {
    const form = get().currentForm;
    if (!form) return;
    set({ currentForm: { ...form, ...updates } });
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
      set({
        currentForm: JSON.parse(JSON.stringify(state.history[newIndex].form)),
        historyIndex: newIndex,
      });
    }
  },
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        currentForm: JSON.parse(JSON.stringify(state.history[newIndex].form)),
        historyIndex: newIndex,
      });
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

    // Insert field at the specified order and update other fields' orders
    const existingFields = form.fields || [];
    const updatedFields = existingFields.map((f) => ({
      ...f,
      order: f.order >= insertOrder ? f.order + 1 : f.order,
    }));
    
    updatedFields.splice(insertOrder, 0, newField);

    set({
      currentForm: {
        ...form,
        fields: updatedFields,
      },
    });
    get().saveToHistory();
    
    return newField;
  },
  updateField: (fieldId, updates) => {
    const form = get().currentForm;
    if (!form) return;

    set({
      currentForm: {
        ...form,
        fields: form.fields?.map((f) =>
          f.id === fieldId ? { ...f, ...updates } : f
        ),
      },
    });
    get().saveToHistory();
  },
  deleteField: (fieldId) => {
    const form = get().currentForm;
    if (!form) return;

    set({
      currentForm: {
        ...form,
        fields: form.fields?.filter((f) => f.id !== fieldId),
      },
      selectedFieldId: get().selectedFieldId === fieldId ? null : get().selectedFieldId,
    });
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

    set({
      currentForm: {
        ...form,
        fields: newFields,
      },
    });
    
    // บันทึก history เฉพาะเมื่อไม่ skip
    if (!skipHistory) {
      get().saveToHistory();
    }
  },
  selectField: (fieldId, autoFocus = false) => set({ selectedFieldId: fieldId, shouldFocusField: autoFocus }),
  setShouldFocusField: (shouldFocus) => set({ shouldFocusField: shouldFocus }),
  loadForm: async (formId: string) => {
    try {
      const response = await api.get(`/forms/${formId}`);
      const form = response.data.form;
      set({ 
        currentForm: form,
        history: form ? [{ form: JSON.parse(JSON.stringify(form)), timestamp: Date.now() }] : [],
        historyIndex: form ? 0 : -1,
      });
    } catch (error: any) {
      console.error('Failed to load form:', error);
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
      const response = await api.patch(`/forms/${form.id}`, {
        title: form.title,
        description: form.description,
        status: form.status,
        isQuiz: form.isQuiz,
        quizSettings: form.quizSettings,
        fields: form.fields?.map((f) => ({
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          required: f.required,
          validation: f.validation,
          order: f.order,
          options: f.options,
          correctAnswer: f.correctAnswer,
          score: f.score,
        })),
      });
      // Don't update currentForm from response to avoid UI flickering/re-renders
      // The local state is already up to date with the user's changes
      // set({ currentForm: response.data.form });
    } catch (error) {
      console.error('Failed to save form:', error);
      throw error;
    }
  },
}));

