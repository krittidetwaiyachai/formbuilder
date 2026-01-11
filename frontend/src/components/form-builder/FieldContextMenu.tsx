import React, { useEffect, useRef } from 'react';
import { 
  Asterisk, 
  Copy, 
  ArrowLeftFromLine, 
  ArrowRightFromLine,
  EyeOff, 
  ArrowUp,
  ArrowUpToLine,
  ArrowDown, 
  ArrowDownToLine, 
  GitFork, 
  Trash2,
  Layers
} from 'lucide-react';
import { Field, FieldType } from '@/types';
import { useFormStore } from '@/store/formStore';

interface FieldContextMenuProps {
  field: Field;
  position: { x: number; y: number };
  onClose: () => void;
}

export function FieldContextMenu({ field, position, onClose }: FieldContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const updateField = useFormStore((state) => state.updateField);
  const duplicateField = useFormStore((state) => state.duplicateField);
  const deleteField = useFormStore((state) => state.deleteField);
  const moveField = useFormStore((state) => state.reorderFields);
  const setActiveSidebarTab = useFormStore((state) => state.setActiveSidebarTab);
  const selectField = useFormStore((state) => state.selectField);
  const currentForm = useFormStore((state) => state.currentForm);
  const updateForm = useFormStore((state) => state.updateForm);
  const selectedFieldId = useFormStore((state) => state.selectedFieldId);
  const additionalSelectedIds = useFormStore((state) => state.additionalSelectedIds);

  const isMultiSelect = additionalSelectedIds.length > 0 && 
                        (selectedFieldId === field.id || additionalSelectedIds.includes(field.id));

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position to stay within viewport
  const style: React.CSSProperties = {
    top: position.y,
    left: position.x,
  };

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const handleGroupFields = () => {
    if (!currentForm?.fields) return;

    const idsToGroup = [selectedFieldId, ...additionalSelectedIds].filter(Boolean) as string[];
    // Ensure the clicked field is included if somehow not selected (though handled by CanvasArea)
    if (!idsToGroup.includes(field.id)) idsToGroup.push(field.id);

    // Get actual field objects sorted by current order
    const fieldsToGroup = currentForm.fields
        .filter(f => idsToGroup.includes(f.id))
        .sort((a, b) => a.order - b.order);

    if (fieldsToGroup.length === 0) return;

    const minOrder = fieldsToGroup[0].order;

    // Create new Group Field
    const newGroupId = crypto.randomUUID();
    const groupField: Field = {
        id: newGroupId,
        formId: currentForm.id,
        type: FieldType.GROUP,
        label: 'Field Group',
        order: minOrder,
        required: false,
        options: { collapsible: true }
    };

    // Update existing fields (modify groupId) and Insert Group Field
    const newFields = currentForm.fields.map(f => {
        if (idsToGroup.includes(f.id)) {
            return { ...f, groupId: newGroupId };
        }
        // Shift fields that were below group (if any) - simplified, 
        // actually inserting at minOrder merely pushes indices?
        // Let's insert the group and update valid fields.
        return f;
    });

    // Insert Group Field at minOrder
    // Careful: if we just insert, we shift indices.
    // The previous fields still exist but are now children (hidden from top level).
    // So inserting at minOrder works fine visually.
    newFields.splice(minOrder, 0, groupField);

    // Re-index all (cleanest approach)
    newFields.forEach((f, i) => f.order = i);

    updateForm({ fields: newFields });
    selectField(newGroupId); // Select the new group
  };

  const menuItems = [
    ...(isMultiSelect ? [
      {
          icon: <Layers className="w-4 h-4 text-gray-700" />,
          label: 'Group',
          onClick: handleGroupFields,
      }
    ] : []),
    {
      icon: <Asterisk className="w-4 h-4 text-gray-700" />,
      label: field.required ? 'Optional' : 'Require',
      onClick: () => updateField(field.id, { required: !field.required }),
    },
    {
      icon: <Copy className="w-4 h-4 text-gray-700" />,
      label: 'Duplicate',
      onClick: () => duplicateField(field.id),
    },
    {
      icon: field.shrink ? <ArrowRightFromLine className="w-4 h-4 text-gray-700" /> : <ArrowLeftFromLine className="w-4 h-4 text-gray-700" />,
      label: field.shrink ? 'Unshrink' : 'Shrink',
      onClick: () => updateField(field.id, { shrink: !field.shrink }),
    },
    {
      icon: <EyeOff className="w-4 h-4 text-gray-700" />,
      label: (field.options?.hidden) ? 'Unhide' : 'Hide',
      onClick: () => {
        updateField(field.id, { 
            options: { ...field.options, hidden: !field.options?.hidden } 
        });
      },
    },
    /* Divider */
    { type: 'divider' },
    {
      icon: <ArrowUp className="w-4 h-4 text-gray-700" />,
      label: 'Move Up',
      onClick: () => {
        if (!currentForm?.fields) return;
        const currentIndex = currentForm.fields.findIndex(f => f.id === field.id);
        if (currentIndex > 0) {
             moveField(currentIndex, currentIndex - 1);
        }
      },
    },
    {
      icon: <ArrowDown className="w-4 h-4 text-gray-700" />,
      label: 'Move Down',
      onClick: () => {
        if (!currentForm?.fields) return;
        const currentIndex = currentForm.fields.findIndex(f => f.id === field.id);
        if (currentIndex < currentForm.fields.length - 1) {
             moveField(currentIndex, currentIndex + 1);
        }
      },
    },
    {
        icon: <ArrowUpToLine className="w-4 h-4 text-gray-700" />,
        label: 'Move to Start',
        onClick: () => {
            if (!currentForm?.fields) return;
            const currentIndex = currentForm.fields.findIndex(f => f.id === field.id);
            if (currentIndex > 0) {
                moveField(currentIndex, 0);
            }
        },
    },
    {
        icon: <ArrowDownToLine className="w-4 h-4 text-gray-700" />,
        label: 'Move to End',
        onClick: () => {
            if (!currentForm?.fields) return;
            const currentIndex = currentForm.fields.findIndex(f => f.id === field.id);
            if (currentIndex < currentForm.fields.length - 1) {
                moveField(currentIndex, currentForm.fields.length - 1);
            }
        },
    },
    /* Divider */
    { type: 'divider' },
    // Show Logic only if NOT Multi-select
    ...(!isMultiSelect ? [{
      icon: <GitFork className="w-4 h-4 text-gray-700" />,
      label: 'Conditional logic',
      onClick: () => {
          selectField(field.id);
          setActiveSidebarTab('logic');
      },
    }] : []),
    /* Divider */
    { type: 'divider' },
    {
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      label: 'Delete',
      onClick: () => {
        if (confirm('Are you sure you want to delete this field?')) {
             deleteField(field.id);
        }
      },
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-100 py-1.5 w-60 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5"
      style={style}
    >
      {menuItems.map((item, index) => {
        if (item.type === 'divider') {
          return <div key={index} className="h-px bg-gray-100 my-1" />;
        }
        return (
          <button
            key={index}
            onClick={(e) => {
                e.stopPropagation();
                if (item.onClick) handleAction(item.onClick);
            }}
            className="w-full flex items-center px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-black transition-colors gap-3 group font-medium"
          >
            <span className="flex items-center justify-center w-5 h-5 group-hover:scale-105 transition-transform text-gray-400 group-hover:text-black">
                {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
