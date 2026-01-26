
import { Field, FieldType, Form, PageSettings } from '@/types';
import { useTranslation } from 'react-i18next';

import { useFormStore } from '@/store/formStore';
import { generateUUID } from '@/utils/uuid';

interface UsePageManagementProps {
  currentForm: Form | null;
  activeFields: Field[]; 
  setActiveFields: (fields: Field[]) => void;
  setCurrentPage: (page: number) => void;
  currentPage: number;
}

export function usePageManagement({
  currentForm,
  activeFields,
  setActiveFields,
  setCurrentPage,
  currentPage
}: UsePageManagementProps) {
    const { t } = useTranslation();
    const { updateForm } = useFormStore();
    const id = currentForm?.id;

    const syncPageSettings = (fields: Field[], currentSettings: PageSettings[] | undefined) => {
        const pageCount = fields.filter(f => f.type === FieldType.PAGE_BREAK).length + 1;
        let newSettings = currentSettings ? [...currentSettings] : [];
        
        if (newSettings.length < pageCount) {
            for (let i = newSettings.length; i < pageCount; i++) {
                newSettings.push({
                    id: generateUUID(),
                    title: `Page ${i + 1}`
                });
            }
        }
        if (newSettings.length > pageCount) {
            newSettings = newSettings.slice(0, pageCount);
        }
        return newSettings;
    };

    const handleAddPage = () => {
        const newPageBreak: Field = {
            id: generateUUID(),
            formId: id!,
            type: FieldType.PAGE_BREAK,
            label: 'Page Break', 
            required: false,
            order: activeFields.length,

        };
        
        const newFields = [...activeFields, newPageBreak];
        
        const newPageSetting: PageSettings = {
            id: generateUUID(),
            title: `Page ${(currentForm?.pageSettings?.length || 0) + 1}`
        };
        
        const updatedPageSettings = [...(currentForm?.pageSettings || []), newPageSetting];

        setActiveFields(newFields);
        updateForm({ 
            fields: newFields,
            pageSettings: updatedPageSettings
        });
        
        const newPageIndex = newFields.filter(f => f.type === FieldType.PAGE_BREAK).length;
        setCurrentPage(newPageIndex);
    };

    const handleAddWelcome = () => {
        updateForm({
            welcomeSettings: {
                isActive: true,
                title: '', 
                description: '',
                buttonText: 'Start',
                showStartButton: true,
                layout: 'simple', 
                backgroundImage: undefined
            }
        });
        setCurrentPage(-1); 
    };
    
    const handleAddThankYou = () => {
        updateForm({
            thankYouSettings: {
                isActive: true,
                title: 'Thank You', 
                message: '',
                buttonText: 'Back to Home',
                layout: 'simple', 
                backgroundImage: undefined
            }
        });
        setCurrentPage(-2); 
    };

    const handleDeletePage = (pageIndex: number) => {
        if (pageIndex === -1 && currentForm) {
            updateForm({ welcomeSettings: { ...currentForm.welcomeSettings!, isActive: false } });
            setCurrentPage(0);
            return;
        } 
        if (pageIndex === -2 && currentForm) {
            updateForm({ thankYouSettings: { ...currentForm.thankYouSettings!, isActive: false } });
            setCurrentPage(0);
            return;
    }
    
    const pageBreaks = activeFields.filter(f => f.type === FieldType.PAGE_BREAK);
    
    if (pageBreaks.length === 0) {
        alert(t('builder.cannot_delete_last_page'));
        return;
    }
    
    let tempFields = [...activeFields];
    const chunks: Field[][] = [];
    let currentBatch: Field[] = [];
    
    tempFields.forEach(field => {
        if (field.type === FieldType.PAGE_BREAK) {
            chunks.push(currentBatch);
            currentBatch = [];
        } else {
            currentBatch.push(field);
        }
    });
    chunks.push(currentBatch); 
    
    if (pageIndex >= chunks.length) return;

        chunks.splice(pageIndex, 1);
        
        const finalFields: Field[] = [];
        const oldPageBreaks = activeFields.filter(f => f.type === FieldType.PAGE_BREAK);
        
        const breaksNeeded = Math.max(0, chunks.length - 1);
        const breaksToUse = oldPageBreaks.slice(0, breaksNeeded);
        
        chunks.forEach((chunk, i) => {
            finalFields.push(...chunk);
            if (i < breaksToUse.length) {
                finalFields.push(breaksToUse[i]);
            }
        });
    
        const newPageSettings = [...(currentForm?.pageSettings || [])];
        if (pageIndex < newPageSettings.length) {
            newPageSettings.splice(pageIndex, 1);
        }
        
        const fieldsWithOrder = finalFields.map((f, i) => ({ ...f, order: i }));
        
        setActiveFields(fieldsWithOrder);
        updateForm({ 
            fields: fieldsWithOrder,
            pageSettings: newPageSettings
        });
        
        if (currentPage >= pageIndex && currentPage > 0) {
            setCurrentPage(currentPage - 1);
        } else if (currentPage >= chunks.length) { 
            setCurrentPage(Math.max(0, chunks.length - 1));
        }
    };

    const handleRenamePage = (pageIndex: number, newTitle: string) => {
        const newPageSettings = [...(currentForm?.pageSettings || [])];
        
            if (newPageSettings.length <= pageIndex) {
                for(let i=newPageSettings.length; i<=pageIndex; i++) {
                    newPageSettings.push({ id: generateUUID(), title: `Page ${i+1}` });
                }
        }
        
        if (newPageSettings[pageIndex]) {
            newPageSettings[pageIndex].title = newTitle;
            updateForm({ pageSettings: newPageSettings });
        }
    };

    const handleReorderPages = (oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex) return;
    
        let tempFields = [...activeFields];
        const chunks: Field[][] = [];
        let currentBatch: Field[] = [];
        
        tempFields.forEach(field => {
            if (field.type === FieldType.PAGE_BREAK) {
                chunks.push(currentBatch);
                currentBatch = [];
            } else {
                currentBatch.push(field);
            }
        });
        chunks.push(currentBatch);
        
        if (oldIndex >= chunks.length || newIndex >= chunks.length) return;
    
        const movedChunk = chunks[oldIndex];
        chunks.splice(oldIndex, 1);
        chunks.splice(newIndex, 0, movedChunk);
        
        const finalFields: Field[] = [];
        const breaks = tempFields.filter(f => f.type === FieldType.PAGE_BREAK);
        
        chunks.forEach((chunk, i) => {
            finalFields.push(...chunk);
            if (i < chunks.length - 1) {
                if (i < breaks.length) {
                        finalFields.push(breaks[i]);
                } else {
                        finalFields.push({
                        id: generateUUID(),
                        formId: id!,
                        type: FieldType.PAGE_BREAK,
                        label: 'Page Break',
                        required: false,
                        order: 0
                        } as Field);
                }
            }
        });
        
        const fieldsWithOrder = finalFields.map((f, i) => ({ ...f, order: i }));
        
        let newPageSettings = [...(currentForm?.pageSettings || [])];
        if (newPageSettings.length < chunks.length) {
                newPageSettings = syncPageSettings(activeFields, newPageSettings);
        }
        
        const movedSetting = newPageSettings[oldIndex] || { id: generateUUID(), title: `Page ${oldIndex+1}` }; 
        
        if (oldIndex < newPageSettings.length) {
            newPageSettings.splice(oldIndex, 1);
        }
        
        newPageSettings.splice(newIndex, 0, movedSetting);
    
        setActiveFields(fieldsWithOrder);
        updateForm({ 
            fields: fieldsWithOrder,
            pageSettings: newPageSettings
        });
        
        setCurrentPage(newIndex);
    };

    return {
        handleAddPage,
        handleAddWelcome,
        handleAddThankYou,
        handleDeletePage,
        handleRenamePage,
        handleReorderPages
    };
}
