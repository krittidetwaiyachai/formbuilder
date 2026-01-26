import { create } from 'zustand';
import { FieldType } from '@/types';

export interface BundleField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: any;
  validation?: Record<string, unknown>;
  imageUrl?: string;
  imageWidth?: string;
  videoUrl?: string;
}

export interface Bundle {
  id: string;
  name: string;
  description?: string;
  isPII: boolean;
  isActive: boolean;
  fields: BundleField[];
  options?: any;
}

interface BundleEditorState {
  bundle: Bundle | null;
  selectedFieldId: string | null;
  isDirty: boolean;
  
  history: {
    past: Bundle[];
    future: Bundle[];
  };

  setBundle: (bundle: Bundle | null) => void;
  setSelectedFieldId: (id: string | null) => void;
  addField: (field: Omit<BundleField, 'id' | 'order'>, index?: number) => void;
  updateField: (id: string, updates: Partial<BundleField>) => void;
  deleteField: (id: string) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  updateBundleMeta: (updates: Partial<Pick<Bundle, 'name' | 'description' | 'isPII' | 'isActive' | 'options'>>) => void;
  
  undo: () => void;
  redo: () => void;
  
  saveBundle: () => Promise<void>;
  
  reset: () => void;
}

const pushHistory = (state: BundleEditorState): { past: Bundle[] } => {
  if (!state.bundle) return { past: state.history.past };
  const newPast = [...state.history.past, state.bundle];
  if (newPast.length > 50) newPast.shift();
  return { past: newPast };
};

export const useBundleEditorStore = create<BundleEditorState>((set, get) => ({
  bundle: null,
  selectedFieldId: null,
  isDirty: false,
  history: { past: [], future: [] },

  setBundle: (bundle) => set({ bundle, isDirty: false, history: { past: [], future: [] } }),
  
  setSelectedFieldId: (id) => set({ selectedFieldId: id }),

  addField: (fieldData, index) => set((state) => {
    if (!state.bundle) return state;
    
    const historyUpdate = { history: { ...state.history, ...pushHistory(state), future: [] } };

    const newField: BundleField = {
      ...fieldData,
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: typeof index === 'number' ? index : state.bundle.fields.length,
    };

    const newFields = [...state.bundle.fields];
    if (typeof index === 'number' && index >= 0 && index <= newFields.length) {
        newFields.splice(index, 0, newField);
    } else {
        newFields.push(newField);
    }

    return {
      ...historyUpdate,
      bundle: {
        ...state.bundle,
        fields: newFields.map((f, i) => ({ ...f, order: i })),
      },
      selectedFieldId: newField.id,
      isDirty: true,
    };
  }),

  updateField: (id, updates) => set((state) => {
    if (!state.bundle) return state;

    const historyUpdate = { history: { ...state.history, ...pushHistory(state), future: [] } };
    
    return {
      ...historyUpdate,
      bundle: {
        ...state.bundle,
        fields: state.bundle.fields.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ),
      },
      isDirty: true,
    };
  }),

  deleteField: (id) => set((state) => {
    if (!state.bundle) return state;

    const historyUpdate = { history: { ...state.history, ...pushHistory(state), future: [] } };
    
    return {
      ...historyUpdate,
      bundle: {
        ...state.bundle,
        fields: state.bundle.fields
          .filter((f) => f.id !== id)
          .map((f, index) => ({ ...f, order: index })),
      },
      selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
      isDirty: true,
    };
  }),

  reorderFields: (startIndex, endIndex) => set((state) => {
    if (!state.bundle) return state;

    const historyUpdate = { history: { ...state.history, ...pushHistory(state), future: [] } };
    
    const fields = [...state.bundle.fields];
    const [removed] = fields.splice(startIndex, 1);
    fields.splice(endIndex, 0, removed);
    
    return {
      ...historyUpdate,
      bundle: {
        ...state.bundle,
        fields: fields.map((f, index) => ({ ...f, order: index })),
      },
      isDirty: true,
    };
  }),

  updateBundleMeta: (updates) => set((state) => {
    if (!state.bundle) return state;

    const historyUpdate = { history: { ...state.history, ...pushHistory(state), future: [] } };
    
    return {
      ...historyUpdate,
      bundle: { ...state.bundle, ...updates },
      isDirty: true,
    };
  }),

  undo: () => set((state) => {
    if (state.history.past.length === 0 || !state.bundle) return state;

    const previous = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, -1);

    return {
      bundle: previous,
      history: {
        past: newPast,
        future: [state.bundle, ...state.history.future],
      },
      isDirty: true,
    };
  }),

  redo: () => set((state) => {
    if (state.history.future.length === 0 || !state.bundle) return state;

    const next = state.history.future[0];
    const newFuture = state.history.future.slice(1);

    return {
      bundle: next,
      history: {
        past: [...state.history.past, state.bundle],
        future: newFuture,
      },
      isDirty: true,
    };
  }),

  saveBundle: async () => {
    const { bundle } = get();
    if (!bundle) return;
    
    try {
        const { default: api } = await import('@/lib/api'); 
        const response = await api.patch(`/bundles/${bundle.id}`, {
            name: bundle.name,
            description: bundle.description,
            isPII: bundle.isPII,
            fields: bundle.fields,
            isActive: bundle.isActive,
            options: bundle.options,
        });

        const newBundle = response.data;
        
        const currentSelectedId = get().selectedFieldId;
        let newSelectedId = null;

        if (currentSelectedId && bundle.fields) {
            const index = bundle.fields.findIndex(f => f.id === currentSelectedId);
            if (index !== -1 && newBundle.fields && newBundle.fields[index]) {
                newSelectedId = newBundle.fields[index].id;
            }
        }

        set({ bundle: newBundle, selectedFieldId: newSelectedId, isDirty: false });
        
        window.history.replaceState(null, '', `/admin/bundles/${newBundle.id}`);
        
    } catch (error) {
        console.error("Failed to save bundle:", error);
        throw error; 
    }
  },

  reset: () => set({ bundle: null, selectedFieldId: null, isDirty: false, history: { past: [], future: [] } }),
}));
