import React, { useState, useRef, useEffect } from 'react';
import { DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Field, FieldType, Form } from '@/types';
import { snapCenterToCursor } from '@dnd-kit/modifiers';

interface UseFormDragAndDropProps {
  id: string;
  activeFields: Field[];
  setActiveFields: React.Dispatch<React.SetStateAction<Field[]>>;
  currentForm: Form | null;
  updateForm: (updates: Partial<Form>) => void;
  selectField: (fieldId: string) => void;
}

export function useFormDragAndDrop({
  id,
  activeFields,
  setActiveFields,
  currentForm,
  updateForm,
  selectField,
}: UseFormDragAndDropProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragEvent, setDragEvent] = useState<DragStartEvent | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [sidebarDragFieldId, setSidebarDragFieldId] = useState<string | null>(null);
  const [newlyAddedFieldId, setNewlyAddedFieldId] = useState<string | null>(null);
  
  const autoScrollIntervalRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Custom modifier
  const snapCenterTopToCursor = ({ transform, draggingNodeRect, ...args }: any) => {
    const centered = snapCenterToCursor({ transform, draggingNodeRect, ...args });
    if (!draggingNodeRect) return centered;
    const handleOffset = 12; 
    const offsetY = (draggingNodeRect.height / 2) - handleOffset;
    return { ...centered, y: centered.y + offsetY };
  };

  // Mouse move tracking
  useEffect(() => {
    if (!activeId) { setMousePosition(null); return; }
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [activeId]);

  // Auto-scroll logic
  useEffect(() => {
    if (!activeId || !mousePosition) {
      if (autoScrollIntervalRef.current) { cancelAnimationFrame(autoScrollIntervalRef.current); autoScrollIntervalRef.current = null; }
      return;
    }
    const activeData = dragEvent?.active?.data?.current;
    if (!activeData || (activeData.source !== 'sidebar' && activeData.source !== 'canvas')) {
      if (autoScrollIntervalRef.current) { cancelAnimationFrame(autoScrollIntervalRef.current); autoScrollIntervalRef.current = null; }
      return;
    }

    const smoothScroll = () => {
      if (!mousePosition) return;
      const canvasElement = document.querySelector('.canvas-scroll-container') as HTMLDivElement;
      if (!canvasElement) return;

      const rect = canvasElement.getBoundingClientRect();
      const isFromSidebar = dragEvent?.active?.data?.current?.source === 'sidebar';
      
      const scrollThreshold = isFromSidebar ? 80 : 100;
      const maxScrollSpeed = isFromSidebar ? 12 : 18;
      const minScrollSpeed = isFromSidebar ? 1 : 3;
      const outsideMargin = isFromSidebar ? 40 : 80;
      const horizontalMargin = 30;

      const mouseY = mousePosition.y;
      const mouseX = mousePosition.x;

      if (mouseX < rect.left - horizontalMargin || mouseX > rect.right + horizontalMargin) {
        autoScrollIntervalRef.current = requestAnimationFrame(smoothScroll);
        return;
      }

      const canScrollDown = canvasElement.scrollTop < (canvasElement.scrollHeight - canvasElement.clientHeight);
      const canScrollUp = canvasElement.scrollTop > 0;
      let scrollSpeed = 0;

      if (mouseY > rect.bottom - scrollThreshold && mouseY < rect.bottom + outsideMargin && canScrollDown) {
        const dist = rect.bottom - mouseY;
        const norm = Math.max(0, Math.min(1, dist / scrollThreshold));
        scrollSpeed = minScrollSpeed + (maxScrollSpeed - minScrollSpeed) * (1 - norm);
        canvasElement.scrollTop += scrollSpeed;
      } else if (mouseY < rect.top + scrollThreshold && mouseY > rect.top - outsideMargin && canScrollUp) {
        const dist = mouseY - rect.top;
        const norm = Math.max(0, Math.min(1, dist / scrollThreshold));
        scrollSpeed = minScrollSpeed + (maxScrollSpeed - minScrollSpeed) * (1 - norm);
        canvasElement.scrollTop -= scrollSpeed;
      }
      autoScrollIntervalRef.current = requestAnimationFrame(smoothScroll);
    };
    autoScrollIntervalRef.current = requestAnimationFrame(smoothScroll);
    return () => { if (autoScrollIntervalRef.current) cancelAnimationFrame(autoScrollIntervalRef.current); };
  }, [activeId, mousePosition, dragEvent]);


  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setDragEvent(event);
    
    // Determine source
    const activeData = active.data.current;
    if (activeData?.source === 'sidebar') {
       // Optimistically add to activeFields
       const newField: Field = {
          id: active.id as string, // Temporary ID
          formId: id!,
          type: activeData.type,
          label: activeData.label,
          required: false,
          order: -1, // Will be updated on drop
       };
       setSidebarDragFieldId(newField.id);
       setActiveFields(prev => [...prev, newField]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = active.data.current;
    
    // Clear drag state
    setActiveId(null);
    setDragEvent(null);
    setMousePosition(null);
    if (sidebarDragFieldId) {
        setSidebarDragFieldId(null);
    }

    const isSidebarItem = activeData?.source === 'sidebar';

    // If dropped nowhere
    if (!over) {
        if (isSidebarItem) {
            // Revert changes
            setActiveFields(currentForm?.fields || []);
        }
        return;
    }

    let newFields = [...activeFields];
    
    if (isSidebarItem) {
        // Find the temp field we added in DragStart
        const tempIndex = newFields.findIndex(f => f.id === active.id);
        if (tempIndex === -1 && isSidebarItem) {
             setActiveFields(currentForm?.fields || []);
             return;
        }

        // Use addField store action to clean up
        const type = activeData.type as FieldType;
        
        // We calculate insert position for real field
        const finalFields = [...activeFields].filter(f => f.id !== active.id); // Remove temp
        
        const fieldToAdd: Field = {
            id: crypto.randomUUID(),
            formId: id!,
            type,
            label: activeData.label,
            required: false,
            order: 0, 
        };
        
        let insertIndex = finalFields.length;
        if (over.id !== 'canvas') {
             const overIndex = finalFields.findIndex(f => f.id === over.id);
             if (overIndex !== -1) {
                insertIndex = overIndex;
             }
        }
        
        finalFields.splice(insertIndex, 0, fieldToAdd);
        const ordered = finalFields.map((f, i) => ({ ...f, order: i }));
        
        updateForm({ fields: ordered });
        setNewlyAddedFieldId(fieldToAdd.id);
        setTimeout(() => setNewlyAddedFieldId(null), 2000);
        selectField(fieldToAdd.id);

    } else {
        // Reordering existing fields
        if (active.id !== over.id) {
            const oldIndex = activeFields.findIndex((f) => f.id === active.id);
            const newIndex = activeFields.findIndex((f) => f.id === over.id);
            
            const reordered = arrayMove(activeFields, oldIndex, newIndex);
            
            // Re-assign orders
            const updated = reordered.map((f, i) => ({ ...f, order: i }));
            
            setActiveFields(updated);
            updateForm({ fields: updated }); // Persist
        }
    }
  };

  return {
    activeId,
    sidebarDragFieldId,
    newlyAddedFieldId,
    handleDragStart,
    handleDragEnd,
    sensors,
    snapCenterTopToCursor,
    closestCenter
  };
}
