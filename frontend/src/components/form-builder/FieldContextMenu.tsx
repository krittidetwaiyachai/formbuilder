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
import { useTranslation } from 'react-i18next';
import { Field, FieldType } from '@/types';
import { useFormStore } from '@/store/formStore';

interface FieldContextMenuProps {
  field: Field;
  position: { x: number; y: number };
  onClose: () => void;
  onDelete: () => void;
}

export function FieldContextMenu({ field, position, onClose, onDelete }: FieldContextMenuProps) {
  const { t } = useTranslation();
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

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  
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
    
    if (!idsToGroup.includes(field.id)) idsToGroup.push(field.id);

    
    const fieldsToGroup = currentForm.fields
        .filter(f => idsToGroup.includes(f.id))
        .sort((a, b) => a.order - b.order);

    if (fieldsToGroup.length === 0) return;

    const minOrder = fieldsToGroup[0].order;

    
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

    
    const newFields = currentForm.fields.map(f => {
        if (idsToGroup.includes(f.id)) {
            return { ...f, groupId: newGroupId };
        }
        
        
        
        return f;
    });

    
    
    
    
    newFields.splice(minOrder, 0, groupField);

    
    newFields.forEach((f, i) => f.order = i);

    updateForm({ fields: newFields });
    selectField(newGroupId); 
  };

  const menuItems = [
    ...(isMultiSelect ? [
      {
          icon: <Layers className="w-4 h-4 text-gray-700" />,
          label: t('builder.context.group'),
          onClick: handleGroupFields,
      }
    ] : []),
    {
      icon: <Asterisk className="w-4 h-4 text-gray-700" />,
      label: field.required ? t('builder.context.optional') : t('builder.context.require'),
      onClick: () => updateField(field.id, { required: !field.required }),
    },
    {
      icon: <Copy className="w-4 h-4 text-gray-700" />,
      label: t('builder.context.duplicate'),
      onClick: () => duplicateField(field.id),
    },
    {
      icon: field.shrink ? <ArrowRightFromLine className="w-4 h-4 text-gray-700" /> : <ArrowLeftFromLine className="w-4 h-4 text-gray-700" />,
      label: field.shrink ? t('builder.context.unshrink') : t('builder.context.shrink'),
      onClick: () => updateField(field.id, { shrink: !field.shrink }),
    },
    {
      icon: <EyeOff className="w-4 h-4 text-gray-700" />,
      label: (field.options?.hidden) ? t('builder.context.unhide') : t('builder.context.hide'),
      onClick: () => {
        updateField(field.id, { 
            options: { ...field.options, hidden: !field.options?.hidden } 
        });
      },
    },
     
    { type: 'divider' },
    {
      icon: <ArrowUp className="w-4 h-4 text-gray-700" />,
      label: t('builder.context.move_up'),
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
      label: t('builder.context.move_down'),
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
        label: t('builder.context.move_start'),
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
        label: t('builder.context.move_end'),
        onClick: () => {
            if (!currentForm?.fields) return;
            const currentIndex = currentForm.fields.findIndex(f => f.id === field.id);
            if (currentIndex < currentForm.fields.length - 1) {
                moveField(currentIndex, currentForm.fields.length - 1);
            }
        },
    },
     
    { type: 'divider' },
    
    ...(!isMultiSelect ? [{
      icon: <GitFork className="w-4 h-4 text-gray-700" />,
      label: t('builder.context.logic'),
      onClick: () => {
          selectField(field.id);
          setActiveSidebarTab('logic');
      },
    }] : []),
     
    { type: 'divider' },
    {
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      label: t('builder.context.delete'),
      onClick: () => {
        onDelete();
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
