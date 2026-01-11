import React from 'react';
import { Field } from '@/types';
import { useFormStore } from '@/store/formStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface LogicPropertiesProps {
  field: Field;
}

export const LogicProperties: React.FC<LogicPropertiesProps> = ({ field }) => {
  const { currentForm, addCondition, updateCondition, deleteCondition } = useFormStore();
  const conditions = currentForm?.conditions || [];
  
  // Filter conditions where this field is the SOURCE
  const fieldConditions = conditions.filter(c => c.sourceFieldId === field.id);

  // Available target fields (excluding self)
  const targetFields = currentForm?.fields?.filter(f => f.id !== field.id) || [];

  const handleAddCondition = () => {
    addCondition({
      sourceFieldId: field.id,
      targetFieldId: targetFields.length > 0 ? targetFields[0].id : '',
      operator: 'EQUALS',
      value: '',
      action: 'SHOW',
    });
  };

  const getSourceOptions = () => {
    // Helper to extract options if the field is a Choice field
    if (['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(field.type)) {
      const opts = field.options;
      if (Array.isArray(opts)) {
          // Legacy or simple array
          if (opts.length > 0 && typeof opts[0] === 'object') {
             return opts.map((o: any) => o.value || o.label);
          }
          return opts;
      }
      if (opts?.items && Array.isArray(opts.items)) {
          return opts.items.map((o: any) => o.value || o.label);
      }
    }
    return null;
  };

  const sourceOptions = getSourceOptions();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {fieldConditions.map((condition, index) => (
          <div key={condition.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 relative group">
            <button
               onClick={() => deleteCondition(condition.id)}
               className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Operator</Label>
                    <Select
                        className="h-8 text-xs bg-white"
                        value={condition.operator}
                        onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                    >
                        <option value="EQUALS">Equals</option>
                        <option value="NOT_EQUALS">Not Equals</option>
                        <option value="CONTAINS">Contains</option>
                        <option value="NOT_CONTAINS">Not Contains</option>
                        <option value="IS_EMPTY">Is Empty</option>
                        <option value="IS_NOT_EMPTY">Is Not Empty</option>
                        {/* Numeric operators could act on strings too often */}
                        <option value="GREATER_THAN">Greater Than</option>
                        <option value="LESS_THAN">Less Than</option>
                    </Select>
                </div>
                
                <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Value</Label>
                     {/* Smart Input: Dropdown if source has options, else Text */}
                     {sourceOptions && !['IS_EMPTY', 'IS_NOT_EMPTY'].includes(condition.operator) ? (
                        <Select
                            className="h-8 text-xs bg-white"
                            value={condition.value}
                            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                        >
                            <option value="">Select Value...</option>
                            {sourceOptions.map((opt: string, i: number) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </Select>
                     ) : (
                        <Input 
                            value={condition.value}
                            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                            className="h-8 text-xs bg-white"
                            disabled={['IS_EMPTY', 'IS_NOT_EMPTY'].includes(condition.operator)}
                            placeholder={['IS_EMPTY', 'IS_NOT_EMPTY'].includes(condition.operator) ? '(No value needed)' : 'Value'}
                        />
                     )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">Then</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                 <div className="col-span-1 space-y-1">
                    <Label className="text-xs text-gray-500">Action</Label>
                    <Select
                        className="h-8 text-xs font-semibold text-blue-600 bg-blue-50 border-blue-100"
                        value={condition.action}
                        onChange={(e) => updateCondition(condition.id, { action: e.target.value })}
                    >
                        <option value="SHOW">Show</option>
                        <option value="HIDE">Hide</option>
                    </Select>
                 </div>
                 
                 <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-gray-500">Target Field</Label>
                    <Select
                        className="h-8 text-xs bg-white"
                        value={condition.targetFieldId}
                        onChange={(e) => updateCondition(condition.id, { targetFieldId: e.target.value })}
                    >
                        <option value="">Select Field...</option>
                        {targetFields.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.label || f.id}
                            </option>
                        ))}
                    </Select>
                 </div>
            </div>

          </div>
        ))}

        {fieldConditions.length === 0 && (
             <div className="text-center py-8 text-gray-500 bg-gray-50/50 border border-dashed border-gray-200 rounded-lg">
                 <p className="text-sm">No logic rules for this field.</p>
             </div>
        )}

        {targetFields.length === 0 ? (
             <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                Add more fields to the form to use conditional logic.
             </div>
        ) : (
            <Button 
                onClick={handleAddCondition}
                variant="outline" 
                className="w-full border-dashed"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
            </Button>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-600 space-y-1">
          <p className="font-semibold">Logic Guide:</p>
          <ul className="list-disc pl-4 space-y-1">
              <li><strong>Show:</strong> The target field will be HIDDEN by default, and only appear if this rule is met.</li>
              <li><strong>Hide:</strong> The target field will be visible, but disappear if this rule is met.</li>
          </ul>
      </div>
    </div>
  );
};
