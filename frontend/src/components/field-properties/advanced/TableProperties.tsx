import { useState } from 'react';
import { Field } from '@/types';
import { Plus, X, GripVertical, Copy } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { stripHtml } from '@/lib/ui/utils';
import { PropertiesTabs } from '../common/PropertiesTabs';
import { useTranslation } from 'react-i18next';

interface TablePropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Field) => void;
}

export function TableProperties({ field, updateField, duplicatesField }: TablePropertiesProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'columns' | 'advanced'>('general');

  const columns = field.options?.columns || [{ id: 'c1', label: t('builder.properties.column') + ' 1' }, { id: 'c2', label: t('builder.properties.column') + ' 2' }];
  const options = field.options || {};
  const allowAddRow = field.options?.allowAddRow !== undefined ? field.options.allowAddRow : true;

  const handleUpdate = (updates: any) => {
    updateField(field.id, updates);
  };

  const handleOptionUpdate = (key: string, value: any) => {
    handleUpdate({
      options: {
        ...field.options,
        [key]: value,
      },
    });
  };

  const updateColumns = (newCols: any[]) => {
    handleOptionUpdate('columns', newCols);
  };

  const addColumn = () => {
    const newId = `c${Date.now()}`;
    updateColumns([...columns, { id: newId, label: `${t('builder.properties.column')} ${columns.length + 1}` }]);
  };

  const removeColumn = (index: number) => {
    const newCols = [...columns];
    newCols.splice(index, 1);
    updateColumns(newCols);
  };

  const updateColumnLabel = (index: number, label: string) => {
    const newCols = [...columns];
    newCols[index].label = label;
    updateColumns(newCols);
  };

  const handleDragEndColumns = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateColumns(items);
  };

  
  const applyTemplate = (type: string) => {
      if (type === 'person') {
          updateColumns([
              { id: `c${Date.now()}_1`, label: t('builder.properties.first_name') + ' / ' + t('builder.properties.last_name') },
              { id: `c${Date.now()}_2`, label: t('builder.field.role') },
              { id: `c${Date.now()}_3`, label: t('builder.fields.email') }
          ]);
      } else if (type === 'address') {
           updateColumns([
              { id: `c${Date.now()}_1`, label: t('builder.properties.street_address_1') },
              { id: `c${Date.now()}_2`, label: t('builder.properties.city') },
              { id: `c${Date.now()}_3`, label: t('builder.properties.postal_zip') }
          ]);
      } else if (type === 'inventory') {
           updateColumns([
              { id: `c${Date.now()}_1`, label: t('builder.field.item_name') },
              { id: `c${Date.now()}_2`, label: t('builder.field.quantity') },
              { id: `c${Date.now()}_3`, label: t('builder.field.price') },
              { id: `c${Date.now()}_4`, label: t('builder.field.total') }
          ]);
      }
  };

  return (
    <div className="space-y-4">
      { }
      { }
      <PropertiesTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tabs={['general', 'columns', 'advanced']} 
      />

      { }
      {activeTab === 'general' && (
        <div className="space-y-4">
          { }
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              {t('builder.properties.field_label')}
            </label>
            <input
              type="text"
              value={stripHtml(field.label)}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
            />
          </div>

          { }
          <div>
             <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.required')}
            </label>
             <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => handleUpdate({ required: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.min_one_row')}
            </p>
          </div>

          { }
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              {t('builder.properties.sublabel')}
            </label>
            <input
              type="text"
              value={options.subLabel || ''}
              onChange={(e) => handleOptionUpdate('subLabel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              placeholder={t('builder.properties.sublabel')}
            />
          </div>

           { }
           <div>
             <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.allow_add_row')}
            </label>
             <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowAddRow}
                onChange={(e) => handleOptionUpdate('allowAddRow', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.allow_add_row_desc')}
            </p>
          </div>

          { }
          <button
            type="button"
            onClick={() => duplicatesField({
               ...field,
               id: undefined,
            } as any)}
            className="w-full mt-4 px-3 py-2 text-sm font-medium text-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {t('builder.properties.duplicate')}
          </button>
        </div>
      )}

      { }
      {activeTab === 'columns' && (
        <div className="space-y-6">
          
          { }
           <div className="grid grid-cols-3 gap-2 mb-4">
                <button onClick={() => applyTemplate('person')} className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 rounded text-center">
                    {t('builder.templates.person')}
                </button>
                 <button onClick={() => applyTemplate('address')} className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 rounded text-center">
                    {t('builder.templates.address')}
                </button>
                 <button onClick={() => applyTemplate('inventory')} className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 rounded text-center">
                    {t('builder.templates.inventory')}
                </button>
           </div>

          { }
          <div>
              <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-black">{t('builder.properties.columns_defined')}</label>
                  <button 
                      onClick={addColumn}
                      className="p-1 hover:bg-gray-100 rounded-full text-indigo-600 transition-colors"
                  >
                      <Plus className="w-4 h-4" />
                  </button>
              </div>
              
              <DragDropContext onDragEnd={handleDragEndColumns}>
                  <Droppable droppableId="table-cols">
                      {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                              {columns.map((col: any, index: number) => (
                                  <Draggable key={col.id} draggableId={col.id} index={index}>
                                      {(provided) => (
                                          <div 
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className="flex items-center gap-2 group"
                                          >
                                              <div {...provided.dragHandleProps} className="text-gray-300 cursor-move hover:text-gray-500" style={{ touchAction: 'none' }}>
                                                  <GripVertical className="w-4 h-4" />
                                              </div>
                                              <input
                                                  type="text"
                                                  value={col.label}
                                                  onChange={(e) => updateColumnLabel(index, e.target.value)}
                                                  className="flex-1 px-3 py-2 text-sm border border-gray-400 rounded-md focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                                  placeholder={`${t('builder.properties.column')} ${index + 1}`}
                                              />
                                              {columns.length > 1 && (
                                                  <button 
                                                      onClick={() => removeColumn(index)}
                                                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                  >
                                                      <X className="w-4 h-4" />
                                                  </button>
                                              )}
                                          </div>
                                      )}
                                  </Draggable>
                              ))}
                              {provided.placeholder}
                          </div>
                      )}
                  </Droppable>
              </DragDropContext>
          </div>
        </div>
      )}

      { }
      {activeTab === 'advanced' && (
        <div className="space-y-4">
             { }
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.read_only')}
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.options?.readOnly || false}
                    onChange={(e) => handleOptionUpdate('readOnly', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                </label>
                 <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.read_only_desc')}
              </p>
            </div>

            { }
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.hover_text')}
              </label>
              <textarea
                value={options.hoverText || ''}
                onChange={(e) => handleOptionUpdate('hoverText', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.hover_text_desc')}
              </p>
            </div>

             { }
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.shrink')}
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.shrink || false}
                    onChange={(e) => handleUpdate({ shrink: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                </label>
                 <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.shrink_desc')}
              </p>
            </div>
            
            { }
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.hide_field')}
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.hidden || false}
                    onChange={(e) => handleOptionUpdate('hidden', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                </label>
                 <p className="mt-1 text-xs text-gray-500">
                  {t('builder.properties.hide_field_desc')}
                </p>
            </div>
        </div>
      )}
    </div>
  );
}
