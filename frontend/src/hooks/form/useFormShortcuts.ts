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
            // Ignore if user is typing in an input text area
            if (target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
                return;
            }

            const isCtrl = e.ctrlKey || e.metaKey;
            const code = e.code;
            const key = e.key;

            // Ctrl + A: Select All
            if (isCtrl && (code === 'KeyA' || key === 'a' || key === 'A')) {
                e.preventDefault();
                e.stopPropagation();
                selectAllFields();
                return;
            }

            // Ctrl + D: Deselect All
            if (isCtrl && (code === 'KeyD' || key === 'd' || key === 'D')) {
                e.preventDefault();
                deselectAll();
                return;
            }

            // Ctrl + S: Save
            if (isCtrl && (code === 'KeyS' || key === 's' || key === 'S')) {
                e.preventDefault(); // Prevent browser save
                if (handleSave) {
                    handleSave(false, true, true); // Manual save, silent, with debounce
                } else {
                    saveForm(); // Fallback to store method
                }
                return;
            }

            // Ctrl + Z: Undo
            if (isCtrl && (code === 'KeyZ' || key === 'z' || key === 'Z') && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }

            // Ctrl + Y: Redo (Standard) OR Ctrl + Shift + Z
            if ((isCtrl && (code === 'KeyY' || key === 'y')) || 
                (isCtrl && e.shiftKey && (code === 'KeyZ' || key === 'z' || key === 'Z'))) {
                e.preventDefault();
                redo();
                return;
            }

            // Ctrl + C: Copy
            if (isCtrl && (code === 'KeyC' || key === 'c' || key === 'C')) {
                e.preventDefault();
                copyFields();
                return;
            }

            // Ctrl + X: Cut
            if (isCtrl && (code === 'KeyX' || key === 'x' || key === 'X')) {
                e.preventDefault();
                cutFields();
                return;
            }

            // Ctrl + V: Paste
            if (isCtrl && (code === 'KeyV' || key === 'v' || key === 'V')) {
                e.preventDefault(); // Prevent browser paste (optional, but good for field paste)
                pasteFields();
                return;
            }

            // Delete / Backspace: Delete Selected
            if (code === 'Delete' || code === 'Backspace' || key === 'Delete' || key === 'Backspace') {
                 if (selectedFieldId || additionalSelectedIds.length > 0) {
                     e.preventDefault(); 
                     deleteSelectedFields();
                 }
                 return;
            }
        };

        // Use capture phase to ensure we catch it before browser defaults if possible
        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [selectAllFields, undo, redo, deleteSelectedFields, copyFields, cutFields, pasteFields, deselectAll, saveForm, handleSave, selectedFieldId, additionalSelectedIds]);
};
