import React, { useState } from 'react';
import { DropResult, DragStart } from '@hello-pangea/dnd';
import { Field, FieldType, Form } from '@/types';
import { generateUUID } from '@/utils/uuid';

interface UseFormDragAndDropProps {
  id: string;
  activeFields: Field[];
  setActiveFields: React.Dispatch<React.SetStateAction<Field[]>>;

  updateForm: (updates: Partial<Form>) => void;
  selectField: (fieldId: string) => void;
  currentPage: number;
}

export function useFormDragAndDrop({
  id,
  activeFields,
  setActiveFields,

  updateForm,
  selectField,
  currentPage,
}: UseFormDragAndDropProps) {

  const [isDragging, setIsDragging] = useState(false);

  // Use ref to track activeFields to avoid stale closures in drag callbacks
  const activeFieldsRef = React.useRef(activeFields);
  
  React.useEffect(() => {
    activeFieldsRef.current = activeFields;
  }, [activeFields]);

  const onDragStart = (_start: DragStart) => {
    setIsDragging(true);
  };

  const onDragEnd = (result: DropResult) => {
    setIsDragging(false);
    const { source, destination, draggableId, combine } = result;

    if (combine) {
      const targetFieldId = combine.draggableId;
      const currentFields = activeFieldsRef.current;
      const targetField = currentFields.find(f => f.id === targetFieldId);
      
      if (targetField && targetField.type === FieldType.GROUP) {
        // Handle Sidebar -> Group (Combine)
        if (draggableId.startsWith('sidebar-')) {
             const type = draggableId.replace('sidebar-', '') as FieldType;
             if (type === FieldType.GROUP) return;

             const newField: Field = {
                id: generateUUID(),
                formId: id,
                type: type,
                label: getLabelForType(type),
                required: false,
                order: 9999, // Will be sorted
                groupId: targetFieldId,
                options: {},
             };
             
             if (newField.type === FieldType.RADIO || newField.type === FieldType.CHECKBOX || newField.type === FieldType.DROPDOWN) {
                newField.options = {
                    subLabel: 'Sublabel',
                    options: [
                        { id: generateUUID(), label: 'Option 1', value: 'Option 1' },
                        { id: generateUUID(), label: 'Option 2', value: 'Option 2' },
                        { id: generateUUID(), label: 'Option 3', value: 'Option 3' },
                    ]
                };
             } else if (
                newField.type === FieldType.TEXT || 
                newField.type === FieldType.TEXTAREA ||
                newField.type === FieldType.NUMBER ||
                newField.type === FieldType.EMAIL ||
                newField.type === FieldType.PHONE ||
                newField.type === FieldType.DATE ||
                newField.type === FieldType.TIME ||
                newField.type === FieldType.RATE
             ) {
                newField.options = { subLabel: 'Sublabel' };
             }

             // Append to group (insert after last child or after group)
             const groupChildren = currentFields.filter(f => f.groupId === targetFieldId);
             let insertIndex = -1;
             
             if (groupChildren.length > 0) {
                 const lastChild = groupChildren[groupChildren.length - 1];
                 const lastIndex = currentFields.findIndex(f => f.id === lastChild.id);
                 if (lastIndex !== -1) insertIndex = lastIndex + 1;
             } else {
                 const groupIndex = currentFields.findIndex(f => f.id === targetFieldId);
                 if (groupIndex !== -1) insertIndex = groupIndex + 1;
             }

             if (insertIndex === -1) insertIndex = currentFields.length;

             const newFields = [...currentFields];
             newFields.splice(insertIndex, 0, newField);
             
             const ordered = newFields.map((f, i) => ({ ...f, order: i }));
             
             setActiveFields(ordered);
             updateForm({ fields: ordered });
             selectField(newField.id);
             return;
        }

        const movedFieldId = draggableId;
        const movedField = currentFields.find(f => f.id === movedFieldId);
        
        if (movedField && movedField.type !== FieldType.GROUP && movedField.type !== FieldType.PAGE_BREAK) {
          const newFields = currentFields.map(f => 
            f.id === movedFieldId ? { ...f, groupId: targetFieldId } : f
          );
          
          setActiveFields(newFields);
          updateForm({ fields: newFields });
          return;
        }
      }
    }

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    const currentFields = activeFieldsRef.current;
    const isFromSidebar = source.droppableId === 'SIDEBAR';
    const isToCanvas = destination.droppableId === 'CANVAS';
    const isToGroup = destination.droppableId.startsWith('GROUP-');
    const isFromGroup = source.droppableId.startsWith('GROUP-');
    const isFromCanvas = source.droppableId === 'CANVAS';

    // Helper to get global index offset based on current Page
    const getPageOffset = () => {
        if (currentPage <= 0) return 0;
        
        // Find index after the (currentPage)-th PAGE_BREAK
        // e.g. Page 1 (index 1) starts after 1st PAGE_BREAK
        let foundBreaks = 0;
        for (let i = 0; i < currentFields.length; i++) {
            if (currentFields[i].type === FieldType.PAGE_BREAK) {
                foundBreaks++;
                if (foundBreaks === currentPage) {
                    return i + 1;
                }
            }
        }
        return currentFields.length; // Fallback (append to end if not found)
    };

    if (isFromCanvas && isToCanvas) {
      const pageOffset = getPageOffset();
      const newFields = Array.from(currentFields);
      
      // Source Index Logic:
      // If we are dragging from CANVAS on Page X, the source.index is also relative to Page X!
      // So we need to convert source.index to global index as well.
      const globalSourceIndex = pageOffset + source.index;
      const globalDestinationIndex = pageOffset + destination.index;

      const [movedField] = newFields.splice(globalSourceIndex, 1);
      newFields.splice(globalDestinationIndex, 0, movedField);
      
      const ordered = newFields.map((f, i) => ({ ...f, order: i }));
      
      setActiveFields(ordered);
      updateForm({ fields: ordered });
      return;
    }

    if (isFromSidebar && isToCanvas) {
       const type = draggableId.replace('sidebar-', '') as FieldType;
       
       const newField: Field = {
           id: generateUUID(),
           formId: id,
           type: type,
           label: getLabelForType(type),
           required: false,
           order: destination.index,
           options: type === FieldType.GROUP ? { collapsible: true } : [],
       };

       if (newField.type === FieldType.RADIO || newField.type === FieldType.CHECKBOX || newField.type === FieldType.DROPDOWN) {
            newField.options = {
                subLabel: '',
                options: [
                    { id: generateUUID(), label: 'Option 1', value: 'Option 1' },
                    { id: generateUUID(), label: 'Option 2', value: 'Option 2' },
                    { id: generateUUID(), label: 'Option 3', value: 'Option 3' },
                ]
            };
       } else if (
           newField.type === FieldType.TEXT || 
           newField.type === FieldType.TEXTAREA ||
           newField.type === FieldType.NUMBER ||
           newField.type === FieldType.EMAIL ||
           newField.type === FieldType.PHONE ||
           newField.type === FieldType.DATE ||
           newField.type === FieldType.TIME ||
           newField.type === FieldType.RATE
       ) {
            newField.options = { subLabel: '' };
       }

       // Insert Standard Field
       const pageOffset = getPageOffset();
       const globalDestinationIndex = pageOffset + destination.index;
       
       newField.order = globalDestinationIndex; // Temporarily assign

       const newFields = Array.from(currentFields);
       // Ensure insertion index is within bounds (should be ok with splice)
       newFields.splice(globalDestinationIndex, 0, newField);
       
       const ordered = newFields.map((f, i) => ({ ...f, order: i }));
       
       setActiveFields(ordered);
       updateForm({ fields: ordered });
       selectField(newField.id);
       return;
    }

    if (isFromSidebar && isToGroup) {
      const groupId = destination.droppableId.replace('GROUP-', '');
      const type = draggableId.replace('sidebar-', '') as FieldType;
      
      if (type === FieldType.GROUP) {
        return;
      }

      const newField: Field = {
        id: generateUUID(),
        formId: id,
        type: type,
        label: getLabelForType(type),
        required: false,
        // Order will be set during re-indexing below
        order: 0, 
        groupId: groupId,
        options: {},
      };

      if (newField.type === FieldType.RADIO || newField.type === FieldType.CHECKBOX || newField.type === FieldType.DROPDOWN) {
        newField.options = {
          subLabel: 'Sublabel',
          options: [
            { id: generateUUID(), label: 'Option 1', value: 'Option 1' },
            { id: generateUUID(), label: 'Option 2', value: 'Option 2' },
            { id: generateUUID(), label: 'Option 3', value: 'Option 3' },
          ]
        };
      } else if (
        newField.type === FieldType.TEXT || 
        newField.type === FieldType.TEXTAREA ||
        newField.type === FieldType.NUMBER ||
        newField.type === FieldType.EMAIL ||
        newField.type === FieldType.PHONE ||
        newField.type === FieldType.DATE ||
        newField.type === FieldType.TIME ||
        newField.type === FieldType.RATE
      ) {
        newField.options = { subLabel: 'Sublabel' };
      }



      // 1. Find the exact global insertion index
      const groupChildren = currentFields
          .filter(f => f.groupId === groupId)
          .sort((a, b) => a.order - b.order);

      let insertIndex = -1;

      if (groupChildren.length === 0) {
          // No children? Insert right after the group
          const groupIndex = currentFields.findIndex(f => f.id === groupId);
          if (groupIndex !== -1) insertIndex = groupIndex + 1;
      } else {
          if (destination.index < groupChildren.length) {
              // Inserting before a specific child
              const targetChild = groupChildren[destination.index];
              insertIndex = currentFields.findIndex(f => f.id === targetChild.id);
          } else {
              // Appending after the last child
              const lastChild = groupChildren[groupChildren.length - 1];
              const lastChildIndex = currentFields.findIndex(f => f.id === lastChild.id);
              if (lastChildIndex !== -1) insertIndex = lastChildIndex + 1;
          }
      }

      // Safety fallback
      if (insertIndex === -1) {
         // Should not happen if group exists, but just append if lost
         insertIndex = currentFields.length;
      }

      // 2. Insert the field
      const newFields = [...currentFields];
      newFields.splice(insertIndex, 0, newField);

      // 3. Global Re-index
      const ordered = newFields.map((f, i) => ({ ...f, order: i }));

      setActiveFields(ordered);
      updateForm({ fields: ordered });
      selectField(newField.id);
      return;
    }

    if (isFromCanvas && isToGroup) {
      const groupId = destination.droppableId.replace('GROUP-', '');
      const movedFieldId = draggableId;
      
      const newFields = currentFields.map(f => 
        f.id === movedFieldId ? { ...f, groupId: groupId } : f
      );
      
      setActiveFields(newFields);
      updateForm({ fields: newFields });
      return;
    }

    if (isFromGroup && isToCanvas) {
      const movedFieldId = draggableId;
      
      const newFields = currentFields.map(f => 
        f.id === movedFieldId ? { ...f, groupId: undefined } : f
      );
      
      const reordered = Array.from(newFields.filter(f => !f.groupId || f.type === FieldType.GROUP));
      const fieldToMove = reordered.find(f => f.id === movedFieldId);
      if (fieldToMove) {
        const fromIndex = reordered.indexOf(fieldToMove);
        reordered.splice(fromIndex, 1);
        reordered.splice(destination.index, 0, fieldToMove);
      }
      
      const ordered = newFields.map((f, i) => ({ ...f, order: i }));
      setActiveFields(ordered);
      updateForm({ fields: ordered });
      return;
    }

    if (isFromGroup && isToGroup) {
      const sourceGroupId = source.droppableId.replace('GROUP-', '');
      const destGroupId = destination.droppableId.replace('GROUP-', '');
      const movedFieldId = draggableId;
      
      if (sourceGroupId === destGroupId) {
        const groupChildren = currentFields
          .filter(f => f.groupId === sourceGroupId)
          .sort((a, b) => a.order - b.order);
        
        const [movedField] = groupChildren.splice(source.index, 1);
        groupChildren.splice(destination.index, 0, movedField);
        
        const updatedChildren = groupChildren.map((f, i) => ({ ...f, order: i }));
        
        const newFields = currentFields.map(f => {
          const updated = updatedChildren.find(u => u.id === f.id);
          return updated ? updated : f;
        });
        
        setActiveFields(newFields);
        updateForm({ fields: newFields });
        return;
      }
      
      const newFields = currentFields.map(f => 
        f.id === movedFieldId ? { ...f, groupId: destGroupId } : f
      );
      
      setActiveFields(newFields);
      updateForm({ fields: newFields });
      return;
    }
  };

  // Helper to get default label
  const getLabelForType = (type: FieldType): string => {
      switch (type) {
          case FieldType.TEXT: return 'Short Text';
          case FieldType.TEXTAREA: return 'Long Text';
          case FieldType.NUMBER: return 'Number';
          case FieldType.EMAIL: return 'Email';
          case FieldType.PHONE: return 'Phone';
          case FieldType.DATE: return 'Date';
          case FieldType.TIME: return 'Time';
          case FieldType.RADIO: return 'Single Choice';
          case FieldType.CHECKBOX: return 'Multiple Choice';
          case FieldType.DROPDOWN: return 'Dropdown';
          case FieldType.HEADER: return 'Header';
          case FieldType.PARAGRAPH: return 'Paragraph';
          case FieldType.DIVIDER: return 'Separator';
          case FieldType.PAGE_BREAK: return 'Page Break';
          case FieldType.RATE: return 'Rating';
          case FieldType.ADDRESS: return 'Address';
          case FieldType.SUBMIT: return 'Submit Button';
          case FieldType.GROUP: return 'Field Group';
          default: return 'Field';
      }
  };

  return { onDragEnd, onDragStart, isDragging };
}
