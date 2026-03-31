import { useEffect, useRef, useState } from "react";
import { GitBranch, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFormStore } from "@/store/formStore";
import { FieldType } from "@/types";
import type { TypedField } from "@/types";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import LogicSidebarList from "./LogicSidebarList";
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
  variant?: "desktop" | "mobile";
}
export default function PropertiesPanel({
  currentPage = 0,
  variant = "desktop"
}: PropertiesPanelProps) {
  const isMobileVariant = variant === "mobile";
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
  const selectedField = currentForm?.fields?.find((field) => field.id === selectedFieldId);
  const [formTitle, setFormTitle] = useState(currentForm?.title || "");
  const [formDescription, setFormDescription] = useState(currentForm?.description || "");
  useEffect(() => {
    if (currentForm) {
      setFormTitle(currentForm.title || "");
      setFormDescription(currentForm.description || "");
    }
  }, [currentForm]);
  useEffect(() => {
    if (!selectedField && activeSidebarTab === "properties") {
      setActiveSidebarTab("settings");
    }
  }, [selectedField, activeSidebarTab, setActiveSidebarTab]);
  const handleFormUpdate = (field: string, value: unknown) => {
    if (!currentForm) {
      return;
    }
    updateForm({ ...currentForm, [field]: value });
  };
  const renderFieldProperties = () => {
    if (!selectedField) {
      return null;
    }
    const field = selectedField as unknown as TypedField;
    switch (field.type) {
      case FieldType.FULLNAME:
        return <FullNameProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.EMAIL:
        return <EmailProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.ADDRESS:
        return <AddressProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.PHONE:
        return <PhoneProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.DATE:
        return <DateProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.HEADER:
        return <HeaderProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.TEXT:
        return <ShortTextProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.TEXTAREA:
        return <LongTextProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.PARAGRAPH:
        return <ParagraphProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.DROPDOWN:
        return <DropdownProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.RADIO:
        return <RadioProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.CHECKBOX:
        return <CheckboxProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.NUMBER:
        return <NumberProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.TIME:
        return <TimeProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.SUBMIT:
        return <SubmitProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.RATE:
        return <RateProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.MATRIX:
        return <MatrixProperties field={field} updateField={updateField} duplicatesField={addField} />;
      case FieldType.TABLE:
        return <TableProperties field={field} updateField={updateField} duplicatesField={addField} />;
      default:
        return (
          <CommonFieldProperties
            field={selectedField}
            currentForm={currentForm!}
            updateField={updateField} />);
    }
  };
  const renderTabButton = (
  key: "properties" | "logic" | "settings",
  label: string,
  icon: React.ReactNode,
  activeClasses: string,
  inactiveClasses: string) =>
  {
    if (key === "properties" && !selectedField) {
      return null;
    }
    const isActive = activeSidebarTab === key;
    return (
      <button
        onClick={() => setActiveSidebarTab(key)}
        className={`flex flex-1 items-center justify-center gap-2 font-semibold transition-all duration-200 ${
        isMobileVariant ? "rounded-xl py-2 text-sm" : "rounded-lg py-1.5 text-sm"} ${
        isActive ? activeClasses : inactiveClasses}`}>
        {icon}
        <span>{label}</span>
      </button>);
  };
  if (!currentForm) {
    return null;
  }
  if (currentPage < 0) {
    return (
      <div
        ref={panelRef}
        className={`flex h-full w-full flex-col bg-white ${
        isMobileVariant ? "rounded-t-3xl shadow-xl" : "border-l border-gray-200"}`
        }>
        <div
          className={`flex-1 overflow-y-auto px-1 py-2 ${
          isMobileVariant ? "bg-[#fcfcfb] px-5 pb-8 pt-4" : ""}`
          }>
          <SpecialPageProperties
            currentPage={currentPage}
            currentForm={currentForm}
            handleFormUpdate={handleFormUpdate} />
        </div>
      </div>);
  }
  return (
    <div
      ref={panelRef}
      className={`flex h-full w-full flex-col bg-white ${
      isMobileVariant ? "rounded-t-3xl shadow-xl" : ""}`
      }
      style={{ overscrollBehavior: "none" }}
      onKeyDown={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "a") {
          const target = event.target as HTMLElement;
          if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable)
          {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }}>
      {isMobileVariant ?
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfa_100%)] px-5 pb-4 pt-3">
          <div className="flex gap-2 rounded-2xl bg-gray-100/90 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            {renderTabButton(
            "properties",
            t("builder.tabs.properties"),
            <Settings className="h-4 w-4" />,
            "bg-white text-black shadow-sm ring-1 ring-black/5",
            "text-gray-500 hover:bg-gray-200/50 hover:text-gray-900"
          )}
            {renderTabButton(
            "logic",
            t("builder.tabs.logic"),
            <GitBranch className="h-4 w-4" />,
            "bg-white text-black shadow-sm ring-1 ring-black/5",
            "text-gray-500 hover:bg-gray-200/50 hover:text-gray-900"
          )}
            {renderTabButton(
            "settings",
            t("builder.tabs.settings"),
            <Settings className="h-4 w-4" />,
            "bg-white text-black shadow-sm ring-1 ring-black/5",
            "text-gray-500 hover:bg-gray-200/50 hover:text-gray-900"
          )}
          </div>
        </div> :
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
          <div className="flex rounded-xl bg-gray-100 p-1">
            {renderTabButton(
            "properties",
            t("builder.tabs.properties"),
            <Settings className="h-4 w-4" />,
            "bg-white text-black shadow-sm ring-1 ring-black/5",
            "text-gray-500 hover:bg-gray-200/50 hover:text-gray-900"
          )}
            {renderTabButton(
            "logic",
            t("builder.tabs.logic"),
            <GitBranch className="h-4 w-4" />,
            "bg-white text-black shadow-sm ring-1 ring-black/5",
            "text-gray-500 hover:bg-gray-200/50 hover:text-gray-900"
          )}
            {renderTabButton(
            "settings",
            t("builder.tabs.settings"),
            <Settings className="h-4 w-4" />,
            "bg-white text-black shadow-sm ring-1 ring-black/5",
            "text-gray-500 hover:bg-gray-200/50 hover:text-gray-900"
          )}
          </div>
        </div>
      }
      <div
        id="properties-panel-scroll-container"
        className={`flex-1 overflow-y-auto ${
        isMobileVariant ? "bg-[#fcfcfb] px-5 pb-8 pt-4" : "px-1 py-2"}`
        }>
        {activeSidebarTab === "properties" &&
        <>
            {!selectedField ?
          <FormSettingsProperties
            currentForm={currentForm}
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formDescription={formDescription}
            setFormDescription={setFormDescription}
            handleFormUpdate={handleFormUpdate} /> :
          <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold text-black">
                    {t("builder.properties.element_properties")}
                  </h3>
                </div>
                {renderFieldProperties()}
              </div>
          }
          </>
        }
        {activeSidebarTab === "theme" &&
        <div className="space-y-4">
            <h3 className="mb-4 text-sm font-semibold text-black">
              {t("builder.properties.theme_settings")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("builder.properties.theme_coming_soon")}
            </p>
          </div>
        }
        {activeSidebarTab === "logic" && <LogicSidebarList />}
        {activeSidebarTab === "settings" &&
        <FormSettingsProperties
          currentForm={currentForm}
          formTitle={formTitle}
          setFormTitle={setFormTitle}
          formDescription={formDescription}
          setFormDescription={setFormDescription}
          handleFormUpdate={handleFormUpdate} />
        }
      </div>
    </div>);
}