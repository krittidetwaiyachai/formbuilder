import { useState, useRef, useEffect } from 'react';
import { useFormStore } from '@/store/formStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/custom-select';
import { Plus, Trash2, ArrowLeft, Check, Edit2, X, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function LogicCanvas() {
  const { t } = useTranslation();
  const { 
    currentForm, 
    setActiveSidebarTab,
    addLogicRule,
    deleteLogicRule,
    updateLogicRule,
    addConditionToRule,
    removeConditionFromRule,
    addActionToRule,
    removeActionFromRule,
    updateRuleCondition,
    updateRuleAction,
    focusedLogicRuleId
  } = useFormStore();
  
  const ruleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);

  const handleDeleteRule = (id: string) => {
    setDeleteRuleId(id);
  };

  const confirmDelete = () => {
    if (deleteRuleId) {
      deleteLogicRule(deleteRuleId);
      setDeleteRuleId(null);
    }
  };

  
  const scrollToSmoothly = (element: HTMLElement, duration: number = 500) => {
      let parent = element.parentElement;
      while (parent) {
          const style = window.getComputedStyle(parent);
          if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
              break;
          }
          parent = parent.parentElement;
      }
      
      if (!parent) return;
      
      const container = parent;
      
      
      
      
      
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeTop = elementRect.top - containerRect.top;
      
      const targetScroll = container.scrollTop + relativeTop - (container.clientHeight / 2) + (element.clientHeight / 2);
      
      const startY = container.scrollTop;
      const change = targetScroll - startY;
      let startTime = 0;

      const animateScroll = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          
          
          const ease = (t: number, b: number, c: number, d: number) => {
              t /= d / 2;
              if (t < 1) return c / 2 * t * t + b;
              t--;
              return -c / 2 * (t * (t - 2) - 1) + b;
          };

          const val = ease(timeElapsed, startY, change, duration);
          container.scrollTop = val;

          if (timeElapsed < duration) {
              requestAnimationFrame(animateScroll);
          }
      };
      
      requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    if (focusedLogicRuleId && ruleRefs.current[focusedLogicRuleId]) {
      const el = ruleRefs.current[focusedLogicRuleId];
      if (el) {
          scrollToSmoothly(el, 600); 
      }
    }
  }, [focusedLogicRuleId]);
  
  const fields = currentForm?.fields || [];
  const logicRules = currentForm?.logicRules || [];

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editRuleName, setEditRuleName] = useState('');

  const availableFields = fields.filter(f => !f.groupId);

  if (fields.length < 2) {
    const missingCount = 2 - fields.length;
    return (
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="text-center py-12 px-8 bg-amber-50/50 border-2 border-dashed border-amber-200 rounded-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-amber-50 shadow-sm">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('builder.logic.not_enough_fields')}</h3>
          <p className="text-gray-500 mb-6">
            {t('builder.logic.not_enough_desc')}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-200 rounded-lg shadow-sm text-amber-700 text-sm font-medium mb-4">
             <span>{t('builder.logic.please_add', { count: missingCount })}</span>
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setActiveSidebarTab('builder')}
              className="gap-2 text-gray-600 hover:text-gray-900 border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('builder.back_to_canvas')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stripHtml = (html: string) => { 
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="min-h-full py-6 px-4">
      <div className="max-w-2xl mx-auto">
        { }
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            { }
            <div className="relative group/back">
              { }
              <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl opacity-75 blur-sm group-hover/back:opacity-100 group-hover/back:blur-md transition-all duration-500 animate-gradient-x" />
              
              { }
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover/back:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 group-hover/back:w-32 group-hover/back:h-32 bg-white/20 rounded-full transition-all duration-700 ease-out" />
                </div>
              </div>

              { }
              <button
                onClick={() => setActiveSidebarTab('properties')}
                className="relative p-3.5 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center overflow-hidden group"
                title={t('builder.logic.back_to_canvas')}
              >
                { }
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
                
                { }
                <div className="absolute -inset-x-20 -top-20 h-40 bg-gradient-to-b from-white/30 via-white/10 to-transparent rotate-12 group-hover:translate-x-full group-hover:translate-y-full transition-transform duration-1000 ease-out" />

                { }
                <svg className="absolute top-1 right-2 w-3 h-3 text-yellow-200 animate-spin-slow opacity-80" viewBox="0 0 24 24" fill="currentColor" style={{ animationDuration: '4s' }}>
                  <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
                </svg>
                <svg className="absolute bottom-1.5 left-2 w-2.5 h-2.5 text-pink-200 animate-spin-slow opacity-70" viewBox="0 0 24 24" fill="currentColor" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>
                  <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
                </svg>
                <svg className="absolute top-2.5 left-1 w-2 h-2 text-purple-200 animate-spin-slow opacity-60" viewBox="0 0 24 24" fill="currentColor" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
                  <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
                </svg>
                <svg className="absolute bottom-2 right-1.5 w-2 h-2 text-blue-200 animate-spin-slow opacity-75" viewBox="0 0 24 24" fill="currentColor" style={{ animationDuration: '4.5s', animationDelay: '0.3s' }}>
                  <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
                </svg>
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 text-white animate-spin-slow opacity-50" viewBox="0 0 24 24" fill="currentColor" style={{ animationDuration: '6s', animationDelay: '0.8s' }}>
                  <path d="M12 0L14.59 8.41L24 12L14.59 15.59L12 24L9.41 15.59L0 12L9.41 8.41L12 0Z" />
                </svg>

                { }
                <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform duration-300 filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)]" />
              </button>
            </div>
            
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9v3a3 3 0 0 1-3 3H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('builder.logic.title')}</h2>
              <p className="text-sm text-gray-500">{t('builder.logic.subtitle')}</p>
            </div>
          </div>
          <Button onClick={() => addLogicRule()} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('builder.logic.add_rule')}
          </Button>
        </div>

        {logicRules.length === 0 && (
          <>
            <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl mb-6">
              <Plus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t('builder.logic.no_rules_title')}</p>
              <Button onClick={() => addLogicRule()} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                {t('builder.logic.create_first')}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl text-sm text-blue-700 space-y-2">
              <p className="font-semibold">{t('builder.logic.how_it_works')}</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>{t('builder.logic.how_show').split(':')[0]}:</strong>{t('builder.logic.how_show').split(':')[1]}</li>
                <li><strong>{t('builder.logic.how_hide').split(':')[0]}:</strong>{t('builder.logic.how_hide').split(':')[1]}</li>
                <li><strong>{t('builder.logic.how_and').split(':')[0]}:</strong>{t('builder.logic.how_and').split(':')[1]}</li>
                <li><strong>{t('builder.logic.how_or').split(':')[0]}:</strong>{t('builder.logic.how_or').split(':')[1]}</li>
              </ul>
            </div>
          </>
        )}

        {logicRules.map((rule) => {
          const isEditing = editingRuleId === rule.id;

          return (
            <div 
                key={rule.id} 
                ref={el => (ruleRefs.current[rule.id] = el)}
                className={`bg-white border rounded-2xl p-6 shadow-sm mb-6 transition-colors duration-500 ${
                    focusedLogicRuleId === rule.id ? 'border-purple-400 ring-4 ring-purple-50' : 'border-gray-200'
                }`}
            >
              { }
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editRuleName}
                        onChange={(e) => setEditRuleName(e.target.value)}
                        className="h-8 w-48 text-lg font-semibold"
                        autoFocus
                        onBlur={() => setEditingRuleId(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateLogicRule(rule.id, { name: editRuleName });
                            setEditingRuleId(null);
                          }
                          if (e.key === 'Escape') setEditingRuleId(null);
                        }}
                      />
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          updateLogicRule(rule.id, { name: editRuleName });
                          setEditingRuleId(null);
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setEditingRuleId(null);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-2 cursor-text"
                      onClick={() => {
                        setEditRuleName(rule.name);
                        setEditingRuleId(rule.id);
                      }}
                    >
                      <span className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                        {rule.name}
                      </span>
                      <Edit2 className="w-4 h-4 text-gray-400 hover:text-purple-600 cursor-pointer transition-colors" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  { }
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => updateLogicRule(rule.id, { logicType: 'and' })}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        rule.logicType === 'and' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {t('builder.logic.and')}
                    </button>
                    <button
                      onClick={() => updateLogicRule(rule.id, { logicType: 'or' })}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        rule.logicType === 'or' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {t('builder.logic.or')}
                    </button>
                  </div>
                  { }
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('builder.logic.delete_condition')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              { }
              <div className="space-y-4">
                {rule.conditions.map((condition) => (
                  <div key={condition.id} className="relative">
                    { }
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex flex-col items-center relative -mt-1.5">
                        <span className="text-purple-600 text-sm font-medium mb-1">{t('builder.logic.if')}</span>
                        <div className="absolute top-[28px] left-1/2 ml-[-2px] w-6 h-10 border-l-[4px] border-b-[4px] border-purple-400 rounded-bl-2xl" />
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-purple-100" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Select
                            value={condition.fieldId}
                            onValueChange={(value) => updateRuleCondition(rule.id, condition.id, { fieldId: value })}
                          >
                            <SelectTrigger className="flex-1 bg-white border-gray-200">
                              <SelectValue placeholder={t('builder.logic.select_field')} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFields
                                .filter(f => {
                                  
                                  const actionTargetIds = rule.actions.map(a => a.fieldId);
                                  return !actionTargetIds.includes(f.id);
                                })
                                .map((f) => (
                                <SelectItem key={f.id} value={f.id}>{stripHtml(f.label || f.type)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {rule.conditions.length > 1 && (
                            <button
                              onClick={() => removeConditionFromRule(rule.id, condition.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex gap-2 pl-1">
                          <Select
                            value={condition.operator}
                            onValueChange={(value) => updateRuleCondition(rule.id, condition.id, { operator: value })}
                          >
                            <SelectTrigger className="w-40 bg-white border-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EQUALS">{t('builder.logic.op.equals')}</SelectItem>
                              <SelectItem value="NOT_EQUALS">{t('builder.logic.op.not_equals')}</SelectItem>
                              <SelectItem value="CONTAINS">{t('builder.logic.op.contains')}</SelectItem>
                              <SelectItem value="IS_EMPTY">{t('builder.logic.op.is_empty')}</SelectItem>
                              <SelectItem value="IS_NOT_EMPTY">{t('builder.logic.op.is_not_empty')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={condition.value}
                            onChange={(e) => updateRuleCondition(rule.id, condition.id, { value: e.target.value })}
                            placeholder={t('builder.logic.value_placeholder')}
                            className="flex-1 bg-white"
                            disabled={['IS_EMPTY', 'IS_NOT_EMPTY'].includes(condition.operator)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              { }
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => addConditionToRule(rule.id)}
                  className="w-8 h-8 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors text-white shadow-md"
                  title={t('builder.logic.add_condition')}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              { }
              <div className="flex flex-col items-center py-0.5 gap-1">
                <div className="w-[3px] h-6 bg-purple-400 rounded-full" />
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              </div>

              { }
              <div className="pt-4">
                <div className="text-gray-500 text-sm italic mb-4">{t('builder.logic.then')}</div>
                <div className="text-sm font-semibold text-gray-900 mb-3">{t('builder.logic.show_hide')}</div>
                
                <div className="space-y-3">
                  {rule.actions.map((action) => (
                    <div key={action.id} className="flex items-center gap-2">
                      <Select
                        value={action.type}
                        onValueChange={(value: 'show' | 'hide') => updateRuleAction(rule.id, action.id, { type: value })}
                      >
                        <SelectTrigger className={`w-28 ${action.type === 'show' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show">{t('builder.logic.action.show')}</SelectItem>
                          <SelectItem value="hide">{t('builder.logic.action.hide')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={action.fieldId}
                        onValueChange={(value) => updateRuleAction(rule.id, action.id, { fieldId: value })}
                      >
                        <SelectTrigger className="flex-1 bg-white border-gray-200">
                          <SelectValue placeholder={t('builder.logic.select_field')} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields
                            .filter(f => {
                              
                              if (rule.conditions.some(c => c.fieldId === f.id)) return false;
                              
                              
                              const otherActions = rule.actions.filter(a => a.id !== action.id);
                              if (otherActions.some(a => a.fieldId === f.id)) return false;
                              
                              return true;
                            })
                            .map((f) => (
                              <SelectItem key={f.id} value={f.id}>{stripHtml(f.label || f.type)}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {rule.actions.length > 1 && (
                        <button
                          onClick={() => removeActionFromRule(rule.id, action.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addActionToRule(rule.id)}
                  className="mt-3 text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {t('builder.logic.add_action')}
                </button>
              </div>
            </div>
          );
        })}

        { }
        {logicRules.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl text-sm text-blue-700 space-y-2">
            <p className="font-semibold">{t('builder.logic.how_it_works')}</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><strong>{t('builder.logic.how_show').split(':')[0]}:</strong>{t('builder.logic.how_show').split(':')[1]}</li>
                <li><strong>{t('builder.logic.how_hide').split(':')[0]}:</strong>{t('builder.logic.how_hide').split(':')[1]}</li>
                <li><strong>{t('builder.logic.how_and').split(':')[0]}:</strong>{t('builder.logic.how_and').split(':')[1]}</li>
                <li><strong>{t('builder.logic.how_or').split(':')[0]}:</strong>{t('builder.logic.how_or').split(':')[1]}</li>
            </ul>
          </div>
        )}

        <ConfirmDialog
          open={!!deleteRuleId}
          onOpenChange={(open) => !open && setDeleteRuleId(null)}
          title={t('builder.logic.delete_confirm')}
          description={t('builder.logic.delete_confirm_desc')}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
