import { useState, useEffect, useRef } from 'react';
import { useFormStore } from '@/store/formStore';
import { FieldType } from '@/types';
import { Settings, Palette } from 'lucide-react';

// Property Components
import { DateProperties } from './fields/date/DateProperties';
import { FullNameProperties } from './fields/full-name/FullNameProperties';
import { EmailProperties } from './fields/email/EmailProperties';
import { AddressProperties } from './fields/address/AddressProperties';
import { PhoneProperties } from './fields/phone/PhoneProperties';
import { ShortTextProperties } from './fields/short-text/ShortTextProperties';
import { LongTextProperties } from './fields/long-text/LongTextProperties';
import { ParagraphProperties } from './fields/paragraph/ParagraphProperties';
import { DropdownProperties } from './fields/dropdown/DropdownProperties';
import { RadioProperties } from './fields/radio/RadioProperties';
import { CheckboxProperties } from './fields/checkbox/CheckboxProperties';
import { NumberProperties } from './fields/number/NumberProperties';
import { TimeProperties } from './fields/time/TimeProperties';
import { SubmitProperties } from './fields/submit/SubmitProperties';
import { HeaderProperties } from './fields/header/HeaderProperties';
import { RateProperties } from './fields/rate/RateProperties';

// Extracted Shared/Specific Components
import { SpecialPageProperties } from './properties/SpecialPageProperties';
import { FormSettingsProperties } from './properties/FormSettingsProperties';
import { CommonFieldProperties } from './properties/CommonFieldProperties';

interface PropertiesPanelProps {
  currentPage?: number;
}

export default function PropertiesPanel({ currentPage = 0 }: PropertiesPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { currentForm, selectedFieldId, updateField, updateForm, addField } = useFormStore();
  const selectedField = currentForm?.fields?.find((f) => f.id === selectedFieldId);
  const [activeTab, setActiveTab] = useState<'properties' | 'theme' | 'settings'>('properties');

  const [formTitle, setFormTitle] = useState(currentForm?.title || '');
  const [formDescription, setFormDescription] = useState(currentForm?.description || '');

  useEffect(() => {
    if (currentForm) {
      setFormTitle(currentForm.title);
      setFormDescription(currentForm.description || '');
    }
  }, [currentForm]);

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
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium rounded-md border transition-colors ${
              activeTab === 'properties'
                ? 'bg-white border-gray-400 text-black shadow-sm'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="truncate">Properties</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium rounded-md border transition-colors ${
              activeTab === 'theme'
                ? 'bg-white border-gray-400 text-black shadow-sm'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Palette className="h-4 w-4" />
            <span className="truncate">Theme</span>
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
            <span className="truncate">Settings</span>
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
                  <h3 className="text-sm font-semibold text-black mb-2">Element Properties</h3>
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
            <h3 className="text-sm font-semibold text-black mb-4">Theme Settings</h3>
            <p className="text-sm text-gray-600">Theme customization coming soon...</p>
          </div>
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
