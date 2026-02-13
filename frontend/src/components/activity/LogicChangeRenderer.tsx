import { Filter, ArrowDownUp, Zap, Plus, GitBranch, Activity, ArrowRight, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getOperatorLabel, getActionLabelType } from './utils';
import { LogicChanges, LogicRuleChange, ChangeItem, LogicCondition, LogicAction } from './types';

interface LogicChangeRendererProps {
    logicRules?: LogicChanges;
    fieldLabels: Record<string, string>;
}

export default function LogicChangeRenderer({ logicRules, fieldLabels }: LogicChangeRendererProps) {
    const { t, i18n } = useTranslation();

    const renderRuleContent = (rule: LogicRuleChange | Partial<LogicRuleChange>, isDeleted: boolean = false) => {
        const conditions = rule.conditions || [];
        const actions = rule.actions || [];
        const logicType = rule.logicType || 'ALL'; 
    
        return (
          <div className={`space-y-3 p-3 bg-white rounded-xl border ${isDeleted ? 'border-rose-100 bg-rose-50/20' : 'border-indigo-100 shadow-sm'} transition-all`}>
            {}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isDeleted ? 'bg-rose-100 text-rose-700' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'}`}>
                  {t('activity.logic.if')}
                </div>
                {conditions.length > 0 && (
                  <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-tight">
                    {logicType === 'and' || logicType === 'ALL' ? t('activity.logic.match_all') : t('activity.logic.match_any')}
                  </span>
                )}
              </div>
              <div className="grid gap-1.5 pl-2 border-l-2 border-indigo-50">
                {conditions.map((c: LogicCondition, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-700">
                    <Filter className={`w-3 h-3 ${isDeleted ? 'text-rose-400' : 'text-indigo-400'}`} />
                    <span className="font-semibold text-gray-900">{fieldLabels[c.fieldId] || 'none'}</span>
                    <span className="text-gray-500">{getOperatorLabel(c.operator, t, i18n)}</span>
                    {c.value !== undefined && c.value !== null && c.value !== '' && (
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-medium text-gray-800">
                        "{String(c.value)}"
                      </span>
                    )}
                    {idx < conditions.length - 1 && (
                      <span className="ml-1 text-[9px] font-bold text-indigo-300 uppercase">{logicType === 'and' || logicType === 'ALL' ? t('activity.logic.and') : t('activity.logic.or')}</span>
                    )}
                  </div>
                ))}
                {conditions.length === 0 && <span className="text-[11px] text-gray-400 italic">{t('activity.logic.no_conditions')}</span>}
              </div>
            </div>
    
            {}
            <div className="flex justify-center -my-1">
              <ArrowDownUp className={`w-4 h-4 ${isDeleted ? 'text-rose-200' : 'text-indigo-200'}`} />
            </div>
    
            {}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isDeleted ? 'bg-rose-100 text-rose-700' : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm'}`}>
                  {t('activity.logic.then')}
                </div>
              </div>
              <div className="grid gap-1.5 pl-2 border-l-2 border-indigo-50">
                {actions.map((a: LogicAction, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-700">
                    <Zap className={`w-3 h-3 ${isDeleted ? 'text-rose-400' : 'text-purple-400'}`} />
                    <span className="font-bold text-indigo-700 italic">{getActionLabelType(a.type, t, i18n)}</span>
                    <span className="font-semibold text-gray-900">{fieldLabels[a.fieldId] || 'none'}</span>
                  </div>
                ))}
                {actions.length === 0 && <span className="text-[11px] text-gray-400 italic">{t('activity.logic.no_actions')}</span>}
              </div>
            </div>
          </div>
        );
    };

    if (!logicRules) return null;
    const { added, deleted, updated } = logicRules;
    const hasAnyLogicChanges = (added?.length || 0) + (deleted?.length || 0) + (updated?.length || 0) > 0;
    if (!hasAnyLogicChanges) return null;

    return (
        <div className="space-y-6 mt-4 border-t border-gray-100 pt-6">
            {}
            {added && added.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 rounded-lg">
                            <Plus className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{t('activity.logic.new_added')}</h3>
                    </div>
                    <div className="grid gap-4">
                        {added.map((r: LogicRuleChange, i: number) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center gap-1.5 px-1">
                                    <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-xs font-bold text-gray-800">{r.name || t('activity.logic.untitled')}</span>
                                </div>
                                {renderRuleContent(r)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {}
            {updated && updated.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-50 rounded-lg">
                            <Activity className="w-4 h-4 text-amber-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{t('activity.logic.updated')}</h3>
                    </div>
                    <div className="grid gap-6">
                        {updated.map((r: LogicRuleChange, i: number) => {
                            const conditionChange = r.changes.find((c: ChangeItem) => c.property === 'conditions');
                            const actionChange = r.changes.find((c: ChangeItem) => c.property === 'actions');
                            const typeChange = r.changes.find((c: ChangeItem) => c.property === 'logicType');
                            const nameChange = r.changes.find((c: ChangeItem) => c.property === 'name');
                            
                            return (
                                <div key={i} className="space-y-3">
                                    <div className="flex items-center gap-1.5 px-1">
                                        <GitBranch className="w-3.5 h-3.5 text-amber-500" />
                                        {nameChange ? (
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="font-bold text-gray-400 line-through">{String(nameChange.before)}</span>
                                                <ArrowRight className="w-3 h-3 text-amber-500" />
                                                <span className="font-bold text-gray-800">{String(nameChange.after)}</span>
                                                <span className="text-[10px] text-amber-600 font-medium px-1.5 py-0.5 bg-amber-50 rounded bg-opacity-50 ml-1">{t('activity.logic.renamed')}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-gray-800">{r.name}</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-4 items-center">
                                        <div className="w-full flex-1 opacity-60 scale-95 origin-left">
                                            <div className="text-[10px] font-bold text-gray-400 mb-1 uppercase text-center">{t('activity.logic.before')}</div>
                                            {renderRuleContent({
                                                conditions: conditionChange ? (conditionChange.before as LogicCondition[]) : r.originalConditions || [],
                                                actions: actionChange ? (actionChange.before as LogicAction[]) : r.originalActions || [],
                                                logicType: typeChange ? (typeChange.before as string) : r.originalType || 'ALL'
                                            }, false)}
                                        </div>
                                        <div className="bg-amber-100 p-2 rounded-full hidden md:block">
                                            <ArrowRight className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div className="w-full flex-1">
                                            <div className="text-[10px] font-bold text-indigo-600 mb-1 uppercase text-center">{t('activity.logic.after')}</div>
                                            {renderRuleContent({
                                                conditions: conditionChange ? (conditionChange.after as LogicCondition[]) : r.conditions || [],
                                                actions: actionChange ? (actionChange.after as LogicAction[]) : r.actions || [],
                                                logicType: typeChange ? (typeChange.after as string) : r.logicType || 'ALL'
                                            }, false)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {}
            {deleted && deleted.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-rose-50 rounded-lg">
                            <Trash2 className="w-4 h-4 text-rose-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{t('activity.logic.deleted')}</h3>
                    </div>
                    <div className="grid gap-4">
                        {deleted.map((r: LogicRuleChange, i: number) => (
                            <div key={i} className="space-y-2 opacity-75">
                                <div className="flex items-center gap-1.5 px-1">
                                    <GitBranch className="w-3.5 h-3.5 text-rose-400" />
                                    <span className="text-xs font-bold text-gray-500 line-through">{r.name || t('activity.logic.untitled')}</span>
                                </div>
                                {renderRuleContent(r, true)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
