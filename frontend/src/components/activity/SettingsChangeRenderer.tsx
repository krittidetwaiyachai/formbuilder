import { ArrowRight, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPropertyLabel } from './utils';
import ValueRenderer from './ValueRenderer';

interface SettingsChangeRendererProps {
  settingsChanges?: any[];
  actionFilter: string;
}

export default function SettingsChangeRenderer({ settingsChanges, actionFilter }: SettingsChangeRendererProps) {
    const { t, i18n } = useTranslation();

    const isVisible = (section: 'updated') => {
        if (actionFilter === 'ALL') return true;
        if (actionFilter === 'UPDATED') return true;
        return false;
    };

    const isBooleanToggle = (before: any, after: any) => {
      return typeof before === 'boolean' && typeof after === 'boolean';
    };
      
    const isStringToggle = (property: string, before: any, after: any) => {
      const prop = property.split('.').pop()?.toLowerCase();
      const isStringValue = typeof before === 'string' || typeof after === 'string' || typeof before === 'number' || typeof after === 'number';
      const toggleProps = ['size', 'width', 'height', 'align', 'variant', 'position', 'shrink', 'labelalign', 'labelalignment', 'textalign', 'textalignment', 'alignment', 'inputalign', 'inputalignment', 'columns', 'theme', 'layout', 'direction', 'orientation', 'color', 'background', 'radius', 'border', 'shadow', 'editormode'];
      return toggleProps.includes(prop || '') && (isStringValue || typeof before === 'undefined');
    };

    const formatDiffValue = (key: string, val: any) => {
        if (key === 'releaseScoreMode') {
            const v = val || 'immediately';
            if (v === 'immediately') return <span>{t('activity.values.immediately')}</span>;
            if (v === 'manual') return <span>{t('activity.values.manual')}</span>;
        }
        const quizToggles = ['showScore', 'showAnswer', 'allowViewMissedQuestions', 'showDetail', 'showExplanation', 'shuffleQuestions', 'requireSignIn'];
        if (quizToggles.includes(key)) {
             const boolVal = !!val;
             return boolVal ? <span className="text-emerald-700 font-medium">{t('activity.values.enable')}</span> : <span className="text-gray-500 font-medium">{t('activity.values.disable')}</span>;
        }
        return <ValueRenderer value={val} />;
    };

    const rawChanges = settingsChanges?.filter((c: any) => c.before != c.after) || [];
    
    
    
    
    let processedChanges: any[] = rawChanges;
    
    for (const change of rawChanges) {
        
        const prop = String(change.property || '').toLowerCase().replace(/[^a-z]/g, '');
        if (prop.includes('theme') && !prop.includes('color')) {
            processedChanges = [change];
            break;
        }

        
        if (typeof change.before === 'object' && change.before !== null &&
            typeof change.after === 'object' && change.after !== null) {
            
            const allKeys = [...Object.keys(change.before), ...Object.keys(change.after)];
            
            const themeKey = allKeys.find(k => {
                const lower = k.toLowerCase();
                return (lower === 'theme' || lower === 'themename' || lower === 'theme_name');
            });

            if (themeKey) {
                const beforeVal = change.before[themeKey];
                const afterVal = change.after[themeKey];

                
                if (beforeVal !== afterVal) {
                    
                    processedChanges = [{
                        property: 'themeName',
                        before: beforeVal,
                        after: afterVal
                    }];
                    break;
                }
            }
        }
    }
          
    const renderableChanges = processedChanges.filter((change: any) => {
        const prop = String(change.property || '').toUpperCase();
        
        
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
        return true; 
    });

    
    const finalRenderableChanges = renderableChanges.filter((change: any) => {
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
        return true;
    });

    if (finalRenderableChanges.length === 0 || !isVisible('updated')) return null;

    return (
        <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 inline-flex items-center gap-1">
                <Zap className="w-3 h-3" /> {t('activity.changes.settings_updated')}
            </div>
            
            <div className="bg-slate-50 rounded-md p-3 border border-slate-100 space-y-1">
                {finalRenderableChanges.map((change: any, i: number) => {
                    const prop = String(change.property || '').toUpperCase();
                    
                    
                    if (prop.includes('THEME') && !prop.includes('COLOR') && !prop.includes('FONT')) {
                        const formatThemeName = (name: any) => {
                            if (!name) return t('activity.values.custom');
                            return String(name).charAt(0).toUpperCase() + String(name).slice(1);
                        };

                        return (
                            <div key={i} className="flex items-center gap-1.5 text-xs">
                                <span className="text-gray-500 font-medium whitespace-nowrap">{t('activity.changes.theme_changed')}</span>
                                <div className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 line-through opacity-75 break-words min-w-0">
                                    {formatThemeName(change.before)}
                                </div>
                                <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 font-medium break-words min-w-0">
                                    {formatThemeName(change.after)}
                                </div>
                            </div>
                        );
                    }

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

                        if (diffKeys.length === 0) return null;

                        return (
                            <div key={i} className="flex flex-col gap-1.5 text-xs border-b border-gray-100 last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
                                <span className="text-gray-500 font-medium whitespace-nowrap mb-1">{getPropertyLabel(change.property, t, i18n)}</span>
                                <div className="pl-2 border-l-2 border-gray-200 space-y-1.5">
                                    {diffKeys.map(key => {
                                        const beforeVal = change.before[key];
                                        const afterVal = change.after[key];
                                        const isBool = typeof beforeVal === 'boolean' || typeof afterVal === 'boolean';
                                        
                                        return (
                                        <div key={key} className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider min-w-[80px]">{getPropertyLabel(key, t, i18n)}</span>
                                            
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
                        <span className="text-gray-500 font-medium whitespace-nowrap">
                            {getPropertyLabel(change.property, t, i18n)}
                        </span>
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
                                    {typeof change.before === 'string' || typeof change.before === 'number' ? change.before : t('activity.values.auto')}
                                </div>
                                <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                <div className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-medium break-words min-w-0">
                                    {typeof change.after === 'string' || typeof change.after === 'number' ? change.after : t('activity.values.auto')}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 line-through opacity-75 break-words min-w-0" title={String(change.before)}>
                                {formatDiffValue(change.property, change.before)}
                                </div>
                                <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 font-medium break-words min-w-0" title={String(change.after)}>
                                {formatDiffValue(change.property, change.after)}
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
