import { create, type StoreApi } from 'zustand';
import { persist } from 'zustand/middleware';
import { Socket } from 'socket.io-client';
import throttle from 'lodash.throttle';
import type { Form } from '@/types';
import { createFieldSlice } from './slices/createFieldSlice';
import type { FieldSlice } from './slices/createFieldSlice';
import { createSelectionSlice } from './slices/createSelectionSlice';
import type { SelectionSlice } from './slices/createSelectionSlice';
import { createLogicSlice } from './slices/createLogicSlice';
import type { LogicSlice } from './slices/createLogicSlice';
import { createFormSlice, createHistorySlice } from './slices/createFormSlice';
import type { FormSlice, HistorySlice } from './slices/createFormSlice';

export type FormBuilderState = FieldSlice & SelectionSlice & LogicSlice & FormSlice & HistorySlice & {
    emitChange: (form: Form | null) => void;
};

export const useFormStore = create<FormBuilderState>()(persist((set, get) => {

    const throttledEmit = throttle((socket: Socket, form: Form) => {
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
        ...createFormSlice(set, get, {} as StoreApi<FormBuilderState>),
        ...createFieldSlice(set, get, {} as StoreApi<FormBuilderState>),
        ...createSelectionSlice(set, get, {} as StoreApi<FormBuilderState>),
        ...createLogicSlice(set, get, {} as StoreApi<FormBuilderState>),
        ...createHistorySlice(set, get, {} as StoreApi<FormBuilderState>),
        emitChange,
    };
}, {
    name: 'form-builder-storage',
    partialize: (state) => ({
        history: state.history,
        historyIndex: state.historyIndex,
    }),
}));
