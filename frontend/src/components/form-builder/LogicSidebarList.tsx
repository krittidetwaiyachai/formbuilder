import { useState } from 'react';
import { useFormStore } from '@/store/formStore';
import { Edit2, Check, GitBranch, X, Trash2, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

export default function LogicSidebarList() {
  const { t } = useTranslation();
  const { currentForm, updateLogicRule, deleteLogicRule, focusedLogicRuleId, setFocusedLogicRuleId } = useFormStore();
  const logicRules = currentForm?.logicRules || [];
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const getFieldLabel = (fieldId: string) => {
    const field = currentForm?.fields?.find(f => f.id === fieldId);
    return field?.label || field?.type || 'Unknown';
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    updateLogicRule(id, { name: editName });
    setEditingId(null);
  };

  if (logicRules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500">
        <GitBranch className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">{t('builder.logic.no_conditions')}</p>
        <p className="text-xs mt-1">{t('builder.logic.sidebar_subtitle')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{t('builder.logic.sidebar_title')}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {logicRules.length} {t('builder.logic.rules_count_label')}
        </span>
      </div>

      <div className="space-y-3">
        {logicRules.map((rule) => {
          const isEditing = editingId === rule.id;
          const isSelected = focusedLogicRuleId === rule.id;
          const conditionCount = rule.conditions.length;
          const actionCount = rule.actions.length;

          return (
            <div
              key={rule.id}
              className={`border rounded-xl overflow-hidden transition-all ${
                isSelected ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div
                onClick={() => setFocusedLogicRuleId(isSelected ? null : rule.id)}
                className="flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-purple-500' : 'bg-gray-300'}`} />
                  
                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1 relative z-10" onClick={e => e.stopPropagation()}>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 text-sm bg-white shadow-sm"
                        autoFocus
                        onBlur={() => handleSaveEdit(rule.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(rule.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button
                        onClick={() => handleSaveEdit(rule.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                        className="flex items-center gap-2 flex-1 min-w-0 cursor-text hover:bg-gray-100 rounded px-1 -ml-1 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(rule.id, rule.name);
                        }}
                        title={rule.name}
                    >
                      <span className="font-medium text-sm text-gray-900 break-words flex-1 leading-tight">
                        {rule.name}
                      </span>
                      <Edit2 className="w-3 h-3 text-gray-400 hover:text-purple-600 cursor-pointer transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mr-1">
                        <span>{conditionCount} {t('builder.logic.if').toUpperCase()}</span>
                        <span>•</span>
                        <span>{actionCount} {t('builder.logic.then').toUpperCase()}</span>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(t('builder.logic.delete_confirm'))) {
                                deleteLogicRule(rule.id);
                            }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Rule"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Expand/Collapse Icon */}
                    <div className={`text-gray-400 transition-transform duration-200 ${isSelected ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
              </div>

              {isSelected && (
                <div className="px-3 pb-3 border-t border-gray-100">
                  <div className="pt-2 space-y-3">
                    {/* Conditions */}
                    <div>
                        <div className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">{t('builder.logic.conditions')} ({rule.logicType})</div>
                        <div className="space-y-1">
                            {rule.conditions.map((cond) => (
                                <div key={cond.id} className="text-xs text-gray-600 bg-gray-50 rounded p-1.5 flex flex-wrap gap-1 items-center">
                                    <span className="font-medium text-purple-600">{t('builder.logic.if').toUpperCase()}</span>
                                    <span>{getFieldLabel(cond.fieldId)}</span>
                                    <span className="text-gray-400">{t(`builder.logic.op.${cond.operator.toLowerCase()}`)}</span>
                                    <span className="font-medium">"{cond.value}"</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div>
                        <div className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">{t('builder.logic.actions')}</div>
                        <div className="space-y-1">
                            {rule.actions.map((action) => (
                                <div key={action.id} className="text-xs text-gray-600 bg-gray-50 rounded p-1.5 flex flex-wrap gap-1 items-center">
                                    <span className={`font-medium ${action.type === 'show' ? 'text-green-600' : 'text-red-500'}`}>
                                        {t(`builder.logic.action.${action.type.toLowerCase()}`).toUpperCase()}
                                    </span>
                                    <span>{getFieldLabel(action.fieldId)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          {t('builder.logic.click_expand')}
        </p>
      </div>
    </div>
  );
}
