import { useEffect } from 'react';
import { useFormStore } from '@/store/formStore';

export const useFormShortcuts = (handleSave?: (isAutoSave?: boolean, silent?: boolean, checkDebounce?: boolean) => Promise<void>) => {
    const { 
        selectAllFields,
        undo,
        redo,
        deleteSelectedFields,
        copyFields,
        cutFields,
        pasteFields,
        deselectAll,
        saveForm,
        selectedFieldId,
        additionalSelectedIds,
    } = useFormStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
                return;
            }

            const isCtrl = e.ctrlKey || e.metaKey;
            const code = e.code;
            const key = e.key;

            if (isCtrl && (code === 'KeyA' || key === 'a' || key === 'A')) {
                e.preventDefault();
                e.stopPropagation();
                selectAllFields();
                return;
            }

            if (isCtrl && (code === 'KeyD' || key === 'd' || key === 'D')) {
                e.preventDefault();
                deselectAll();
                return;
            }

            if (isCtrl && (code === 'KeyS' || key === 's' || key === 'S')) {
                e.preventDefault(); 
                if (handleSave) {
                    handleSave(false, true, true); 
                } else {
                    saveForm(); 
                }
                return;
            }

            if (isCtrl && (code === 'KeyZ' || key === 'z' || key === 'Z') && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }

            if ((isCtrl && (code === 'KeyY' || key === 'y')) || 
                (isCtrl && e.shiftKey && (code === 'KeyZ' || key === 'z' || key === 'Z'))) {
                e.preventDefault();
                redo();
                return;
            }

            if (isCtrl && (code === 'KeyC' || key === 'c' || key === 'C')) {
                e.preventDefault();
                copyFields();
                return;
            }

            if (isCtrl && (code === 'KeyX' || key === 'x' || key === 'X')) {
                e.preventDefault();
                cutFields();
                return;
            }

            if (isCtrl && (code === 'KeyV' || key === 'v' || key === 'V')) {
                e.preventDefault(); 
                pasteFields();
                return;
            }

            if (code === 'Delete' || code === 'Backspace' || key === 'Delete' || key === 'Backspace') {
                 if (selectedFieldId || additionalSelectedIds.length > 0) {
                     e.preventDefault(); 
                     deleteSelectedFields();
                 }
                 return;
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [selectAllFields, undo, redo, deleteSelectedFields, copyFields, cutFields, pasteFields, deselectAll, saveForm, handleSave, selectedFieldId, additionalSelectedIds]);
};
