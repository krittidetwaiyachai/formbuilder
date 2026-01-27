import { StateCreator } from 'zustand';
import { FormBuilderState } from '../formStore';
import { Form } from '@/types';
import { Socket } from 'socket.io-client';
import api from '@/lib/api';

export interface FormSlice {
  currentForm: Form | null;
  socket: Socket | null;
  activeSidebarTab: 'properties' | 'theme' | 'settings' | 'logic' | 'builder';
  shouldFocusField: boolean;
  shouldScrollToQuizSettings: boolean;
  focusedLogicRuleId: string | null;

  setCurrentForm: (form: Form | null) => void;
  updateForm: (updates: Partial<Form>, emit?: boolean) => void;
  setShouldFocusField: (shouldFocus: boolean) => void;
  loadForm: (formId: string) => Promise<void>;
  saveForm: () => Promise<any>;
  setActiveSidebarTab: (tab: 'properties' | 'theme' | 'settings' | 'logic' | 'builder') => void;
  setShouldScrollToQuizSettings: (shouldScroll: boolean) => void;
  setFocusedLogicRuleId: (id: string | null) => void;
  setSocket: (socket: Socket | null) => void;
}

export const createFormSlice: StateCreator<FormBuilderState, [], [], FormSlice> = (set, get) => ({
  currentForm: null,
  socket: null,
  activeSidebarTab: 'properties',
  shouldFocusField: false,
  shouldScrollToQuizSettings: false,
  focusedLogicRuleId: null,

  setCurrentForm: (form) => set({ currentForm: form }),
  
  updateForm: (updates, emit = true) => {
    const { currentForm } = get();
    if (!currentForm) return;

    const newForm = { ...currentForm, ...updates };
    set({ currentForm: newForm });

    if (emit) {
        get().emitChange(newForm);
    }
    get().saveToHistory();
  },

  setShouldFocusField: (shouldFocus) => set({ shouldFocusField: shouldFocus }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setShouldScrollToQuizSettings: (shouldScroll) => set({ shouldScrollToQuizSettings: shouldScroll }),
  setFocusedLogicRuleId: (id) => set({ focusedLogicRuleId: id }),
  setSocket: (socket) => set({ socket }),

  loadForm: async (formId) => {
      const response = await api.get(`/forms/${formId}`);
      
      const formData = response.data.form || response.data;
      set({ currentForm: formData });
  },

  saveForm: async () => {
      const { currentForm } = get();
      if (!currentForm) return;

      const { 
          id, createdAt, updatedAt, createdBy, createdById, 
          responseCount, viewCount, collaborators, _count,
          ...payload 
      } = currentForm as any;

      const response = await api.patch(`/forms/${currentForm.id}`, payload);
      return response.data;
  }
});

export interface HistoryStateItem {
    form: Form;
    timestamp: number;
}
  
export interface HistorySlice {
    history: HistoryStateItem[];
    historyIndex: number;
    undo: () => void;
    redo: () => void;
    saveToHistory: () => void;
}
  
export const createHistorySlice: StateCreator<FormBuilderState, [], [], HistorySlice> = (set, get) => ({
    history: [],
    historyIndex: -1,

    saveToHistory: () => {
        const { currentForm, history, historyIndex } = get();
        if (!currentForm) return;

        const newHistory = history.slice(0, historyIndex + 1);
        
        newHistory.push({
            form: JSON.parse(JSON.stringify(currentForm)),
            timestamp: Date.now()
        });

        if (newHistory.length > 50) {
            newHistory.shift();
        }

        set({
            history: newHistory,
            historyIndex: newHistory.length - 1
        });
    },

    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const previousState = history[newIndex];
            set({
                currentForm: previousState.form,
                historyIndex: newIndex
            });
            get().emitChange(previousState.form);
        }
    },

    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextState = history[newIndex];
            set({
                currentForm: nextState.form,
                historyIndex: newIndex
            });
            get().emitChange(nextState.form);
        }
    }
});
