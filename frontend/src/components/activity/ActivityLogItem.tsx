import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Clock, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UserAvatar from '@/components/common/UserAvatar';
import { ActivityLog } from './types';
import { formatTime } from './utils';
import FieldChangeRenderer from './FieldChangeRenderer';
import LogicChangeRenderer from './LogicChangeRenderer';
import SettingsChangeRenderer from './SettingsChangeRenderer';

interface ActivityLogItemProps {
    log: ActivityLog;
    index: number;
    fieldLabels: Record<string, string>;
    actionFilter: string;
}

export default function ActivityLogItem({ log, index, fieldLabels, actionFilter }: ActivityLogItemProps) {
    const { t, i18n } = useTranslation();
    const { details } = log;
    let { addedFields, deletedFields, updatedFields, changes, logicChanges, settingsChanges } = details || {};

    
    
    if (settingsChanges && settingsChanges.length > 0) {
        const themeChange = settingsChanges.find((c: any) => 
            String(c.property || '').toLowerCase().replace(/[^a-z]/g, '').includes('theme')
        );
        if (themeChange) {
            settingsChanges = [themeChange];
        }
    }

    const hasGeneralChanges = changes?.filter((c: string) => c !== 'fields' && c !== 'logic').length > 0;

    const getLogTitle = (log: ActivityLog) => {
        switch (log.action) {
          case 'CREATED': return <span className="text-gray-900">{t('activity.log.created')}</span>;
          case 'DELETED': return <span className="text-rose-600">{t('activity.log.deleted')}</span>;
          case 'UPDATED': return <span className="text-gray-900">{t('activity.log.updated')}</span>;
          default: return <span className="text-gray-900">{log.action.toLowerCase()}</span>;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="relative pl-20"
        >
            {}
            <div className="absolute left-0 top-0 z-10">
                <UserAvatar 
                    user={log.user} 
                    className="w-14 h-14 rounded-full border-4 border-white shadow-sm"
                />
                
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-100">
                    {log.action === 'CREATED' && <Plus className="w-3.5 h-3.5 text-green-600" />}
                    {log.action === 'UPDATED' && <Edit3 className="w-3.5 h-3.5 text-blue-600" />}
                    {log.action === 'DELETED' && <Trash2 className="w-3.5 h-3.5 text-red-600" />}
                </div>
            </div>

            {}
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
                        {formatTime(log.createdAt, i18n.language)}
                    </div>
                </div>

                <div className="pl-4 border-l-2 border-gray-100">
                    {log.action === 'CREATED' && (
                        <div className="text-sm text-gray-500 italic">{t('activity.started_journey', { title: typeof log.details?.title === 'string' ? log.details.title : t('common.untitled_form') })}</div>
                    )}
                    
                    <FieldChangeRenderer 
                        addedFields={addedFields}
                        deletedFields={deletedFields}
                        updatedFields={updatedFields}
                        fieldLabels={fieldLabels}
                        actionFilter={actionFilter}
                    />

                    <SettingsChangeRenderer 
                        settingsChanges={settingsChanges}
                        actionFilter={actionFilter}
                    />

                     {hasGeneralChanges && (!settingsChanges || settingsChanges.length === 0) && (
                        <div className="flex flex-wrap gap-2 mt-3">
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

                    <LogicChangeRenderer 
                        logicRules={logicChanges}
                        fieldLabels={fieldLabels}
                    />
                </div>
            </div>
        </motion.div>
    );
}
