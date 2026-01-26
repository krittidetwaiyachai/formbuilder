import { StateCreator } from 'zustand';
import { FormBuilderState } from '../formStore';
import { LogicRule, LogicCondition, LogicAction, FieldCondition } from '@/types';
import { generateUUID } from '@/utils/uuid';

export interface LogicSlice {
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
}

export const createLogicSlice: StateCreator<FormBuilderState, [], [], LogicSlice> = (set, get) => ({
  addCondition: (conditionData) => {
    const { currentForm } = get();
    if (!currentForm) return;

    const newCondition: FieldCondition = {
        ...conditionData,
        id: generateUUID(),
        formId: currentForm.id,
    };

    const newForm = {
        ...currentForm,
        conditions: [...(currentForm.conditions || []), newCondition],
    };

    set({ currentForm: newForm });
    get().emitChange(newForm);
    get().saveToHistory();
  },

  updateCondition: (conditionId, updates) => {
    const { currentForm } = get();
    if (!currentForm || !currentForm.conditions) return;

    const newConditions = currentForm.conditions.map((c) =>
        c.id === conditionId ? { ...c, ...updates } : c
    );

    const newForm = { ...currentForm, conditions: newConditions };
    set({ currentForm: newForm });
    get().emitChange(newForm);
    get().saveToHistory();
  },

  deleteCondition: (conditionId) => {
    const { currentForm } = get();
    if (!currentForm || !currentForm.conditions) return;

    const newConditions = currentForm.conditions.filter((c) => c.id !== conditionId);

    const newForm = { ...currentForm, conditions: newConditions };
    set({ currentForm: newForm });
    get().emitChange(newForm);
    get().saveToHistory();
  },

  addLogicRule: (name) => {
      const { currentForm } = get();
      if (!currentForm) return;
      
      const newRule: LogicRule = {
          id: generateUUID(),
          name: name || `Rule ${ (currentForm.logicRules?.length || 0) + 1 }`,
          logicType: 'and',
          conditions: [],
          actions: []
      };

      const newForm = {
          ...currentForm,
          logicRules: [...(currentForm.logicRules || []), newRule]
      };

      set({ 
          currentForm: newForm,
          focusedLogicRuleId: newRule.id 
      });
      get().emitChange(newForm);
      get().saveToHistory();
  },

  updateLogicRule: (ruleId, updates) => {
      const { currentForm } = get();
      if (!currentForm) return;

      const newRules = currentForm.logicRules?.map(rule => 
          rule.id === ruleId ? { ...rule, ...updates } : rule
      ) || [];

      const newForm = { ...currentForm, logicRules: newRules };
      set({ currentForm: newForm });
      get().emitChange(newForm);
      get().saveToHistory();
  },

  deleteLogicRule: (ruleId) => {
      const { currentForm } = get();
      if (!currentForm) return;

      const newRules = currentForm.logicRules?.filter(rule => rule.id !== ruleId) || [];

      const newForm = { 
          ...currentForm, 
          logicRules: newRules,
          focusedLogicRuleId: get().focusedLogicRuleId === ruleId ? null : get().focusedLogicRuleId
      };
      set({ currentForm: newForm });
      get().emitChange(newForm);
      get().saveToHistory();
  },

  addConditionToRule: (ruleId) => {
      const { currentForm } = get();
      if (!currentForm) return;

      const newCondition: LogicCondition = {
          id: generateUUID(),
          fieldId: '',
          operator: 'equals',
          value: ''
      };

      const newRules = currentForm.logicRules?.map(rule => {
          if (rule.id === ruleId) {
              return { 
                  ...rule, 
                  conditions: [...rule.conditions, newCondition] 
              };
          }
          return rule;
      }) || [];

      const newForm = { ...currentForm, logicRules: newRules };
      set({ currentForm: newForm });
      get().emitChange(newForm);
  },

  removeConditionFromRule: (ruleId, conditionId) => {
      const { currentForm } = get();
      if (!currentForm) return;

      const newRules = currentForm.logicRules?.map(rule => {
          if (rule.id === ruleId) {
              return { 
                  ...rule, 
                  conditions: rule.conditions.filter(c => c.id !== conditionId)
              };
          }
          return rule;
      }) || [];

      const newForm = { ...currentForm, logicRules: newRules };
      set({ currentForm: newForm });
      get().emitChange(newForm);
  },

  addActionToRule: (ruleId) => {
      const { currentForm } = get();
      if (!currentForm) return;

      const newAction: LogicAction = {
          id: generateUUID(),
          type: 'show',
          fieldId: ''
      };

      const newRules = currentForm.logicRules?.map(rule => {
          if (rule.id === ruleId) {
              return { 
                  ...rule, 
                  actions: [...rule.actions, newAction] 
              };
          }
          return rule;
      }) || [];

      const newForm = { ...currentForm, logicRules: newRules };
      set({ currentForm: newForm });
      get().emitChange(newForm);
  },

  removeActionFromRule: (ruleId, actionId) => {
      const { currentForm } = get();
      if (!currentForm) return;

      const newRules = currentForm.logicRules?.map(rule => {
          if (rule.id === ruleId) {
              return { 
                  ...rule, 
                  actions: rule.actions.filter(a => a.id !== actionId)
              };
          }
          return rule;
      }) || [];

      const newForm = { ...currentForm, logicRules: newRules };
      set({ currentForm: newForm });
      get().emitChange(newForm);
  },

  updateRuleCondition: (ruleId, conditionId, updates) => {
      const { currentForm } = get();
      if (!currentForm) return;

      const newRules = currentForm.logicRules?.map(rule => {
          if (rule.id === ruleId) {
              return { 
                  ...rule, 
                  conditions: rule.conditions.map(c => 
                      c.id === conditionId ? { ...c, ...updates } : c
                  )
              };
          }
          return rule;
      }) || [];

      const newForm = { ...currentForm, logicRules: newRules };
      set({ currentForm: newForm });
      get().emitChange(newForm);
  },

  updateRuleAction: (ruleId, actionId, updates) => {
        const { currentForm } = get();
        if (!currentForm) return;

        const newRules = currentForm.logicRules?.map(rule => {
            if (rule.id === ruleId) {
                return { 
                    ...rule, 
                    actions: rule.actions.map(a => 
                        a.id === actionId ? { ...a, ...updates } : a
                    )
                };
            }
            return rule;
        }) || [];

        const newForm = { ...currentForm, logicRules: newRules };
        set({ currentForm: newForm });
        get().emitChange(newForm);
  }
});
