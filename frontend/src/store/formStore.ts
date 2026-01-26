import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io } from 'socket.io-client';
import { Form } from '@/types';
import { FieldSlice, createFieldSlice } from './slices/createFieldSlice';
import { SelectionSlice, createSelectionSlice } from './slices/createSelectionSlice';
import { LogicSlice, createLogicSlice } from './slices/createLogicSlice';
import { FormSlice, HistorySlice, createFormSlice, createHistorySlice } from './slices/createFormSlice';

export type FormBuilderState = FieldSlice & SelectionSlice & LogicSlice & FormSlice & HistorySlice & {
    emitChange: (form: Form | null) => void;
};

export const useFormStore = create<FormBuilderState>()(persist((set, get) => {
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
      ...createFormSlice(set, get, [] as any),
      ...createFieldSlice(set, get, [] as any),
      ...createSelectionSlice(set, get, [] as any),
      ...createLogicSlice(set, get, [] as any),
      ...createHistorySlice(set, get, [] as any),
      emitChange,
  };
}, {
  name: 'form-builder-storage',
  partialize: (state) => ({ 
      history: state.history,
      historyIndex: state.historyIndex,
  }),
}));
