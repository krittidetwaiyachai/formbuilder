import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io } from 'socket.io-client';
import throttle from 'lodash.throttle';
import { Form } from '@/types';
import { FieldSlice, createFieldSlice } from './slices/createFieldSlice';
import { SelectionSlice, createSelectionSlice } from './slices/createSelectionSlice';
import { LogicSlice, createLogicSlice } from './slices/createLogicSlice';
import { FormSlice, HistorySlice, createFormSlice, createHistorySlice } from './slices/createFormSlice';

export type FormBuilderState = FieldSlice & SelectionSlice & LogicSlice & FormSlice & HistorySlice & {
    emitChange: (form: Form | null) => void;
};

export const useFormStore = create<FormBuilderState>()(persist((set, get) => {
    
    const throttledEmit = throttle((socket: any, form: Form) => {
        if (socket.connected) {
            socket.emit('update_form_client', {
                formId: form.id,
                data: form
            });
        }
    }, 100, { leading: true, trailing: true });

    const emitChange = (form: Form | null) => {
        const socket = get().socket;
        if (form && socket && !form.id.startsWith('temp-')) {
            throttledEmit(socket, form);
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
