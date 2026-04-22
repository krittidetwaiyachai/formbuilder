import { useMemo, useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { FieldType } from "@/types";
import { cn } from "@/lib/utils";
import BundleSidebarDragPreview from "@/components/admin/BundleSidebarDragPreview";
import { useBundleEditorStore } from "@/store/bundleEditorStore";
import type { SidebarFieldConfig } from "@/components/form-builder/sidebar/config";
import { fieldCategories } from "@/components/form-builder/sidebar/config";
import { useFieldLabels } from "@/components/form-builder/sidebar/useSidebarTheme";
import { useTranslation } from "react-i18next";
const defaultChoiceOptions = {
  items: [
  { id: "opt-1", label: "Option 1", value: "option-1" },
  { id: "opt-2", label: "Option 2", value: "option-2" },
  { id: "opt-3", label: "Option 3", value: "option-3" }]
};
const buildFieldOptions = (config: SidebarFieldConfig) => {
  if (config.options) {
    return config.options;
  }
  if ([FieldType.DROPDOWN, FieldType.RADIO, FieldType.CHECKBOX].includes(config.type)) {
    return defaultChoiceOptions;
  }
  return undefined;
};
function BundleFieldTypeButton({
  config,
  isCollapsed
}: {config: SidebarFieldConfig;isCollapsed: boolean;}) {
  const labels = useFieldLabels();
  const { addField } = useBundleEditorStore();
  const Icon = config.icon;
  const translatedLabel = useMemo(() => {
    return labels[config.label as keyof ReturnType<typeof useFieldLabels>] || config.label;
  }, [config.label, labels]);
  const handleAddField = () => {
    addField({
      type: config.type,
      label: config.label,
      required: false,
      validation: config.validation,
      options: buildFieldOptions(config)
    });
  };
  return (
    <div
      onClick={handleAddField}
      className={cn(
        "w-full flex items-center py-2 text-sm text-black bg-white rounded-md border border-gray-400 transition-colors cursor-grab active:cursor-grabbing",
        "hover:bg-gray-50 active:bg-gray-100",
        isCollapsed ? "justify-center px-1" : "px-3"
      )}>
      <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
      {!isCollapsed && <span>{translatedLabel}</span>}
    </div>);
}
function BundleSidebarCategory({
  category,
  isCollapsed,
  startIndex
}: {category: {name: string;fields: SidebarFieldConfig[];};isCollapsed: boolean;startIndex: number;}) {
  const [isOpen, setIsOpen] = useState(true);
  const labels = useFieldLabels();
  const translatedCategoryName =
  labels[category.name as keyof ReturnType<typeof useFieldLabels>] || category.name;
  if (isCollapsed) {
    return (
      <div className="space-y-2">
        <div className="my-1 h-px w-full bg-gray-200" />
        {category.fields.map((field, index) =>
        <div key={field.type} className="relative z-0 select-none">
            <div className="relative z-0">
              <BundleFieldTypeButton config={field} isCollapsed />
            </div>
            <Draggable draggableId={`sidebar-${field.type}`} index={startIndex + index}>
              {(provided, snapshot) =>
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={cn(
                "z-10 h-full w-full touch-none",
                snapshot.isDragging ? "fixed opacity-0" : "absolute inset-0 opacity-0"
              )}
              style={
              snapshot.isDragging ?
              { ...provided.draggableProps.style, opacity: 0 } :
              provided.draggableProps.style
              }>
                  <div className="h-full w-full">
                    <BundleFieldTypeButton config={field} isCollapsed />
                  </div>
                </div>
            }
            </Draggable>
          </div>
        )}
      </div>);
  }
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700 transition-colors hover:bg-gray-50">
        <span>{translatedCategoryName}</span>
        {isOpen ?
        <ChevronDown className="h-4 w-4 text-gray-400" /> :
        <ChevronRight className="h-4 w-4 text-gray-400" />
        }
      </button>
      {isOpen &&
      <div className="space-y-2 border-t border-gray-100 bg-gray-50/50 p-2">
          {category.fields.map((field, index) =>
        <div key={field.type} className="relative z-0 select-none">
              <div className="relative z-0">
                <BundleFieldTypeButton config={field} isCollapsed={false} />
              </div>
              <Draggable draggableId={`sidebar-${field.type}`} index={startIndex + index}>
                {(provided, snapshot) =>
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={cn(
                "z-10 h-full w-full touch-none",
                snapshot.isDragging ? "fixed opacity-0" : "absolute inset-0 opacity-0"
              )}
              style={
              snapshot.isDragging ?
              { ...provided.draggableProps.style, opacity: 0 } :
              provided.draggableProps.style
              }>
                    <div className="h-full w-full">
                      <BundleFieldTypeButton config={field} isCollapsed={false} />
                    </div>
                  </div>
            }
              </Draggable>
            </div>
        )}
        </div>
      }
    </div>);
}
export default function BundleFieldsSidebar() {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  let runningIndex = 0;
  const filteredCategories = useMemo(() => {
    return fieldCategories.
    map((category) => ({
      ...category,
      fields: category.fields.filter(
        (f) => f.type !== FieldType.PAGE_BREAK && f.type !== FieldType.GROUP
      )
    })).
    filter((category) => category.fields.length > 0);
  }, []);
  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col h-full shadow-sm relative z-20 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-[300px]"
      )}>
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute -right-4 top-1/2 z-50 flex h-8 w-8 -translate-y-1/2 transform items-center justify-center rounded-full border border-gray-200 bg-white p-1.5 text-gray-400 shadow-md transition-all hover:scale-110 hover:text-gray-600"
        title={
        isCollapsed ?
        t("admin.bundle_settings.expand_sidebar") :
        t("admin.bundle_settings.collapse_sidebar")
        }>
        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
      <div className="border-b border-gray-200 bg-white p-4 flex items-center justify-center">
        {!isCollapsed &&
        <h2 className="font-semibold text-gray-800 whitespace-nowrap overflow-hidden">
            {t("builder.fields")}
          </h2>
        }
      </div>
      <Droppable
        droppableId="BUNDLE-SIDEBAR"
        isDropDisabled
        renderClone={(provided, _snapshot, rubric) => {
          const fieldType = rubric.draggableId.replace("sidebar-", "") as FieldType;
          const field = filteredCategories.
          flatMap((category) => category.fields).
          find((fieldConfig) => fieldConfig.type === fieldType);
          if (!field) {
            return <div />;
          }
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={provided.draggableProps.style}
              className="z-[9999]">
              <div className="w-[300px]">
                <BundleSidebarDragPreview fieldConfig={field} />
              </div>
            </div>);
        }}>
        {(provided) =>
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            "flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent",
            isCollapsed ? "p-2" : "p-4"
          )}>
            {filteredCategories.map((category) => {
            const categoryStartIndex = runningIndex;
            runningIndex += category.fields.length;
            return (
              <BundleSidebarCategory
                key={category.name}
                category={category}
                isCollapsed={isCollapsed}
                startIndex={categoryStartIndex} />);
          })}
            <div className="hidden">{provided.placeholder}</div>
          </div>
        }
      </Droppable>
    </div>);
}