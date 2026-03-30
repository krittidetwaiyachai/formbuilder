import React, { useRef } from "react";
import type { DraggableProvided } from "@hello-pangea/dnd";
import { FieldType } from "@/types";
import type { Field } from "@/types";
import { Trash2, EyeOff } from "lucide-react";
import { useFormStore } from "@/store/formStore";
import InlineQuizBar from "./InlineQuizBar";
import { useTranslation } from "react-i18next";
import type { ActiveUser } from "@/types/collaboration";
import { useFieldStyle } from "./field-item/useFieldStyle";
import { FieldPreview } from "./field-item/FieldPreview";
import { FieldMedia } from "./field-item/FieldMedia";
import { FieldLabel } from "./field-item/FieldLabel";
interface FieldItemProps {
  field: Field;
  isSelected: boolean;
  onSelect: (id: string, autoFocus?: boolean) => void;
  onToggle?: (id: string) => void;
  onOpenContextMenu?: (e: React.MouseEvent) => void;
  onOpenProperties?: () => void;
  isHidden?: boolean;
  isNewFromSidebar?: boolean;
  isOverlay?: boolean;
  provided?: DraggableProvided;
  draggableStyle?: React.CSSProperties;
  isDragging?: boolean;
  disableHover?: boolean;
  allFields?: Field[];
  hideDragHandle?: boolean;
  isMultiSelecting?: boolean;
  collaboratingUsers?: ActiveUser[];
  hideDeleteAction?: boolean;
  onMobileDragHandlePointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
}
function FieldItem({
  field,
  isSelected,
  onSelect,
  onToggle,
  onOpenContextMenu,
  isHidden = false,
  isNewFromSidebar = false,
  isOverlay = false,
  provided,
  draggableStyle,
  isDragging = false,
  disableHover = false,
  allFields = [],
  hideDragHandle = false,
  isMultiSelecting = false,
  collaboratingUsers = [],
  hideDeleteAction = false,
  onMobileDragHandlePointerDown
}: FieldItemProps) {
  const deleteField = useFormStore((state) => state.deleteField);
  const updateField = useFormStore((state) => state.updateField);
  const currentForm = useFormStore((state) => state.currentForm);
  const style = draggableStyle || provided?.draggableProps.style;
  const isFocusingRef = useRef(false);
  const { t } = useTranslation();
  const fieldStyle = useFieldStyle(field, disableHover);
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if ("ontouchstart" in window) {
      return;
    }
    if (!isSelected) {
      onSelect(field.id, false);
    }
    if (onOpenContextMenu) {
      onOpenContextMenu(e);
    }
  };
  const isPageBreak = field.type === FieldType.PAGE_BREAK;
  const isShrunk = field.options?.shrink || field.shrink;
  if (isOverlay) {
    return (
      <div
        style={style}
        className={`w-[calc(105%-4rem)] bg-white rounded-xl shadow-2xl p-4 border-2 ${fieldStyle.overlayBorder} ${fieldStyle.cardBorder} ring-4 ring-black/5 cursor-grabbing`}>
        <div className="flex justify-center mb-3">          <div className="w-8 h-1 bg-gray-200 rounded-full" />        </div>        <div className="flex items-center gap-2 mb-2">          <div
            className={`font-medium text-base truncate ${fieldStyle.iconColor}`}>
            {field.label || t("common.untitled_field")}          </div>        </div>        <div className="h-8 w-full bg-gray-50 rounded border border-gray-100 flex items-center px-3 text-xs text-gray-400 font-medium select-none">          {t(`builder.fields.${field.type.toLowerCase()}`, field.type)}{" "}          {t("common.field")}        </div>      </div>);
  }
  return (
    <>      <div
        className={`flex items-center gap-3 transition-all duration-200 ${
        isShrunk ? "w-[calc(50%-0.375rem)]" : "w-full"}`
        }>
        <div
          ref={provided?.innerRef}
          {...provided?.draggableProps}
          style={{
            ...style,
            ...(collaboratingUsers.length > 0 ?
            {
              borderColor: collaboratingUsers[0].color,
              boxShadow: `0 0 0 2px ${collaboratingUsers[0].color}`
            } :
            {})
          }}
          data-field-id={field.id}
          onContextMenu={handleContextMenu}
          onMouseDown={() => {
            isFocusingRef.current = true;
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (e.ctrlKey || e.metaKey) {
              if (onToggle) onToggle(field.id);
            } else {
              if (!isSelected) onSelect(field.id, false);
            }
          }}
          className={`relative group/field isolate flex-1 min-w-0 origin-center transform-gpu bg-white ${fieldStyle.bgGradient} ${isPageBreak ? "" : "border rounded-2xl"} transition-[transform,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${field.type === FieldType.HEADER ? "cursor-text" : "cursor-pointer"} ${
          isSelected && !isOverlay ?
          `ring-2 ring-black shadow-lg z-40 border-transparent ${fieldStyle.cardBorder}` :
          collaboratingUsers.length > 0 ?
          `ring-2 shadow-lg z-30 border-transparent` :
          isNewFromSidebar ?
          `border-blue-500 ring-4 ring-blue-500/10 shadow-blue-100/50 ${fieldStyle.cardBorder}` :
          `${isPageBreak ? "" : "border-gray-200"} ${fieldStyle.cardBorder} ${isPageBreak ? "" : disableHover ? "" : "hover:border-gray-300 hover:shadow-md hover:z-30"}`} ${
          isSelected && !isOverlay && !isDragging ? "scale-[1.004] -translate-y-px" : ""
          } ${
          isDragging ? "shadow-2xl rotate-1 !h-auto !bg-white !opacity-100 z-[9999]" : ""} ${isHidden ? "opacity-50" : ""}`}>
          {!hideDragHandle &&
          <div
            {...provided?.dragHandleProps}
            className={`absolute top-0 inset-x-0 z-50 flex h-8 items-start justify-center cursor-grab active:cursor-grabbing touch-none select-none`}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={onMobileDragHandlePointerDown}
            style={{
              touchAction: "none",
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
              userSelect: "none"
            }}>
              <div
              className={`mt-3 w-14 h-1.5 rounded-full transition-colors ${isSelected ? "bg-gray-400" : "bg-gray-200 hover:bg-gray-300"}`}>
            </div>          </div>
          }          {collaboratingUsers.length > 0 && !isDragging &&
          <div className="absolute -top-8 left-4 flex flex-row gap-1 z-50 animate-in fade-in slide-in-from-top-2">            {collaboratingUsers.slice(0, 2).map((user) =>
            <div
              key={user.id}
              className="px-2 py-1 rounded-md text-xs font-medium text-white shadow-md flex items-center gap-1 min-w-[30px] justify-center"
              style={{ backgroundColor: user.color }}>
                  <span>{user.name}</span>            </div>
            )}            {collaboratingUsers.length > 2 &&
            <div className="px-2 py-1 rounded-md text-xs font-medium text-white shadow-md flex items-center bg-gray-600">              <span>+{collaboratingUsers.length - 2}</span>            </div>
            }          </div>
          }          {!isOverlay && !isDragging && !hideDeleteAction &&
          <div
            className={`hidden md:flex absolute top-0 bottom-0 -right-14 w-14 items-center justify-center z-50 transition-all duration-200 ${
            isSelected ?
            "opacity-100 translate-x-0" :
            "opacity-0 -translate-x-2 pointer-events-none group-hover/field:opacity-100 group-hover/field:translate-x-0 group-hover/field:pointer-events-auto"}`
            }>
              <button
              onClick={(e) => {
                e.stopPropagation();
                deleteField(field.id);
              }}
              className="h-10 w-10 flex items-center justify-center bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full shadow-sm border border-gray-200 transition-all hover:scale-110 hover:shadow-md"
              title={t("common.delete_field")}>
                <Trash2 className="h-5 w-5" />            </button>          </div>
          }          {(field.validation?.hidden || field.options?.hidden as boolean) &&
          !isOverlay &&
          !isDragging &&
          <div
            className="absolute top-2 right-2 z-20 bg-gray-100/80 p-1 rounded-full text-gray-500 backdrop-blur-sm"
            title={t("common.field_hidden")}>
                <EyeOff className="h-4 w-4" />          </div>
          }          <div
            className={`${isDragging ? "px-4 py-6" : "px-4 pb-4 pt-8"} ${field.type === FieldType.HEADER || field.type === FieldType.PARAGRAPH ? "overflow-visible" : ""}`}
            style={
            !isDragging && (
            field.type === FieldType.HEADER ||
            field.type === FieldType.PARAGRAPH ||
            field.type === FieldType.DIVIDER) ?
            { pointerEvents: "auto" } :
            {}
            }>
            <FieldMedia
              field={field}
              isSelected={isSelected}
              isOverlay={isOverlay}
              isDragging={isDragging}
              updateField={updateField}
              deleteField={deleteField} />
            {field.type === FieldType.HEADER ||
            field.type === FieldType.PARAGRAPH ||
            field.type === FieldType.DIVIDER ||
            field.type === FieldType.PAGE_BREAK ?
            <div
              onMouseDown={(e) => {
                const target = e.target as HTMLElement;
                if (
                target.closest('h2, p, div[contenteditable="true"]') ||
                target.isContentEditable ||
                target.closest('[contenteditable="true"]'))
                {
                  e.stopPropagation();
                }
              }}
              className="cursor-text"
              style={{ userSelect: "text", pointerEvents: "auto" }}>
                <FieldPreview
                field={field}
                fieldStyle={fieldStyle}
                isSelected={isSelected}
                onSelect={onSelect}
                isMultiSelecting={isMultiSelecting}
                allFields={allFields}
                updateField={updateField} />
              </div> :
            <>              {isOverlay || isDragging ?
              <div className="h-10 bg-gray-50 rounded border border-gray-100 flex items-center px-3 text-xs text-gray-400 font-medium select-none">                {field.type === FieldType.TEXTAREA ?
                t("common.long_text") :
                field.type === FieldType.ADDRESS ?
                t("common.address") :
                `${t(`builder.fields.${field.type.toLowerCase()}`, field.type)} ${t("common.field")}`}              </div> :
              <FieldLabel
                field={field}
                isSelected={isSelected}
                isMultiSelecting={isMultiSelecting}
                updateField={updateField}
                onSelect={onSelect}>
                    <FieldPreview
                  field={field}
                  fieldStyle={fieldStyle}
                  isSelected={isSelected}
                  onSelect={onSelect}
                  isMultiSelecting={isMultiSelecting}
                  allFields={allFields}
                  updateField={updateField} />
                  </FieldLabel>
              }            </>
            }          </div>          {isSelected && currentForm?.isQuiz && !isOverlay && !isDragging &&
          <InlineQuizBar
            field={field}
            currentForm={currentForm}
            allFields={allFields}
            onUpdate={updateField} />
          }        </div>      </div>    </>);
}
export default React.memo(FieldItem);
