import { useState, useEffect, useRef } from 'react';
import { useFormStore } from '@/store/formStore';
import { FieldType } from '@/types';
import { Settings, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogicSidebarList from './LogicSidebarList';
import { useTranslation } from 'react-i18next';

// Property Components
import { DateProperties } from '@/components/field-properties/advanced/DateProperties';
import { FullNameProperties } from '@/components/field-properties/text/FullNameProperties';
import { EmailProperties } from '@/components/field-properties/text/EmailProperties';
import { AddressProperties } from '@/components/field-properties/advanced/AddressProperties';
import { PhoneProperties } from '@/components/field-properties/text/PhoneProperties';
import { ShortTextProperties } from '@/components/field-properties/text/ShortTextProperties';
import { LongTextProperties } from '@/components/field-properties/text/LongTextProperties';
import { ParagraphProperties } from '@/components/field-properties/text/ParagraphProperties';
import { DropdownProperties } from '@/components/field-properties/choice/DropdownProperties';
import { RadioProperties } from '@/components/field-properties/choice/RadioProperties';
import { CheckboxProperties } from '@/components/field-properties/choice/CheckboxProperties';
import { NumberProperties } from '@/components/field-properties/text/NumberProperties';
import { TimeProperties } from '@/components/field-properties/advanced/TimeProperties';
import { SubmitProperties } from '@/components/field-properties/advanced/SubmitProperties';
import { HeaderProperties } from '@/components/field-properties/advanced/HeaderProperties';
import { RateProperties } from '@/components/field-properties/advanced/RateProperties';
import { MatrixProperties } from '@/components/field-properties/advanced/MatrixProperties';
import { TableProperties } from '@/components/field-properties/advanced/TableProperties';

// Extracted Shared/Specific Components
import { SpecialPageProperties } from './properties/SpecialPageProperties';
import { FormSettingsProperties } from './properties/FormSettingsProperties';
import { CommonFieldProperties } from './properties/CommonFieldProperties';

interface PropertiesPanelProps {
  currentPage?: number;
}

export default function PropertiesPanel({ currentPage = 0 }: PropertiesPanelProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const { currentForm, selectedFieldId, updateField, updateForm, addField, activeSidebarTab, setActiveSidebarTab } = useFormStore();
  const selectedField = currentForm?.fields?.find((f) => f.id === selectedFieldId);
  const activeTab = activeSidebarTab;
  const setActiveTab = setActiveSidebarTab;

  const [formTitle, setFormTitle] = useState(currentForm?.title || '');
  const [formDescription, setFormDescription] = useState(currentForm?.description || '');

  useEffect(() => {
    if (currentForm) {
      setFormTitle(currentForm.title);
      setFormDescription(currentForm.description || '');
    }
  }, [currentForm]);

  useEffect(() => {
    if (!selectedField && activeTab === 'properties') {
      setActiveTab('settings');
    }
  }, [selectedField, activeTab, setActiveTab]);

  const handleFormUpdate = (field: string, value: any) => {
    if (!currentForm) return;
    updateForm({ ...currentForm, [field]: value });
  };

  if (!currentForm) return null;

  // Render Special Page Properties (Welcome / Thank You)
  if (currentPage < 0) {
     return (
       <div ref={panelRef} className="w-80 bg-white flex flex-col h-full border-l border-gray-200">
         <div className="flex-1 overflow-y-auto p-4">
           <SpecialPageProperties 
              currentPage={currentPage} 
              currentForm={currentForm} 
              handleFormUpdate={handleFormUpdate} 
           />
         </div>
       </div>
     );
  }

  return (
    <div ref={panelRef} className="w-80 bg-white flex flex-col h-full" style={{ overscrollBehavior: 'none' }} onKeyDown={(e) => {
      // Prevent Ctrl+A (Cmd+A on Mac) in properties panel, but allow it in input/textarea
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }}>
      {/* Top Section - Tabs */}
      <div className="border-b bg-white px-3 py-4">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <AnimatePresence mode="popLayout">
            {activeTab !== 'logic' && selectedField && (
              <motion.button
                key="properties-tab"
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                  mass: 0.8
                }}
                onClick={() => setActiveTab('properties')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium rounded-md border transition-colors ${
                  activeTab === 'properties'
                    ? 'bg-white border-gray-400 text-black shadow-sm'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span className="truncate">{t('builder.tabs.properties')}</span>
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={() => setActiveTab('logic')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium rounded-md border transition-colors ${
              activeTab === 'logic'
                ? 'bg-white border-gray-400 text-black shadow-sm'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <GitBranch className="h-4 w-4" />
            <span className="truncate">{t('builder.tabs.logic')}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium rounded-md border transition-colors ${
              activeTab === 'settings'
                ? 'bg-white border-gray-400 text-black shadow-sm'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="truncate">{t('builder.tabs.settings')}</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' && (
          <>
            {!selectedField ? (
              <FormSettingsProperties 
                currentForm={currentForm}
                formTitle={formTitle}
                setFormTitle={setFormTitle}
                formDescription={formDescription}
                setFormDescription={setFormDescription}
                handleFormUpdate={handleFormUpdate}
              />
            ) : selectedField ? (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-black mb-2">{t('builder.properties.element_properties')}</h3>
                </div>
                
                {selectedField.type === FieldType.FULLNAME ? (
                  <FullNameProperties 
                    field={selectedField} 
                    updateField={updateField} 
                    duplicatesField={addField} 
                  />
                ) : selectedField.type === FieldType.EMAIL ? (
                  <EmailProperties 
                    field={selectedField} 
                    updateField={updateField} 
                    duplicatesField={addField} 
                  />
                ) : selectedField.type === FieldType.ADDRESS ? (
                  <AddressProperties 
                    field={selectedField} 
                    updateField={updateField} 
                    duplicatesField={addField} 
                  />
                ) : selectedField.type === FieldType.PHONE ? (
                  <PhoneProperties 
                    field={selectedField} 
                    updateField={updateField} 
                    duplicatesField={addField} 
                  />
                ) : selectedField.type === FieldType.DATE ? (
                  <DateProperties 
                    field={selectedField} 
                    updateField={updateField} 
                    duplicatesField={addField} 
                  />
                ) : selectedField.type === FieldType.HEADER ? (
                  <HeaderProperties 
                    field={selectedField}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.TEXT ? (
                  <ShortTextProperties 
                    field={selectedField}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.TEXTAREA ? (
                  <LongTextProperties 
                    field={selectedField}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.PARAGRAPH ? (
                  <ParagraphProperties
                    field={selectedField}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.DROPDOWN ? (
                  <DropdownProperties
                    field={selectedField}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.RADIO ? (
                  <RadioProperties
                    field={selectedField}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.CHECKBOX ? (
                  <CheckboxProperties
                    field={selectedField}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.NUMBER ? (
                  <NumberProperties
                    field={selectedField}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.TIME ? (
                  <TimeProperties
                    field={selectedField}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.SUBMIT ? (
                  <SubmitProperties
                    field={selectedField}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.RATE ? (
                  <RateProperties
                    field={selectedField}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.MATRIX ? (
                  <MatrixProperties
                    field={selectedField}
                    currentForm={currentForm}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : selectedField.type === FieldType.TABLE ? (
                  <TableProperties
                    field={selectedField}
                    currentForm={currentForm}
                    updateField={updateField}
                    duplicatesField={addField}
                  />
                ) : (
                  // Fallback for generic fields if any
                  <CommonFieldProperties 
                    field={selectedField}
                    currentForm={currentForm}
                    updateField={updateField}
                  />
                )}
                
                {/* Fallback Rendering for custom fields relying on generic logic previously */}
                {/* This is a visual check: if not in the 'excluded' list of CommonFieldProperties, render it */}
                {/* Actually, the switch statement handles specific Components. 
                    The CommonFieldProperties is used in the 'else' block above. 
                    So we don't need to double render it.
                */}
              </div>
            ) : null}
          </>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-black mb-4">{t('builder.properties.theme_settings')}</h3>
            <p className="text-sm text-gray-600">Theme customization coming soon...</p>
          </div>
        )}

        {/* Removed per-field logic properties - only show LogicSidebarList */}

        {activeTab === 'logic' && (
           <LogicSidebarList />
        )}

        {activeTab === 'settings' && (
          <FormSettingsProperties 
            currentForm={currentForm}
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formDescription={formDescription}
            setFormDescription={setFormDescription}
            handleFormUpdate={handleFormUpdate}
          />
        )}
      </div>
    </div>
  );
}
