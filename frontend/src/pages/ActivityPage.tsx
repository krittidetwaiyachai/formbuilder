import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { stripHtml } from '@/lib/ui/utils';
import { ArrowLeft, Clock, Edit3, Trash2, Plus, ArrowRight, Activity, ChevronLeft, ChevronRight, ArrowDownUp, ChevronDown, ArrowUp, GitBranch, Zap, Filter, User } from 'lucide-react';
import api from '@/lib/api';

import Loader from '@/components/common/Loader';
import UserAvatar from '@/components/common/UserAvatar';

interface ActivityLog {
  id: string;
  action: string;
  details: any;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
  };
}

import { useTranslation } from "react-i18next";

export default function ActivityPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState('');
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({});
  
  // Pagination & Sort & Search State
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [editors, setEditors] = useState<Array<{id: string, firstName: string, lastName: string, email: string, photoUrl?: string}>>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUserFilterOpen, setIsUserFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Custom Smooth Scroll
  const scrollToTop = () => {
    const duration = 1000; // Slower, smoother animation (1s)
    const start = window.scrollY;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function: easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      
      window.scrollTo(0, start * (1 - ease));

      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  // Scroll to top listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch editors on mount
  useEffect(() => {
    const fetchEditors = async () => {
      try {
        const res = await api.get(`/forms/${id}/activity/editors`);
        setEditors(res.data || []);
      } catch (error) {
        console.error('Failed to load editors:', error);
      }
    };
    if (id) {
      fetchEditors();
    }
  }, [id]);

  useEffect(() => {
    loadActivity();
  }, [id, page, sort, actionFilter, userFilter]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const formRes = await api.get(`/forms/${id}`);
      const formData = formRes.data.form || formRes.data;
      setFormTitle(formData.title || '');
      
      if (formData.fields) {
        const labels: Record<string, string> = {};
        formData.fields.forEach((f: any) => {
           labels[f.id] = f.label || 'Untitled';
        });
        setFieldLabels(labels);
      }

      const res = await api.get(`/forms/${id}/activity`, {
        params: { 
            page, 
            limit, 
            sort, 
            action: actionFilter,
            userId: userFilter || undefined
        }
      });
      
      const responseData = res.data;
      if (responseData.data && responseData.meta) {
        setLogs(responseData.data);
        setTotalPages(responseData.meta.totalPages);
      } else {
        // Fallback for old API if needed
        setLogs(Array.isArray(responseData) ? responseData : []);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldTypeName = (type: string) => {
    return t(`activity.field_type.${type.toLowerCase()}`) || type.replace(/_/g, ' ');
  };

  const getPropertyLabel = (property: string) => {
    // Handle dot notation (e.g., "multiple.enabled" → "Multiple: Enabled")
    if (property.includes('.')) {
      const parts = property.split('.');
      return parts.map(p => {
        return t(`activity.property.${p}`) || p.charAt(0).toUpperCase() + p.slice(1);
      }).join(': ');
    }
    
    return t(`activity.property.${property}`) || property.charAt(0).toUpperCase() + property.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(i18n.language === 'th' ? 'th-TH' : 'en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return <span className="text-gray-300 italic">{t('activity.values.empty')}</span>;
    if (typeof val === 'boolean') return val ? <span className="text-emerald-600 font-medium">{t('activity.values.enable')}</span> : <span className="text-gray-500">{t('activity.values.disable')}</span>;
    
    if (typeof val === 'object') {
      if (Array.isArray(val)) {
        if (val.length === 0) return <span className="text-gray-300 italic">{t('activity.values.empty')}</span>;
        // Check if first item looks like an option object (has label or value)
        if (val[0] && typeof val[0] === 'object' && ('label' in val[0] || 'value' in val[0])) {
          return (
            <div className="flex flex-wrap gap-1">
              {val.map((opt: any, i: number) => {
                const display = opt?.label ?? opt?.value ?? (typeof opt === 'object' ? JSON.stringify(opt) : opt);
                return (
                  <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    {typeof display === 'object' ? t('activity.values.invalid') : display}
                  </span>
                );
              })}
            </div>
          );
        }
        return <span className="text-xs text-gray-600">{val.length} {t('activity.values.items')}</span>;
      }
      
      if (val.items && Array.isArray(val.items)) {
        return (
          <div className="flex flex-wrap gap-1">
            {val.items.map((opt: any, i: number) => {
               const display = opt?.label ?? opt?.value ?? (typeof opt === 'object' ? JSON.stringify(opt) : opt);
               return (
                <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                  {typeof display === 'object' ? t('activity.values.invalid') : display}
                </span>
               );
            })}
            {val.subLabel && (
              <span className="text-xs text-gray-500 italic">({val.subLabel})</span>
            )}
          </div>
        );
      }
      
      const entries = Object.entries(val).filter(([k, v]) => v !== null && v !== undefined && v !== '' && k !== 'items');
      if (entries.length === 0) return <span className="text-gray-300 italic">{t('activity.values.empty')}</span>;
      
      return (
        <div className="space-y-0.5">
          {entries.map(([key, value]: [string, any], i: number) => {
            const readableKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
            
            return (
              <div key={i} className="text-xs">
                <span className="text-gray-500">{readableKey}:</span>{' '}
                <span className="text-gray-700 font-medium">
                  {typeof value === 'boolean' ? (value ? t('activity.values.enable') : t('activity.values.disable')) : String(value)}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    
    return stripHtml(String(val));
  };

  const getOperatorLabel = (operator: string) => {
    return t(`activity.operator.${operator}`) || operator.replace(/_/g, ' ');
  };

  const getActionLabelType = (type: string) => {
    return t(`activity.action.${type.toLowerCase()}`) || type;
  };

  const renderRuleContent = (rule: any, isDeleted: boolean = false) => {
    const conditions = rule.conditions || [];
    const actions = rule.actions || [];
    const logicType = rule.logicType || 'ALL'; // ALL (AND), ANY (OR)

    return (
      <div className={`space-y-3 p-3 bg-white rounded-xl border ${isDeleted ? 'border-rose-100 bg-rose-50/20' : 'border-indigo-100 shadow-sm'} transition-all`}>
        {/* IF SECTION */}
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
            {conditions.map((c: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-700">
                <Filter className={`w-3 h-3 ${isDeleted ? 'text-rose-400' : 'text-indigo-400'}`} />
                <span className="font-semibold text-gray-900">{fieldLabels[c.fieldId] || 'none'}</span>
                <span className="text-gray-500">{getOperatorLabel(c.operator)}</span>
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

        {/* FLOW ARROW */}
        <div className="flex justify-center -my-1">
          <ArrowDownUp className={`w-4 h-4 ${isDeleted ? 'text-rose-200' : 'text-indigo-200'}`} />
        </div>

        {/* THEN SECTION */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isDeleted ? 'bg-rose-100 text-rose-700' : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm'}`}>
              {t('activity.logic.then')}
            </div>
          </div>
          <div className="grid gap-1.5 pl-2 border-l-2 border-indigo-50">
            {actions.map((a: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-700">
                <Zap className={`w-3 h-3 ${isDeleted ? 'text-rose-400' : 'text-purple-400'}`} />
                <span className="font-bold text-indigo-700 italic">{getActionLabelType(a.type)}</span>
                <span className="font-semibold text-gray-900">{fieldLabels[a.fieldId] || 'none'}</span>
              </div>
            ))}
            {actions.length === 0 && <span className="text-[11px] text-gray-400 italic">No actions defined</span>}
          </div>
        </div>
      </div>
    );
  };

  const renderLogicChanges = (logicRules: any) => {
    if (!logicRules) return null;
    const { added, deleted, updated } = logicRules;
    const hasAnyLogicChanges = (added?.length || 0) + (deleted?.length || 0) + (updated?.length || 0) > 0;
    if (!hasAnyLogicChanges) return null;

    return (
      <div className="space-y-6 mt-4 border-t border-gray-100 pt-6">
        {/* ADDED */}
        {added?.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <Plus className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{t('activity.logic.new_added')}</h3>
            </div>
            <div className="grid gap-4">
              {added.map((r: any, i: number) => (
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

        {/* UPDATED */}
        {updated?.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 rounded-lg">
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{t('activity.logic.updated')}</h3>
            </div>
            <div className="grid gap-6">
              {updated.map((r: any, i: number) => {
                // Find before/after for conditions/actions if they exist in changes
                const conditionChange = r.changes.find((c: any) => c.property === 'conditions');
                const actionChange = r.changes.find((c: any) => c.property === 'actions');
                const typeChange = r.changes.find((c: any) => c.property === 'logicType');
                
                const nameChange = r.changes.find((c: any) => c.property === 'name');
                
                return (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-1.5 px-1">
                      <GitBranch className="w-3.5 h-3.5 text-amber-500" />
                      {nameChange ? (
                         <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-gray-400 line-through">{nameChange.before}</span>
                            <ArrowRight className="w-3 h-3 text-amber-500" />
                            <span className="font-bold text-gray-800">{nameChange.after}</span>
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
                            conditions: conditionChange ? conditionChange.before : r.originalConditions || [],
                            actions: actionChange ? actionChange.before : r.originalActions || [],
                            logicType: typeChange ? typeChange.before : r.originalType || 'ALL'
                          }, false)}
                       </div>
                       <div className="bg-amber-100 p-2 rounded-full hidden md:block">
                          <ArrowRight className="w-4 h-4 text-amber-600" />
                       </div>
                       <div className="w-full flex-1">
                          <div className="text-[10px] font-bold text-indigo-600 mb-1 uppercase text-center">{t('activity.logic.after')}</div>
                          {renderRuleContent({
                            conditions: conditionChange ? conditionChange.after : r.conditions || [],
                            actions: actionChange ? actionChange.after : r.actions || [],
                            logicType: typeChange ? typeChange.after : r.logicType || 'ALL'
                          }, false)}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DELETED */}
        {deleted?.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 rounded-lg">
                <Trash2 className="w-4 h-4 text-rose-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{t('activity.logic.deleted')}</h3>
            </div>
            <div className="grid gap-4">
              {deleted.map((r: any, i: number) => (
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
  };

  const renderChanges = (log: ActivityLog) => {
    const details = log.details || {};
    
    // Custom Formatter for Quiz/Settings Values
    const formatDiffValue = (key: string, val: any) => {
      if (key === 'releaseScoreMode') {
          const v = val || 'immediately';
          if (v === 'immediately') return <span>{t('activity.values.immediately')}</span>;
          if (v === 'manual') return <span>{t('activity.values.manual')}</span>;
      }
      const quizToggles = ['showScore', 'showAnswer', 'allowViewMissedQuestions', 'showDetail', 'showExplanation', 'shuffleQuestions', 'requireSignIn'];
      if (quizToggles.includes(key)) {
           // Treat null/undefined as false (Disable)
           const boolVal = !!val;
           return boolVal ? <span className="text-emerald-700 font-medium">{t('activity.values.enable')}</span> : <span className="text-gray-500 font-medium">{t('activity.values.disable')}</span>;
      }
      return formatValue(val);
    };

    const { addedFields, deletedFields, updatedFields, changes, logicChanges } = details;

    const hasFieldChanges = addedFields?.length > 0 || deletedFields?.length > 0 || updatedFields?.length > 0;
    const hasLogicChanges = (logicChanges?.added?.length || 0) + (logicChanges?.deleted?.length || 0) + (logicChanges?.updated?.length || 0) > 0;
    const hasGeneralChanges = changes?.filter((c: string) => c !== 'fields' && c !== 'logic').length > 0;

    if (!hasFieldChanges && !hasGeneralChanges && !hasLogicChanges) return null;
    
    // Helper to check if a change is boolean toggle
    const isBooleanToggle = (before: any, after: any) => {
      return typeof before === 'boolean' && typeof after === 'boolean';
    };
    
    // Helper to check if a property is a string-based toggle (like width, align)
    const isStringToggle = (property: string, before: any, after: any) => {
      const prop = property.split('.').pop()?.toLowerCase();
      const isStringValue = typeof before === 'string' || typeof after === 'string' || typeof before === 'number' || typeof after === 'number';
      const toggleProps = ['size', 'width', 'height', 'align', 'variant', 'position', 'shrink', 'labelalign', 'labelalignment', 'textalign', 'textalignment', 'alignment', 'inputalign', 'inputalignment', 'columns', 'theme', 'layout', 'direction', 'orientation', 'color', 'background', 'radius', 'border', 'shadow', 'editormode'];
      return toggleProps.includes(prop || '') && (isStringValue || typeof before === 'undefined');
    };

    const isVisible = (section: 'added' | 'deleted' | 'updated' | 'settings') => {
        if (actionFilter === 'ALL') return true;
        if (actionFilter === 'CREATED' && section === 'added') return true;
        if (actionFilter === 'DELETED' && section === 'deleted') return true;
        if (actionFilter === 'UPDATED' && (section === 'updated' || section === 'settings')) return true;
        return false;
    };

    return (
      <div className="mt-3 space-y-3">
        {/* Added Fields */}
        {addedFields?.length > 0 && isVisible('added') && (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 inline-flex items-center gap-1">
               <Plus className="w-3 h-3" /> {t('activity.changes.added_fields', { count: addedFields.length })}
            </div>
            <div className="flex flex-wrap gap-2">
              {addedFields.map((f: any, i: number) => {
                const groupName = f.groupId ? fieldLabels[f.groupId] : null;
                return (
                  <div key={i} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                    <span className="text-xs font-medium text-gray-700">{typeof f.label === 'string' ? stripHtml(f.label) : 'Untitled'}</span>
                    {groupName && <span className="text-[10px] text-gray-500 bg-gray-50 px-1 rounded">{t('activity.changes.in_group', { group: groupName })}</span>}
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded uppercase tracking-wider">
                      {typeof f.type === 'string' ? getFieldTypeName(f.type) : 'FIELD'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Deleted Fields */}
        {deletedFields?.length > 0 && isVisible('deleted') && (
          <div className="space-y-4">
             <div className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 inline-flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> {t('activity.changes.deleted_fields', { count: deletedFields.length })}
             </div>
             <div className="flex flex-wrap gap-2">
              {deletedFields.map((f: any, i: number) => {
                const groupName = f.groupId ? fieldLabels[f.groupId] : null;
                return (
                  <div key={i} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-red-100 shadow-sm opacity-75">
                    <span className="text-xs font-medium text-gray-700 line-through decoration-red-300">{typeof f.label === 'string' ? stripHtml(f.label) : 'Untitled'}</span>
                    {groupName && <span className="text-[10px] text-gray-500 bg-gray-50 px-1 rounded">{t('activity.changes.from_group', { group: groupName })}</span>}
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded uppercase tracking-wider">
                      {typeof f.type === 'string' ? getFieldTypeName(f.type) : 'FIELD'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ... (unchanged) ... */}

        {/* Updated Fields - DETAILED TABLE VIEW */}
        {updatedFields?.length > 0 && isVisible('updated') && (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 inline-flex items-center gap-1">
               <Edit3 className="w-3 h-3" /> {t('activity.changes.updated_fields')}
            </div>
            
            <div className="space-y-4">
              {updatedFields.map((f: any, i: number) => {
                 const groupName = f.groupId ? fieldLabels[f.groupId] : null;
                 return (
                  <div key={i} className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50">
                      <span className="font-semibold text-sm text-gray-900">{typeof f.label === 'string' || typeof f.label === 'number' ? stripHtml(String(f.label)) : 'Untitled'}</span>
                      {groupName && <span className="text-[10px] text-gray-500 bg-gray-50 px-1 rounded">{t('activity.changes.in_group', { group: groupName })}</span>}
                      {f.type && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 tracking-wide">
                          {getFieldTypeName(f.type)}
                        </span>
                      )}
                    </div>

                  <div className="space-y-1">
                    {f.changes.map((c: any, idx: number) => {
                       const propName = getPropertyLabel(c.property);
                       
                       // Handle special defaults
                       let beforeValue = c.before;
                       if (c.property === 'stateInputType' && !beforeValue) {
                           beforeValue = 'text';
                       }
                       // Handle 'rows' default (Visible Options)
                       if (c.property === 'rows' && !beforeValue) {
                           beforeValue = 4;
                       }
                       // Handle 'customWidth' default
                       if (c.property === 'customWidth' && !beforeValue) {
                           beforeValue = 300;
                       }
                       // Handle 'separator' default
                       if ((c.property === 'validation.separator' || c.property === 'separator') && !beforeValue) {
                           beforeValue = '/';
                       }
                       // Handle 'dateFormat' default
                       if ((c.property === 'validation.dateFormat' || c.property === 'dateFormat') && !beforeValue) {
                           beforeValue = 'MM-DD-YYYY';
                       }
                       // Handle 'timeFormat' default
                       if ((c.property === 'validation.timeFormat' || c.property === 'timeFormat') && !beforeValue) {
                           beforeValue = 'AM/PM';
                       }
                       // Handle 'minimumAge' default
                       if ((c.property === 'validation.minimumAge' || c.property === 'minimumAge') && !beforeValue) {
                           beforeValue = 18;
                       }
                       // Handle 'allowPast' / 'allowFuture' default
                       if (['validation.allowPast', 'allowPast', 'validation.allowFuture', 'allowFuture'].includes(c.property) && beforeValue === undefined) {
                           beforeValue = true;
                       }
                       // Handle 'limitTime' default
                       if ((c.property === 'validation.limitTime' || c.property === 'limitTime') && !beforeValue) {
                           beforeValue = 'BOTH';
                       }
                       // Handle 'Rating Icon' default
                       if (c.property === 'icon' && !beforeValue) {
                           beforeValue = 'star';
                       }
                       // Handle 'Rating Amount' default
                       if (c.property === 'maxRating' && !beforeValue) {
                           beforeValue = 5;
                       }
                       // Handle 'Max Length' default
                       if ((c.property === 'validation.maxLength' || c.property === 'maxLength') && !beforeValue) {
                           beforeValue = 100;
                       }
                       // Handle 'Header Image Position' default
                       if ((c.property === 'validation.imagePosition' || c.property === 'imagePosition') && !beforeValue) {
                           beforeValue = 'CENTER';
                       }

                       // Hide 'items' as per user request? NO, user wants to see adds/changes.
                       // Backend now filters out reordering noise. Only real content changes will reach here.
                       
                       // Handle 'groupId' (Move)
                       if (c.property === 'groupId') {
                           const groupNameBefore = beforeValue ? fieldLabels[String(beforeValue)] : 'Canvas';
                           const groupNameAfter = c.after ? fieldLabels[String(c.after)] : 'Canvas';

                           return (
                             <div key={idx} className="flex items-center gap-1.5 text-xs">
                               <span className="text-gray-500 font-medium whitespace-nowrap">{t('activity.changes.location')}</span>
                               <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200 whitespace-nowrap">
                                  {beforeValue ? <span>{t('activity.changes.from_group', { group: groupNameBefore })}</span> : 'Canvas'}
                               </div>
                               <ArrowRight className="w-3 h-3 text-gray-300" />
                               <div className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 whitespace-nowrap font-medium">
                                  {c.after ? <span>{t('activity.changes.in_group', { group: groupNameAfter })}</span> : 'Canvas'}
                               </div>
                             </div>
                           );
                       }
                       
                       // Hide 'items' as per user request? NO, user wants to see adds/changes.
                       // Backend now filters out reordering noise. Only real content changes will reach here.
                       // if (c.property === 'items') return null;

                       
                       return (
                           <div key={idx} className="flex items-center gap-1.5 text-xs">
                           <span className="text-gray-500 font-medium whitespace-nowrap">{propName}</span>
                           {isBooleanToggle(beforeValue, c.after) ? (
                             // Boolean toggle display (Enabled/Disabled)
                             <>
                               <div className={`px-2 py-1 rounded border whitespace-nowrap ${beforeValue ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500'}`}>
                                 {beforeValue ? t('activity.values.enable') : t('activity.values.disable')}
                               </div>
                               <ArrowRight className="w-3 h-3 text-gray-300" />
                               <div className={`px-2 py-1 rounded border whitespace-nowrap font-medium ${c.after ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500'}`}>
                                 {c.after ? t('activity.values.enable') : t('activity.values.disable')}
                               </div>
                             </>
                           ) : isStringToggle(c.property, beforeValue, c.after) ? (
                             // String/Enum toggle display (FIXED/AUTO, LEFT/CENTER/RIGHT, etc.)
                             <>
                               <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200 whitespace-nowrap">
                                 {typeof beforeValue === 'string' || typeof beforeValue === 'number' ? beforeValue : (c.property.toLowerCase().includes('editormode') ? 'PLAIN_TEXT' : 'Auto')}
                               </div>
                               <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                               <div className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-medium">
                                 {typeof c.after === 'string' || typeof c.after === 'number' ? c.after : (c.property.toLowerCase().includes('editormode') ? 'PLAIN_TEXT' : 'Auto')}
                               </div>
                             </>
                           ) : (
                             // Normal before/after display
                             <>
                               <div className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 line-through opacity-75 break-words min-w-0" title={String(beforeValue)}>
                                 {formatValue(beforeValue)}
                               </div>
                               <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                               <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 font-medium break-words min-w-0" title={String(c.after)}>
                                 {formatValue(c.after)}
                               </div>
                             </>
                           )}
                         </div>
                       );
                    })}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* General Settings */}
        {/* General Settings */}
        {(() => {
          // Pre-filter to ensure we only have REAL changes
          const rawChanges = details.settingsChanges?.filter((c: any) => c.before != c.after) || [];
          
          const renderableChanges = rawChanges.filter((change: any) => {
             const isObjectDiff = typeof change.before === 'object' && change.before !== null && !Array.isArray(change.before) &&
                                  typeof change.after === 'object' && change.after !== null && !Array.isArray(change.after);
             
             if (isObjectDiff) {
                const allKeys = Array.from(new Set([...Object.keys(change.before), ...Object.keys(change.after)]));
                const diffKeys = allKeys.filter(key => {
                    const vBefore = change.before[key];
                    const vAfter = change.after[key];
                    const isEmpty = (v: any) => v === null || v === undefined || v === '';
                    if (isEmpty(vBefore) && isEmpty(vAfter)) return false;
                    return vBefore !== vAfter;
                });
                return diffKeys.length > 0;
             }
             return true; // Simple value changes are always relevant if filter passed
          });

          if (renderableChanges.length === 0 || !isVisible('updated')) return null;

          return (
            <div className="space-y-4">
                            <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 inline-flex items-center gap-1">
                               <Zap className="w-3 h-3" /> {t('activity.changes.settings_updated')}
                            </div>
            
            <div className="bg-slate-50 rounded-md p-3 border border-slate-100 space-y-1">
              {renderableChanges.map((change: any, i: number) => {
                 const isObjectDiff = typeof change.before === 'object' && change.before !== null && !Array.isArray(change.before) &&
                                      typeof change.after === 'object' && change.after !== null && !Array.isArray(change.after);

                 if (isObjectDiff) {
                    const allKeys = Array.from(new Set([...Object.keys(change.before), ...Object.keys(change.after)]));
                    const diffKeys = allKeys.filter(key => {
                        const vBefore = change.before[key];
                        const vAfter = change.after[key];
                        const isEmpty = (v: any) => v === null || v === undefined || v === '';
                        if (isEmpty(vBefore) && isEmpty(vAfter)) return false;
                        return vBefore !== vAfter;
                    });

                    // Should theoretically not happen due to pre-filter, but kept for safety
                    if (diffKeys.length === 0) return null;

                    return (
                        <div key={i} className="flex flex-col gap-1.5 text-xs border-b border-gray-100 last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
                           <span className="text-gray-500 font-medium whitespace-nowrap mb-1">{getPropertyLabel(change.property)}</span>
                           <div className="pl-2 border-l-2 border-gray-200 space-y-1.5">
                               {diffKeys.map(key => {
                                   const beforeVal = change.before[key];
                                   const afterVal = change.after[key];
                                   const isBool = typeof beforeVal === 'boolean' || typeof afterVal === 'boolean';
                                   
                                   return (
                                   <div key={key} className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider min-w-[80px]">{getPropertyLabel(key)}</span>
                                      
                                      {isBool ? (
                                        <>
                                            <div className={`px-1.5 py-0.5 rounded border whitespace-nowrap text-[11px] ${beforeVal ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500'}`}>
                                               {beforeVal ? t('activity.values.enable') : t('activity.values.disable')}
                                            </div>
                                            <ArrowRight className="w-3 h-3 text-gray-300" />
                                            <div className={`px-1.5 py-0.5 rounded border whitespace-nowrap font-medium text-[11px] ${afterVal ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500'}`}>
                                               {afterVal ? t('activity.values.enable') : t('activity.values.disable')}
                                            </div>
                                         </>
                                      ) : (
                                        <>
                                          <div className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100 line-through opacity-75 text-[11px]">
                                              {formatDiffValue(key, beforeVal)}
                                          </div>
                                          <ArrowRight className="w-3 h-3 text-gray-300" />
                                          <div className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-medium text-[11px]">
                                              {formatDiffValue(key, afterVal)}
                                          </div>
                                        </>
                                      )}
                                   </div>
                                   );
                               })}
                           </div>
                        </div>
                    );
                 }

                 return (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                   <span className="text-gray-500 font-medium whitespace-nowrap">{getPropertyLabel(change.property)}</span>
                   {isBooleanToggle(change.before, change.after) ? (
                      <>
                        <div className={`px-2 py-1 rounded border whitespace-nowrap ${change.before ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500'}`}>
                          {change.before ? t('activity.values.enable') : t('activity.values.disable')}
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                        <div className={`px-2 py-1 rounded border whitespace-nowrap font-medium ${change.after ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500'}`}>
                          {change.after ? t('activity.values.enable') : t('activity.values.disable')}
                        </div>
                      </>
                   ) : isStringToggle(change.property, change.before, change.after) ? (
                      <>
                        <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200 break-words min-w-0">
                            {typeof change.before === 'string' || typeof change.before === 'number' ? change.before : 'Auto'}
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                        <div className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-medium break-words min-w-0">
                            {typeof change.after === 'string' || typeof change.after === 'number' ? change.after : 'Auto'}
                        </div>
                      </>
                   ) : (
                     <>
                       <div className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 line-through opacity-75 break-words min-w-0" title={String(change.before)}>
                         {formatValue(change.before)}
                       </div>
                       <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                       <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 font-medium break-words min-w-0" title={String(change.after)}>
                         {formatValue(change.after)}
                       </div>
                     </>
                   )}
                </div>
              );
              })}
            </div>
          </div>
        );
      })()}
        
        {/* Fallback: Show simple pills if no settingsChanges but changes exist */}
        {hasGeneralChanges && (!details.settingsChanges || details.settingsChanges.length === 0) && (
          <div className="flex flex-wrap gap-2">
             <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 flex items-center gap-1">
                <Activity className="w-3 h-3" /> {t('activity.changes.settings_modified')}
             </span>
             {changes.filter((c: string) => c !== 'fields').map((c: string, i: number) => (
               <span key={i} className="text-xs text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                 {c.replace(/([A-Z])/g, ' $1').trim()}
               </span>
             ))}
          </div>
        )}

        {renderLogicChanges(details.logicChanges)}
      </div>
    );
  };

  const getLogTitle = (log: ActivityLog) => {
    switch (log.action) {
      case 'CREATED': return <span className="text-gray-900">{t('activity.log.created')}</span>;
      case 'DELETED': return <span className="text-rose-600">{t('activity.log.deleted')}</span>;
      case 'UPDATED': return <span className="text-gray-900">{t('activity.log.updated')}</span>;
      default: return <span className="text-gray-900">{log.action.toLowerCase()}</span>;
    }
  };

  if (loading && !logs.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
        {/* Fixed Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-200">
            <div className="max-w-4xl mx-auto px-6 py-3 min-h-[64px] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <button 
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-all hover:-translate-x-1"
                >
                <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{t('activity.title')}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium text-indigo-600 max-w-[200px] sm:max-w-xs md:max-w-md truncate" title={formTitle}>{formTitle}</span>
                    <span className="flex-shrink-0">•</span>
                    <span className="flex-shrink-0 whitespace-nowrap">{logs.length} events loaded</span>
                </div>
                </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto md:overflow-visible md:flex-wrap pb-1 md:pb-0 justify-end flex-shrink-0">
                {/* User Filter Dropdown */}
                <div className="relative">
                   <button
                       onClick={() => setIsUserFilterOpen(!isUserFilterOpen)}
                       className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 whitespace-nowrap"
                   >
                       <span className="max-w-[100px] truncate">{userFilter ? editors.find(e => e.id === userFilter)?.firstName + ' ' + editors.find(e => e.id === userFilter)?.lastName : t('activity.filter.all_users')}</span>
                       <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserFilterOpen ? 'rotate-180' : ''}`} />
                   </button>
                   
                   {isUserFilterOpen && (
                       <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
                           <button
                        onClick={() => { setUserFilter(null); setIsUserFilterOpen(false); setPage(1); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${!userFilter ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <User className="w-4 h-4 opacity-70" />
                        <span>{t('activity.filter.all_users')}</span>
                      </button>
                      {editors.map((editor) => (
                               <button
                                   key={editor.id}
                                   onClick={() => {
                                       setUserFilter(editor.id);
                                       setIsUserFilterOpen(false);
                                       setPage(1);
                                   }}
                                   className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${userFilter === editor.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}
                               >
                                   {editor.photoUrl && (
                                       <img src={editor.photoUrl} alt="" className="w-6 h-6 rounded-full" />
                                   )}
                                   <span>{editor.firstName} {editor.lastName}</span>
                               </button>
                           ))}
                       </div>
                   )}
                </div>

                {/* Custom Filter Dropdown */}
                <div className="relative">
                   <button
                     onClick={() => setIsFilterOpen(!isFilterOpen)}
                     onBlur={() => setTimeout(() => setIsFilterOpen(false), 200)}
                     className={`flex items-center gap-2 px-4 py-2 bg-white rounded-xl border text-sm font-medium shadow-sm transition-all duration-200 ${isFilterOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-700' : 'border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600'}`}
                   >
                     <span>
                       {actionFilter === 'ALL' && t('activity.filter.all')}
                       {actionFilter === 'CREATED' && t('activity.filter.created')}
                       {actionFilter === 'UPDATED' && t('activity.filter.updated')}
                       {actionFilter === 'DELETED' && t('activity.filter.deleted')}
                     </span>
                     <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                   </button>
                   
                   {isFilterOpen && (
                     <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black/5 border border-gray-100 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                        <div className="py-1">
                          {[
                            { value: 'ALL', label: t('activity.filter.all'), icon: Activity },
                            { value: 'CREATED', label: t('activity.filter.created'), icon: Plus },
                            { value: 'UPDATED', label: t('activity.filter.updated'), icon: Edit3 },
                            { value: 'DELETED', label: t('activity.filter.deleted'), icon: Trash2 },
                          ].map((f) => (
                             <button
                               key={f.value}
                               onClick={() => {
                                 setActionFilter(f.value);
                                 setPage(1);
                                 setIsFilterOpen(false);
                               }}
                               className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${actionFilter === f.value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                             >
                               <f.icon className={`w-4 h-4 ${actionFilter === f.value ? 'text-indigo-600' : 'text-gray-400'}`} />
                               {f.label}
                               {actionFilter === f.value && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                             </button>
                          ))}
                        </div>
                        {/* Settings Hint */}
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                          <p className="text-[10px] text-gray-500 leading-tight">
                            *{t('activity.filter.updated')} includes settings.
                          </p>
                        </div>
                     </div>
                   )}
                </div>

                <button
                    onClick={() => {
                        setSort(s => s === 'desc' ? 'asc' : 'desc');
                        setPage(1);
                    }}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 whitespace-nowrap"
                >
                    {sort === 'desc' ? (
                        <>
                            <ArrowUp className="w-4 h-4 text-indigo-500 rotate-180" />
                            <span>{t('activity.filter.newest')}</span>
                        </>
                    ) : (
                        <>
                            <ArrowUp className="w-4 h-4 text-indigo-500" />
                            <span>{t('activity.filter.oldest')}</span>
                        </>
                    )}
                </button>
            </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[28px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-gray-200 via-gray-200/50 to-transparent" />

                <div className="space-y-8">
                    {logs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Activity className="w-8 h-8 text-gray-300" />
                 </div>
                 <h3 className="text-lg font-medium text-gray-900 mb-1">{t('activity.no_activity_title')}</h3>
                 <p className="text-gray-500 max-w-sm mx-auto">{t('activity.no_activity_desc')}</p>
                 {(actionFilter !== 'ALL' || userFilter) && (
                   <button 
                     onClick={() => { setActionFilter('ALL'); setUserFilter(null); }}
                     className="mt-4 text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
                   >
                     {t('activity.clear_filters')}
                   </button>
                 )}
              </div>
                    ) : (
                    logs.map((log, index) => {
                      // Helper to check visibility based on filter
                      const isVisible = (section: 'created' | 'deleted' | 'updated') => {
                          if (actionFilter === 'ALL') return true;
                          if (actionFilter === 'CREATED' && section === 'created') return true;
                          if (actionFilter === 'DELETED' && section === 'deleted') return true;
                          if (actionFilter === 'UPDATED' && section === 'updated') return true;
                          return false;
                      };

                      // Check if log should be rendered
                      const shouldRenderLog = (log: ActivityLog) => {
                          const details = log.details || {};
                          
                          // 1. Check direct changes
                          if (
                            (details.addedFields && details.addedFields.length > 0) ||
                            (details.deletedFields && details.deletedFields.length > 0) ||
                            (details.updatedFields && details.updatedFields.length > 0)
                          ) {
                             if (isVisible('created') && details.addedFields?.length > 0) return true;
                             if (isVisible('deleted') && details.deletedFields?.length > 0) return true;
                             if (isVisible('updated') && details.updatedFields?.length > 0) return true;
                          }

                          // 2. Check Logic Changes
                          if (details.logicChanges) {
                              const logic = details.logicChanges;
                              if (
                                (logic.added && logic.added.length > 0) ||
                                (logic.deleted && logic.deleted.length > 0) ||
                                (logic.updated && logic.updated.length > 0)
                              ) {
                                  if (isVisible('updated')) return true;
                              }
                          }

                          // 3. Check Settings Changes
                          if (details.settingsChanges && details.settingsChanges.length > 0) {
                              if (!isVisible('updated')) return false;

                              // Apply the SAME filtering logic as the render block
                              const rawChanges = details.settingsChanges.filter((c: any) => c.before != c.after);
                              
                              const renderableSettings = rawChanges.filter((change: any) => {
                                   const isObjectDiff = typeof change.before === 'object' && change.before !== null && !Array.isArray(change.before) &&
                                                        typeof change.after === 'object' && change.after !== null && !Array.isArray(change.after);
                                   
                                   if (isObjectDiff) {
                                      const allKeys = Array.from(new Set([...Object.keys(change.before), ...Object.keys(change.after)]));
                                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                      const diffKeys = allKeys.filter(key => {
                                          const vBefore = change.before[key];
                                          const vAfter = change.after[key];
                                          const isEmpty = (v: any) => v === null || v === undefined || v === '';
                                          if (isEmpty(vBefore) && isEmpty(vAfter)) return false;
                                          return vBefore !== vAfter;
                                      });
                                      return diffKeys.length > 0;
                                   }
                                   return true;
                              });

                              if (renderableSettings.length > 0) return true;
                          }
                          
                          return false;
                      };

                      if (!shouldRenderLog(log)) return null;

                      return (
                        <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="relative pl-20"
                        >
                        {/* Avatar */}
                        <div className="absolute left-0 top-0 z-10">
                            <UserAvatar 
                                user={log.user} 
                                className="w-14 h-14 rounded-full border-4 border-white shadow-sm"
                            />
                            
                            {/* Action Badge */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-100">
                                {log.action === 'CREATED' && <Plus className="w-3.5 h-3.5 text-green-600" />}
                                {log.action === 'UPDATED' && <Edit3 className="w-3.5 h-3.5 text-blue-600" />}
                                {log.action === 'DELETED' && <Trash2 className="w-3.5 h-3.5 text-red-600" />}
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 group">
                            <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <p className="text-base text-gray-900">
                                    <span className="font-bold hover:text-indigo-600 transition-colors cursor-default">
                                    {typeof log.user.firstName === 'string' ? log.user.firstName : 'User'} {typeof log.user.lastName === 'string' ? log.user.lastName : ''}
                                    </span>
                                    {' '}
                                    {getLogTitle(log)}
                                </p>
                            </div>
                            <div className="text-xs font-medium text-gray-400 flex items-center gap-1.5 whitespace-nowrap bg-gray-50 px-2.5 py-1 rounded-full group-hover:bg-gray-100 transition-colors">
                                <Clock className="w-3.5 h-3.5" />
                                {formatTime(log.createdAt)}
                            </div>
                            </div>

                            <div className="pl-4 border-l-2 border-gray-100">
                            {log.action === 'CREATED' && (
                                <div className="text-sm text-gray-500 italic">Started a new journey with "{typeof log.details?.title === 'string' ? log.details.title : 'Untitled Form'}"</div>
                            )}
                            {renderChanges(log)}
                            </div>
                        </div>
                        </motion.div>
                    );
                    })

                    )}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                        Showing page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            </div>
        </main>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 z-50 p-3 bg-black text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
    </div>
  );
}
