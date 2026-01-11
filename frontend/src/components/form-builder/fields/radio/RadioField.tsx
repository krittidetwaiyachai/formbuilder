import React, { useState, useRef, useCallback } from 'react';
import { Field } from '@/types';
import { Plus, X, GripVertical } from 'lucide-react';
import { useFormStore } from '@/store/formStore';

interface RadioFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
  updateField?: (id: string, updates: Partial<Field>) => void;
  isSelected?: boolean;
}

export const RadioField: React.FC<RadioFieldProps> = ({ 
  field, 
  fieldStyle, 
  disabledClass = "opacity-60 cursor-pointer",
  updateField: propUpdateField,
  isSelected: propIsSelected
}) => {
  const { updateField: storeUpdateField, selectedFieldId } = useFormStore();
  const updateField = propUpdateField || storeUpdateField;
  const isSelected = propIsSelected !== undefined ? propIsSelected : (selectedFieldId === field.id);

  const [newOptionText, setNewOptionText] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Robust getOptions to handle Object structure
  const getOptionsRobust = (): { label: string; value: string }[] => {
       let rawOptions = field.options;
       if (!rawOptions) return [];
       if (Array.isArray(rawOptions)) {
           // Legacy Array: Convert to object array if needed
            if (rawOptions.length > 0 && typeof rawOptions[0] === 'object') {
                return rawOptions as unknown as { label: string; value: string }[];
            }
           return rawOptions.map(o => typeof o === 'string' ? {label:o, value:o} : o);
       }
       // Object wrapper
       if (rawOptions.items && Array.isArray(rawOptions.items)) {
           return rawOptions.items.map((o: any) => typeof o === 'string' ? {label:o, value:o} : o);
       }
       return [];
  }

  const options = getOptionsRobust();
  const optionsObj = (field.options && !Array.isArray(field.options)) ? field.options : {};
  const validation = field.validation || {};
  
  const spreadToColumns = optionsObj.spreadToColumns || validation.spreadToColumns;
  const columns = optionsObj.columns || validation.columns || 2;
  const otherOption = optionsObj.otherOption || validation.otherOption;


  
  const handleAddOption = () => {
    if (!updateField) return;
    const optionText = newOptionText.trim() || `Option ${options.length + 1}`;
    const newOption = { label: optionText, value: optionText };
    
    const newItems = [...options, newOption];
    let newOptionsObj: any;
    if (Array.isArray(field.options)) {
         newOptionsObj = { items: newItems };
    } else {
         newOptionsObj = { ...field.options, items: newItems };
    }
    updateField(field.id, { options: newOptionsObj });
    setNewOptionText('');
  };

  const handleRemoveOption = (index: number) => {
    if (!updateField) return;
    const newItems = options.filter((_, i) => i !== index);
    const newOptionsObj = Array.isArray(field.options) 
        ? { items: newItems } 
        : { ...field.options, items: newItems };
    updateField(field.id, { options: newOptionsObj });
  };

  const handleUpdateOption = (index: number, newLabel: string) => {
    if (!updateField) return;
    const newItems = options.map((opt, i) => 
      i === index ? { label: newLabel, value: newLabel } : opt
    );
    const newOptionsObj = Array.isArray(field.options) 
        ? { items: newItems } 
        : { ...field.options, items: newItems };
    updateField(field.id, { options: newOptionsObj });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    setTargetIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const calculateTargetIndex = useCallback((clientY: number) => {
    const items = itemRefs.current.filter(Boolean);
    if (items.length === 0) return null;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      
      const rect = item.getBoundingClientRect();
      const midPoint = rect.top + rect.height / 2;
      
      if (clientY < midPoint) {
        return i;
      }
    }
    
    return items.length;
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragIndex === null) return;
    
    const newTarget = calculateTargetIndex(e.clientY);
    if (newTarget !== null && newTarget !== targetIndex) {
      setTargetIndex(newTarget);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (dragIndex !== null && targetIndex !== null && updateField) {
      const actualTarget = targetIndex > dragIndex ? targetIndex - 1 : targetIndex;
      
      if (actualTarget !== dragIndex) {
        const newItems = [...options];
        const [draggedItem] = newItems.splice(dragIndex, 1);
        newItems.splice(actualTarget, 0, draggedItem);
        const newOptionsObj = Array.isArray(field.options) 
            ? { items: newItems } 
            : { ...field.options, items: newItems };
        updateField(field.id, { options: newOptionsObj });
      }
    }
    
    setDragIndex(null);
    setTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setTargetIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

  const getTransformStyle = (index: number): React.CSSProperties => {
    if (dragIndex === null || targetIndex === null) {
      return { transform: 'translateY(0px)', transition: 'transform 150ms ease' };
    }
    
    const itemHeight = 44;
    
    if (index === dragIndex) {
      return { 
        opacity: 0, 
        transform: 'translateY(0px)',
        transition: 'transform 150ms ease, opacity 150ms ease'
      };
    }
    
    if (dragIndex < targetIndex) {
      if (index > dragIndex && index < targetIndex) {
        return { transform: `translateY(-${itemHeight}px)`, transition: 'transform 150ms ease' };
      }
    } else {
      if (index >= targetIndex && index < dragIndex) {
        return { transform: `translateY(${itemHeight}px)`, transition: 'transform 150ms ease' };
      }
    }
    
    return { transform: 'translateY(0px)', transition: 'transform 150ms ease' };
  };

  if (isSelected && updateField) {
    return (
      <div className="w-full space-y-2" onClick={(e) => e.stopPropagation()}>
        <div 
          ref={containerRef}
          className="relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {options.map((opt, idx) => (
            <div 
              key={idx}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className="flex items-center gap-2 group mb-1"
              style={getTransformStyle(idx)}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors">
                <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </div>
              <div className="w-5 h-5 border-2 border-pink-300 rounded-full shrink-0" />
              <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:border-gray-300 transition-all">
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => handleUpdateOption(idx, e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
                  placeholder={`Option ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6" />
          <div className="w-5 h-5 border-2 border-dashed border-gray-300 rounded-full shrink-0" />
          <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3 py-2 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <button
              type="button"
              onClick={handleAddOption}
              className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddOption}
              className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none placeholder:text-gray-400"
              placeholder="Add option..."
            />
          </div>
        </div>
        
        {options.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">
            No options yet. Type above to add.
          </p>
        )}
        

      </div>
    );
  }

  return (
    <div className={`pt-1 ${spreadToColumns ? 'grid gap-3' : 'space-y-3'}`} style={spreadToColumns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : {}}>
      {options.length > 0 ? options.map((opt: any, idx: number) => (
        <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:bg-pink-50/50 transition-colors duration-200 group">
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-6 h-6 border-2 border-pink-200 rounded-full group-hover/field:border-pink-500 transition-colors"></div>
            {idx === 0 && <div className="absolute w-3 h-3 bg-pink-500 rounded-full"></div>}
          </div>
          <span className="text-base font-medium text-gray-700">{opt.label || opt.value || opt}</span>
        </div>
      )) : (
        <div className="flex items-center gap-4 p-3 text-gray-400 italic">
          <div className="w-6 h-6 border-2 border-gray-200 rounded-full"></div>
          <span>Click to add options</span>
        </div>
      )}
      {otherOption && (
        <div className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:bg-pink-50/50 transition-colors duration-200 group">
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-6 h-6 border-2 border-pink-200 rounded-full group-hover/field:border-pink-500 transition-colors"></div>
          </div>
          <span className="text-base font-medium text-gray-700">Other</span>
          <div className="ml-2 px-2 py-1 border-b border-gray-300 w-full text-xs text-gray-400 italic">type here...</div>
        </div>
      )}
      

    </div>
  );
};
