import { TFunction, i18n as I18nType } from "i18next";

export const getFieldTypeName = (type: string, t: TFunction, i18n: I18nType) => {
    const key = `activity.field_type.${type.toLowerCase()}`;
    return i18n.exists(key) ? t(key) : type.replace(/_/g, ' ');
};

export const getPropertyLabel = (property: string, t: TFunction, i18n: I18nType) => {
    if (property.includes('.')) {
        const parts = property.split('.');
        return parts.map(p => {
            const key = `activity.property.${p}`;
            return i18n.exists(key) ? t(key) : p.charAt(0).toUpperCase() + p.slice(1);
        }).join(': ');
    }
    const key = `activity.property.${property}`;
    return i18n.exists(key) ? t(key) : property.charAt(0).toUpperCase() + property.slice(1).replace(/([A-Z])/g, ' $1');
};

export const getOperatorLabel = (operator: string, t: TFunction, i18n: I18nType) => {
    const key = `activity.operator.${operator}`;
    return i18n.exists(key) ? t(key) : operator.replace(/_/g, ' ');
};

export const getActionLabelType = (type: string, t: TFunction, i18n: I18nType) => {
    const key = `activity.action.${type.toLowerCase()}`;
    return i18n.exists(key) ? t(key) : type;
};

export const formatTime = (dateString: string, language: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'th' ? 'th-TH' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: false
    });
};

export const shouldRenderLog = (log: any, actionFilter: string) => {
    const isVisible = (section: 'created' | 'deleted' | 'updated') => {
        if (actionFilter === 'ALL') return true;
        if (actionFilter === 'CREATED' && section === 'created') return true;
        if (actionFilter === 'DELETED' && section === 'deleted') return true;
        if (actionFilter === 'UPDATED' && section === 'updated') return true;
        return false;
    };

    const details = log.details || {};

    
    if (
        (details.addedFields && details.addedFields.length > 0) ||
        (details.deletedFields && details.deletedFields.length > 0) ||
        (details.updatedFields && details.updatedFields.length > 0)
    ) {
        if (isVisible('created') && details.addedFields?.length > 0) return true;
        if (isVisible('deleted') && details.deletedFields?.length > 0) return true;
        if (isVisible('updated') && details.updatedFields?.length > 0) return true;
    }

    
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

    
    if (details.settingsChanges && details.settingsChanges.length > 0) {
        if (!isVisible('updated')) return false;

        
        const rawChanges = details.settingsChanges.filter((c: any) => c.before != c.after);

        
        const themeNameChange = rawChanges.find((c: any) => {
            const prop = String(c.property || '').toLowerCase();
            return prop === 'themename' || prop === 'theme' || prop.endsWith('.themename');
        });

        if (themeNameChange) {
            
            
            rawChanges.length = 0;
            rawChanges.push(themeNameChange);
        }

        

        const renderableSettings = rawChanges.filter((change: any) => {
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

        if (renderableSettings.length > 0) return true;
    }

    return false;
};

