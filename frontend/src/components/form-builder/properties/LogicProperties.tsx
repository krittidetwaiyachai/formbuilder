import React from 'react';
import { Field } from '@/types';
import { useFormStore } from '@/store/formStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

import { useTranslation } from 'react-i18next';

interface LogicPropertiesProps {
  field: Field;
}

export const LogicProperties: React.FC<LogicPropertiesProps> = ({ field }) => {
  const { t } = useTranslation();
  const { currentForm, addCondition, updateCondition, deleteCondition } = useFormStore();
  const conditions = currentForm?.conditions || [];
  
  
  const fieldConditions = conditions.filter(c => c.sourceFieldId === field.id);

  
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
    
    if (['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(field.type)) {
      const opts = field.options;
      if (Array.isArray(opts)) {
          
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
        {fieldConditions.map((condition) => (
          <div key={condition.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 relative group">
            <button
               onClick={() => deleteCondition(condition.id)}
               className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <Label className="text-xs text-gray-500">{t('builder.logic.label_operator')}</Label>
                    <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(condition.id, { operator: value })}
                    >
                        <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder={t('builder.logic.placeholder_operator')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EQUALS">{t('builder.logic.op.equals')}</SelectItem>
                            <SelectItem value="NOT_EQUALS">{t('builder.logic.op.not_equals')}</SelectItem>
                            <SelectItem value="CONTAINS">{t('builder.logic.op.contains')}</SelectItem>
                            <SelectItem value="NOT_CONTAINS">{t('builder.logic.op.not_contains')}</SelectItem>
                            <SelectItem value="IS_EMPTY">{t('builder.logic.op.is_empty')}</SelectItem>
                            <SelectItem value="IS_NOT_EMPTY">{t('builder.logic.op.is_not_empty')}</SelectItem>
                            <SelectItem value="GREATER_THAN">{t('builder.logic.op.greater_than')}</SelectItem>
                            <SelectItem value="LESS_THAN">{t('builder.logic.op.less_than')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-1">
                    <Label className="text-xs text-gray-500">{t('builder.logic.label_value')}</Label>
                     { }
                     {sourceOptions && !['IS_EMPTY', 'IS_NOT_EMPTY'].includes(condition.operator) ? (
                        <Select
                            value={condition.value}
                            onValueChange={(value) => updateCondition(condition.id, { value })}
                        >
                            <SelectTrigger className="h-8 text-xs bg-white">
                                <SelectValue placeholder={t('builder.logic.placeholder_value')} />
                            </SelectTrigger>
                            <SelectContent>
                                {sourceOptions.map((opt: string, i: number) => (
                                    <SelectItem key={i} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     ) : (
                        <Input 
                            value={condition.value}
                            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                            className="h-8 text-xs bg-white"
                            disabled={['IS_EMPTY', 'IS_NOT_EMPTY'].includes(condition.operator)}
                            placeholder={['IS_EMPTY', 'IS_NOT_EMPTY'].includes(condition.operator) ? t('builder.logic.placeholder_no_value') : t('builder.logic.placeholder_value_text')}
                        />
                     )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">{t('builder.logic.label_then')}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                 <div className="col-span-1 space-y-1">
                    <Label className="text-xs text-gray-500">{t('builder.logic.label_action')}</Label>
                    <Select
                        value={condition.action}
                        onValueChange={(value) => updateCondition(condition.id, { action: value })}
                    >
                        <SelectTrigger className="h-8 text-xs font-semibold text-blue-600 bg-blue-50 border-blue-100">
                             <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SHOW">{t('builder.logic.action_show')}</SelectItem>
                            <SelectItem value="HIDE">{t('builder.logic.action_hide')}</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 
                 <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-gray-500">{t('builder.logic.label_target')}</Label>
                    <Select
                        value={condition.targetFieldId}
                        onValueChange={(value) => updateCondition(condition.id, { targetFieldId: value })}
                    >
                        <SelectTrigger className="h-8 text-xs bg-white">
                             <SelectValue placeholder={t('builder.logic.placeholder_target')} />
                        </SelectTrigger>
                        <SelectContent>
                            {targetFields.map((f) => (
                                <SelectItem key={f.id} value={f.id}>
                                    {f.label || f.id}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </div>

          </div>
        ))}

        {fieldConditions.length === 0 && (
             <div className="text-center py-8 text-gray-500 bg-gray-50/50 border border-dashed border-gray-200 rounded-lg">
                 <p className="text-sm">{t('builder.logic.no_rules')}</p>
             </div>
        )}

        {targetFields.length === 0 ? (
             <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                {t('builder.logic.add_fields_warning')}
             </div>
        ) : (
            <Button 
                onClick={handleAddCondition}
                variant="outline" 
                className="w-full border-dashed"
            >
                <Plus className="h-4 w-4 mr-2" />
                {t('builder.logic.add_rule')}
            </Button>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-600 space-y-1">
          <p className="font-semibold">{t('builder.logic.guide_title')}</p>
          <ul className="list-disc pl-4 space-y-1">
              <li><strong>{t('builder.logic.action_show')}:</strong> {t('builder.logic.guide_show')}</li>
              <li><strong>{t('builder.logic.action_hide')}:</strong> {t('builder.logic.guide_hide')}</li>
          </ul>
      </div>
    </div>
  );
};
