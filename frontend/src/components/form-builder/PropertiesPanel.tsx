import { useState, useEffect, useRef } from "react";
import { useFormStore } from "@/store/formStore";
import { FieldType } from "@/types";
import type { TypedField } from "@/types";
import { Settings, GitBranch } from "lucide-react";
import LogicSidebarList from "./LogicSidebarList";
import { useTranslation } from "react-i18next";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { DateProperties } from "@/components/field-properties/advanced/DateProperties";
import { FullNameProperties } from "@/components/field-properties/text/FullNameProperties";
import { EmailProperties } from "@/components/field-properties/text/EmailProperties";
import { AddressProperties } from "@/components/field-properties/advanced/AddressProperties";
import { PhoneProperties } from "@/components/field-properties/text/PhoneProperties";
import { ShortTextProperties } from "@/components/field-properties/text/ShortTextProperties";
import { LongTextProperties } from "@/components/field-properties/text/LongTextProperties";
import { ParagraphProperties } from "@/components/field-properties/text/ParagraphProperties";
import { DropdownProperties } from "@/components/field-properties/choice/DropdownProperties";
import { RadioProperties } from "@/components/field-properties/choice/RadioProperties";
import { CheckboxProperties } from "@/components/field-properties/choice/CheckboxProperties";
import { NumberProperties } from "@/components/field-properties/text/NumberProperties";
import { TimeProperties } from "@/components/field-properties/advanced/TimeProperties";
import { SubmitProperties } from "@/components/field-properties/advanced/SubmitProperties";
import { HeaderProperties } from "@/components/field-properties/advanced/HeaderProperties";
import { RateProperties } from "@/components/field-properties/advanced/RateProperties";
import { MatrixProperties } from "@/components/field-properties/advanced/MatrixProperties";
import { TableProperties } from "@/components/field-properties/advanced/TableProperties";
import { SpecialPageProperties } from "./properties/SpecialPageProperties";
import { FormSettingsProperties } from "./properties/FormSettingsProperties";
import { CommonFieldProperties } from "./properties/CommonFieldProperties";
interface PropertiesPanelProps {
  currentPage?: number;
}
export default function PropertiesPanel({
  currentPage = 0
}: PropertiesPanelProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    currentForm,
    selectedFieldId,
    updateForm,
    updateField,
    addField,
    activeSidebarTab,
    setActiveSidebarTab
  } = useFormStore();
  useSmoothScroll("properties-panel-scroll-container");
  const selectedField = currentForm?.fields?.find(
    (f) => f.id === selectedFieldId
  );
  const activeTab = activeSidebarTab;
  const setActiveTab = setActiveSidebarTab;
  const [formTitle, setFormTitle] = useState(currentForm?.title || "");
  const [formDescription, setFormDescription] = useState(
    currentForm?.description || ""
  );
  useEffect(() => {
    if (currentForm) {
      setFormTitle(currentForm.title || "");
      setFormDescription(currentForm.description || "");
    }
  }, [currentForm]);
  useEffect(() => {
    if (!selectedField && activeTab === "properties") {
      setActiveTab("settings");
    }
  }, [selectedField, activeTab, setActiveTab]);
  const handleFormUpdate = (field: string, value: unknown) => {
    if (!currentForm) return;
    updateForm({ ...currentForm, [field]: value });
  };
  if (!currentForm) return null;
  if (currentPage < 0) {
    return (
      <div
        ref={panelRef}
        className="w-full bg-white flex flex-col h-full border-l border-gray-200">
        <div className="flex-1 overflow-y-auto px-1 py-2">          <SpecialPageProperties
            currentPage={currentPage}
            currentForm={currentForm}
            handleFormUpdate={handleFormUpdate} />
        </div>      </div>);
  }
  return (
    <div
      ref={panelRef}
      className="w-full bg-white flex flex-col h-full"
      style={{ overscrollBehavior: "none" }}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "a") {
          const target = e.target as HTMLElement;
          if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable)
          {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }}>
      {}      <div className="border-b border-gray-100 bg-white px-4 py-3 sticky top-0 z-10">        <div className="flex p-1 bg-gray-100 rounded-xl">          {selectedField &&
          <button
            onClick={() => setActiveTab("properties")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === "properties" ?
            "bg-white text-black shadow-sm ring-1 ring-black/5" :
            "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"}`
            }>
              <Settings className="w-4 h-4" />              <span>{t("builder.tabs.properties")}</span>            </button>
          }          <button
            onClick={() => setActiveTab("logic")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === "logic" ?
            "bg-white text-black shadow-sm ring-1 ring-black/5" :
            "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"}`
            }>
            <GitBranch className="w-4 h-4" />            <span>{t("builder.tabs.logic")}</span>          </button>          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === "settings" ?
            "bg-white text-black shadow-sm ring-1 ring-black/5" :
            "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"}`
            }>
            <Settings className="w-4 h-4" />            <span>{t("builder.tabs.settings")}</span>          </button>        </div>      </div>      {}      <div
        id="properties-panel-scroll-container"
        className="flex-1 overflow-y-auto px-1 py-2">
        {activeTab === "properties" &&
        <>            {!selectedField ?
          <FormSettingsProperties
            currentForm={currentForm}
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formDescription={formDescription}
            setFormDescription={setFormDescription}
            handleFormUpdate={handleFormUpdate} /> :
          selectedField ?
          <div className="space-y-4">                <div className="mb-4">                  <h3 className="text-sm font-semibold text-black mb-2">                    {t("builder.properties.element_properties")}                  </h3>                </div>                {(() => {
              const field = selectedField as unknown as TypedField;
              switch (field.type) {
                case FieldType.FULLNAME:
                  return (
                    <FullNameProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.EMAIL:
                  return (
                    <EmailProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.ADDRESS:
                  return (
                    <AddressProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.PHONE:
                  return (
                    <PhoneProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.DATE:
                  return (
                    <DateProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.HEADER:
                  return (
                    <HeaderProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.TEXT:
                  return (
                    <ShortTextProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.TEXTAREA:
                  return (
                    <LongTextProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.PARAGRAPH:
                  return (
                    <ParagraphProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.DROPDOWN:
                  return (
                    <DropdownProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.RADIO:
                  return (
                    <RadioProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.CHECKBOX:
                  return (
                    <CheckboxProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.NUMBER:
                  return (
                    <NumberProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.TIME:
                  return (
                    <TimeProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.SUBMIT:
                  return (
                    <SubmitProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.RATE:
                  return (
                    <RateProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.MATRIX:
                  return (
                    <MatrixProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                case FieldType.TABLE:
                  return (
                    <TableProperties
                      field={field}
                      updateField={updateField}
                      duplicatesField={addField} />);
                default:
                  return (
                    <CommonFieldProperties
                      field={selectedField}
                      currentForm={currentForm}
                      updateField={updateField} />);
              }
            })()}                {}                {}                {}              </div> :
          null}          </>
        }        {activeTab === "theme" &&
        <div className="space-y-4">            <h3 className="text-sm font-semibold text-black mb-4">              {t("builder.properties.theme_settings")}            </h3>            <p className="text-sm text-gray-600">              {t("builder.properties.theme_coming_soon")}            </p>          </div>
        }        {}        {activeTab === "logic" && <LogicSidebarList />}        {activeTab === "settings" &&
        <FormSettingsProperties
          currentForm={currentForm}
          formTitle={formTitle}
          setFormTitle={setFormTitle}
          formDescription={formDescription}
          setFormDescription={setFormDescription}
          handleFormUpdate={handleFormUpdate} />
        }      </div>    </div>);
}