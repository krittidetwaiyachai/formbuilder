import React from "react";
import { motion } from "framer-motion";
import { Droppable } from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";
import { FieldType } from "@/types";
import type { Field, Form } from "@/types";
import type { ActiveUser } from "@/types/collaboration";
import { useFormStore } from "@/store/formStore";
import FieldItem from "@/components/form-builder/FieldItem";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { FieldContextMenu } from "./FieldContextMenu";
const mobileLayoutTransition = {
  type: "spring",
  stiffness: 520,
  damping: 38,
  mass: 0.7
} as const;
const sidebarPlaceholderTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.82
} as const;
interface CanvasAreaProps {
  visibleFields: Field[];
  currentForm: Form | null;
  selectedFieldId: string | null;
  onSelectField: (id: string, autoFocus?: boolean) => void;
  onDeselect?: () => void;
  onToggleSelect?: (id: string) => void;
  onOpenProperties?: () => void;
  additionalSelectedIds?: string[];
  getFieldUsers?: (fieldId: string) => ActiveUser[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  handleAddPage: () => void;
  handleDeletePage: (pageIndex: number) => void;
  handleRenamePage: (pageIndex: number, title: string) => void;
  handleReorderPages: (oldIndex: number, newIndex: number) => void;
  handleAddWelcome: () => void;
  handleAddThankYou: () => void;
  isTouchDevice?: boolean;
  mobileDropIndex?: number | null;
  isMobileDraggingSidebar?: boolean;
  mobileSidebarPlaceholderHeight?: number | null;
  mobileCanvasDropIndex?: number | null;
  mobileCanvasDraggingFieldId?: string | null;
  mobileCanvasDroppedFieldId?: string | null;
  sidebarDroppedFieldId?: string | null;
  desktopDroppedFieldId?: string | null;
  onMobileCanvasDragStart?: (
  field: Field,
  event: React.PointerEvent<HTMLDivElement>)
  => void;
}
export default function CanvasArea({
  visibleFields,
  currentForm,
  selectedFieldId,
  onSelectField,
  onDeselect,
  onToggleSelect,
  onOpenProperties,
  additionalSelectedIds = [],
  getFieldUsers,
  isTouchDevice = false,
  mobileDropIndex = null,
  isMobileDraggingSidebar = false,
  mobileSidebarPlaceholderHeight = null,
  mobileCanvasDropIndex = null,
  mobileCanvasDraggingFieldId = null,
  mobileCanvasDroppedFieldId = null,
  sidebarDroppedFieldId = null,
  desktopDroppedFieldId = null,
  onMobileCanvasDragStart
}: CanvasAreaProps) {
  const { t } = useTranslation();
  const [activeContextMenu, setActiveContextMenu] = React.useState<{
    fieldId: string;
    x: number;
    y: number;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    isOpen: boolean;
    fieldId: string | null;
  }>({ isOpen: false, fieldId: null });
  const topLevelFields = visibleFields.filter(
    (field) => !field.groupId || field.type === FieldType.GROUP
  );
  const topLevelFieldIds = React.useMemo(
    () => topLevelFields.map((field) => field.id),
    [topLevelFields]
  );
  const previousTopLevelFieldIdsRef = React.useRef(topLevelFieldIds);
  const isMobileReorderingCanvas = mobileCanvasDraggingFieldId !== null;
  const activeMobileDropIndex = isMobileReorderingCanvas ?
  mobileCanvasDropIndex :
  mobileDropIndex;
  const isAnyMobileDrag = isMobileDraggingSidebar || isMobileReorderingCanvas;
  const hasTopLevelFieldCountChanged =
  previousTopLevelFieldIdsRef.current.length !== topLevelFieldIds.length;
  const shouldAnimateLayoutDuringDrag =
  isAnyMobileDrag && !hasTopLevelFieldCountChanged;
  const droppedFieldId =
  mobileCanvasDroppedFieldId || sidebarDroppedFieldId || desktopDroppedFieldId;
  const renderedTopLevelFields = isMobileReorderingCanvas ?
  topLevelFields.filter((field) => field.id !== mobileCanvasDraggingFieldId) :
  topLevelFields;
  const sidebarPlaceholderHeight =
  mobileSidebarPlaceholderHeight || (isTouchDevice ? 96 : 112);
  const canvasPlaceholderHeight = isTouchDevice ? 96 : 112;
  React.useEffect(() => {
    previousTopLevelFieldIdsRef.current = topLevelFieldIds;
  }, [topLevelFieldIds]);
  if (!currentForm) {
    return <div className="min-h-[200px]" />;
  }
  const handleContextMenu = (event: React.MouseEvent, fieldId: string) => {
    event.preventDefault();
    event.stopPropagation();
    const isSelected =
    selectedFieldId === fieldId || additionalSelectedIds.includes(fieldId);
    if (!isSelected) {
      onSelectField(fieldId, false);
    }
    setActiveContextMenu({ fieldId, x: event.clientX, y: event.clientY });
  };
  const renderMobilePlaceholder = (index: number) => {
    if (!isAnyMobileDrag) {
      return null;
    }
    if (isMobileDraggingSidebar) {
      return (
        <motion.div
          key={`mobile-drop-${index}`}
          aria-hidden="true"
          className="w-full shrink-0 overflow-hidden rounded-2xl bg-transparent"
          initial={false}
          animate={{
            height: activeMobileDropIndex === index ? sidebarPlaceholderHeight : 0,
            opacity: activeMobileDropIndex === index ? 1 : 0
          }}
          transition={sidebarPlaceholderTransition} />);
    }
    return (
      <motion.div
        key={`mobile-drop-${index}`}
        aria-hidden="true"
        className="w-full shrink-0 overflow-hidden rounded-2xl bg-transparent"
        initial={false}
        animate={{
          height: activeMobileDropIndex === index ? canvasPlaceholderHeight : 0,
          opacity: activeMobileDropIndex === index ? 1 : 0
        }}
        transition={mobileLayoutTransition} />);
  };
  return (
    <>
      <Droppable droppableId="CANVAS" isCombineEnabled>
        {(provided, snapshot) =>
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`min-h-full flex-1 transition-all duration-200 pt-10 pb-32 relative rounded-xl bg-gray-50/80 border border-gray-100 ${
          snapshot.isDraggingOver ?
          "ring-2 ring-indigo-300 ring-dashed border-transparent" :
          ""}`
          }
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onDeselect?.();
              setActiveContextMenu(null);
            }
          }}>
            {renderedTopLevelFields.length > 0 ?
          <div className="flex flex-row flex-wrap content-start gap-3 w-full">
                {renderMobilePlaceholder(0)}
                {renderedTopLevelFields.map((field, index) =>
            <React.Fragment key={field.id}>
                    <motion.div
                layout={shouldAnimateLayoutDuringDrag ? "position" : false}
                transition={mobileLayoutTransition}
                initial={field.id === droppedFieldId ?
                { opacity: 0, scale: 0.98, y: 10 } :
                false}
                animate={field.id === droppedFieldId ?
                { opacity: 1, scale: 1, y: 0 } :
                undefined}
                className="w-full"
                data-top-level-field-slot="true"
                data-top-level-field-id={field.id}>
                      <FieldItem
                  field={field}
                  isSelected={
                  selectedFieldId === field.id ||
                  additionalSelectedIds.includes(field.id)
                  }
                  isMultiSelecting={
                  (selectedFieldId ? 1 : 0) +
                  additionalSelectedIds.length >
                  1
                  }
                  onSelect={onSelectField}
                  onToggle={onToggleSelect}
                  onOpenContextMenu={(event) =>
                  handleContextMenu(event, field.id)}
                  onOpenProperties={onOpenProperties}
                  disableHover={snapshot.isDraggingOver || isAnyMobileDrag}
                  allFields={visibleFields}
                  collaboratingUsers={getFieldUsers?.(field.id)}
                  onMobileDragHandlePointerDown={(event) =>
                  onMobileCanvasDragStart?.(field, event)} />
                    </motion.div>
                    {renderMobilePlaceholder(index + 1)}
                  </React.Fragment>
            )}
                {provided.placeholder}
              </div> :
          <>
                {isAnyMobileDrag && activeMobileDropIndex === 0 ?
            isMobileDraggingSidebar ?
            <motion.div
              aria-hidden="true"
              className="w-full shrink-0 overflow-hidden rounded-2xl bg-transparent mb-6"
              initial={false}
              animate={{ height: sidebarPlaceholderHeight, opacity: 1 }}
              transition={sidebarPlaceholderTransition} /> :
            <motion.div
              aria-hidden="true"
              className="w-full shrink-0 overflow-hidden rounded-2xl bg-transparent mb-6"
              initial={false}
              animate={{ height: canvasPlaceholderHeight, opacity: 1 }}
              transition={mobileLayoutTransition} /> :
            null}
                {!isAnyMobileDrag &&
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                    <p className="text-sm font-medium">
                      {t("builder.drag_drop_instructions")}
                    </p>
                  </div>
            }
                {provided.placeholder}
              </>}
            {activeContextMenu ?
          (() => {
            const field = visibleFields.find(
              (entry) => entry.id === activeContextMenu.fieldId
            );
            if (!field) {
              return null;
            }
            return (
              <FieldContextMenu
                field={field}
                position={{
                  x: activeContextMenu.x,
                  y: activeContextMenu.y
                }}
                onClose={() => setActiveContextMenu(null)}
                onDelete={() => {
                  setDeleteConfirm({ isOpen: true, fieldId: field.id });
                }} />);
          })() :
          null}
          </div>
        }
      </Droppable>
      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) =>
        !open && setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
        title={t("builder.field.delete_confirm")}
        description={t("builder.field.delete_confirm_desc")}
        onConfirm={() => {
          if (deleteConfirm.fieldId) {
            useFormStore.getState().deleteField(deleteConfirm.fieldId);
            setDeleteConfirm({ isOpen: false, fieldId: null });
          }
        }}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive" />
    </>);
}