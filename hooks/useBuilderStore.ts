import { create } from "zustand";
import { FormElement, FormTheme, FormSettings } from "@/types/form";

interface HistoryState {
  elements: FormElement[];
  timestamp: number;
}

interface BuilderState {
  elements: FormElement[];
  selectedElementId: string | null;
  theme: FormTheme | null;
  settings: FormSettings | null;
  history: HistoryState[];
  historyIndex: number;
  setElements: (elements: FormElement[]) => void;
  addElement: (element: FormElement) => void;
  addElementAt: (element: FormElement, index: number) => void;
  updateElement: (id: string, updates: Partial<FormElement>) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  setSelectedElement: (id: string | null) => void;
  reorderElements: (startIndex: number, endIndex: number) => void;
  setTheme: (theme: FormTheme) => void;
  setSettings: (settings: FormSettings) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

const defaultTheme: FormTheme = {
  primaryColor: "#3B82F6",
  backgroundColor: "#FFFFFF",
  backgroundType: "color",
  textColor: "#1F2937",
  buttonStyle: "filled",
  borderRadius: "medium",
  fontFamily: "Inter",
};

const defaultSettings: FormSettings = {
  allowMultipleSubmissions: true,
  showProgressBar: false,
  showPageNumbers: false,
  requireLogin: false,
  successMessage: "Thank you for your submission!",
  emailNotifications: false,
  notificationEmails: [],
};

const saveToHistoryHelper = (elements: FormElement[]): HistoryState[] => {
  return [{ elements: JSON.parse(JSON.stringify(elements)), timestamp: Date.now() }];
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  elements: [],
  selectedElementId: null,
  theme: defaultTheme,
  settings: defaultSettings,
  history: [],
  historyIndex: -1,
  
  saveToHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({
      elements: JSON.parse(JSON.stringify(state.elements)),
      timestamp: Date.now(),
    });
    set({
      history: newHistory.slice(-50), 
      historyIndex: newHistory.length - 1,
    });
  },

  setElements: (elements) => {
    set({ elements });
    get().saveToHistory();
  },

  addElement: (element) => {
    set((state) => ({ elements: [...state.elements, element] }));
    get().saveToHistory();
  },

  addElementAt: (element, index) => {
    set((state) => {
      const newElements = [...state.elements];
      newElements.splice(index, 0, element);
      return { elements: newElements };
    });
    get().saveToHistory();
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
    get().saveToHistory();
  },

  removeElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
    }));
    get().saveToHistory();
  },

  duplicateElement: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (element) {
      const duplicated: FormElement = {
        ...JSON.parse(JSON.stringify(element)),
        id: `element-${Date.now()}`,
        label: `${element.label} (Copy)`,
      };
      const index = state.elements.findIndex((el) => el.id === id);
      const newElements = [...state.elements];
      newElements.splice(index + 1, 0, duplicated);
      set({ elements: newElements });
      get().saveToHistory();
    }
  },

  setSelectedElement: (id) => set({ selectedElementId: id }),

  reorderElements: (startIndex, endIndex) => {
    set((state) => {
      const newElements = Array.from(state.elements);
      const [removed] = newElements.splice(startIndex, 1);
      newElements.splice(endIndex, 0, removed);
      return { elements: newElements };
    });
    get().saveToHistory();
  },

  setTheme: (theme) => set({ theme }),
  setSettings: (settings) => set({ settings }),

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        elements: JSON.parse(JSON.stringify(state.history[newIndex].elements)),
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        elements: JSON.parse(JSON.stringify(state.history[newIndex].elements)),
        historyIndex: newIndex,
      });
    }
  },
}));

