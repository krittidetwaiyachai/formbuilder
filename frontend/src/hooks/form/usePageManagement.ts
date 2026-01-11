
import { useState } from 'react';
import { Field, FieldType, Form, PageSettings } from '@/types';
import { arrayMove } from '@dnd-kit/sortable';
import { useFormStore } from '@/store/formStore';

interface UsePageManagementProps {
  currentForm: Form | null;
  activeFields: Field[]; // Use local optimistic fields
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
    const { updateForm } = useFormStore();
    const id = currentForm?.id;

    // Helper to ensure pageSettings are synced with fields
    const syncPageSettings = (fields: Field[], currentSettings: PageSettings[] | undefined) => {
        const pageCount = fields.filter(f => f.type === FieldType.PAGE_BREAK).length + 1;
        let newSettings = currentSettings ? [...currentSettings] : [];
        
        if (newSettings.length < pageCount) {
            for (let i = newSettings.length; i < pageCount; i++) {
                newSettings.push({
                    id: crypto.randomUUID(),
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
            id: crypto.randomUUID(),
            formId: id!,
            type: FieldType.PAGE_BREAK,
            label: 'Page Break', 
            required: false,
            order: activeFields.length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        const newFields = [...activeFields, newPageBreak];
        
        const newPageSetting: PageSettings = {
            id: crypto.randomUUID(),
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
                title: '', // Fresh start
                description: '',
                buttonText: 'Start',
                showStartButton: true,
                layout: 'simple', // Reset layout too
                backgroundImage: undefined
            }
        });
        setCurrentPage(-1); // Switch to Welcome Screen
    };
    
    const handleAddThankYou = () => {
        updateForm({
            thankYouSettings: {
                isActive: true,
                title: 'Thank You', // Default title as requested
                message: '',
                buttonText: 'Back to Home',
                layout: 'simple', // Reset layout too
                backgroundImage: undefined
            }
        });
        setCurrentPage(-2); // Switch to Thank You Screen
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
    
    // Content Page Deletion
    const pageBreaks = activeFields.filter(f => f.type === FieldType.PAGE_BREAK);
    // Validation: Cannot delete the last remaining page
    if (pageBreaks.length === 0) return;
    
    // Chunk strategy
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

    if (confirm('Are you sure you want to delete this page? All fields in it will be removed.')) {
        
        // Remove the chunk
        chunks.splice(pageIndex, 1);
        
        const finalFields: Field[] = [];
        const oldPageBreaks = activeFields.filter(f => f.type === FieldType.PAGE_BREAK);
        
        // We need (chunks.length - 1) breaks.
        const breaksNeeded = Math.max(0, chunks.length - 1);
        const breaksToUse = oldPageBreaks.slice(0, breaksNeeded);
        
        chunks.forEach((chunk, i) => {
            finalFields.push(...chunk);
            if (i < breaksToUse.length) {
                finalFields.push(breaksToUse[i]);
            }
        });
    
        // Update Page Settings
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
        
        // Adjust navigation
        if (currentPage >= pageIndex && currentPage > 0) {
            setCurrentPage(currentPage - 1);
        } else if (currentPage >= chunks.length) { 
            setCurrentPage(Math.max(0, chunks.length - 1));
        }
    }
    };

    const handleRenamePage = (pageIndex: number, newTitle: string) => {
        const newPageSettings = [...(currentForm?.pageSettings || [])];
        
        // Ensure entry exists (lazy init or sync)
            if (newPageSettings.length <= pageIndex) {
                // Should have been synced, but if not:
                for(let i=newPageSettings.length; i<=pageIndex; i++) {
                    newPageSettings.push({ id: crypto.randomUUID(), title: `Page ${i+1}` });
                }
        }
        
        if (newPageSettings[pageIndex]) {
            newPageSettings[pageIndex].title = newTitle;
            updateForm({ pageSettings: newPageSettings });
        }
    };

    const handleReorderPages = (oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex) return;
    
        /* --- Field Reordering (Chunk Strategy) --- */
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
    
        // Move content chunk
        const movedChunk = chunks[oldIndex];
        chunks.splice(oldIndex, 1);
        chunks.splice(newIndex, 0, movedChunk);
        
        // Reconstruct Fields
        const finalFields: Field[] = [];
        const breaks = tempFields.filter(f => f.type === FieldType.PAGE_BREAK);
        
        // We reuse breaks in order
        chunks.forEach((chunk, i) => {
            finalFields.push(...chunk);
            if (i < chunks.length - 1) {
                if (i < breaks.length) {
                        finalFields.push(breaks[i]);
                } else {
                        // Create new break if needed (shouldn't happen)
                        finalFields.push({
                        id: crypto.randomUUID(),
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
        
        /* --- Page Settings Reordering --- */
        let newPageSettings = [...(currentForm?.pageSettings || [])];
        // Sync length if needed
        if (newPageSettings.length < chunks.length) {
                newPageSettings = syncPageSettings(activeFields, newPageSettings);
        }
        
        // Ensure we have enough settings for the move
        const movedSetting = newPageSettings[oldIndex] || { id: crypto.randomUUID(), title: `Page ${oldIndex+1}` }; 
        if (newPageSettings[oldIndex]) {
            newPageSettings.splice(oldIndex, 1);
            newPageSettings.splice(newIndex, 0, movedSetting);
        }
    
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
