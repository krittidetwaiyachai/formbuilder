import React, { useCallback, useEffect, useRef } from "react";
import { useFormStore } from "@/store/formStore";
import type { SidebarFieldConfig } from "./config";
import { useFieldLabels, getFieldColorTheme } from "./useSidebarTheme";
import {
  MOBILE_SIDEBAR_DRAG_END,
  MOBILE_SIDEBAR_DRAG_MOVE,
  MOBILE_SIDEBAR_DRAG_START,
  dispatchMobileSidebarDragEvent } from
"@/utils/mobileSidebarDrag";
const FieldTypeButtonVisual = ({
  fieldType,
  isCollapsed,
  variant = "list"
}: {fieldType: SidebarFieldConfig;isCollapsed?: boolean;variant?: "list" | "grid";}) => {
  const labels = useFieldLabels();
  const Icon = fieldType.icon;
  const translatedLabel =
  labels[fieldType.label as keyof ReturnType<typeof useFieldLabels>] ||
  fieldType.label;
  const theme = getFieldColorTheme(fieldType.type);
  if (variant === "grid" && !isCollapsed) {
    return (
      <div
        className={`
                group w-full aspect-[1.14] flex flex-col items-center justify-center gap-2 p-3.5 
                bg-white border md:hover:border-transparent rounded-2xl transition-all duration-200
                md:hover:shadow-lg md:hover:-translate-y-1 relative overflow-hidden
                active:scale-[0.98] active:bg-gray-50
                ${theme.border}
            `}>
        <div
          className={`
                    absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300
                    bg-gradient-to-br ${theme.bg} to-white pointer-events-none
                `} />
        <div
          className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${theme.bg} ${theme.text} md:group-hover:scale-110 transition-transform duration-300
                `}>
          <Icon className="h-6 w-6" />
        </div>
        <span
          className={`z-10 text-center text-[12px] font-semibold leading-[1.35] text-gray-700 md:group-hover:text-gray-900`}>
          {translatedLabel}
        </span>
      </div>);
  }
  return (
    <div
      className={`w-full flex items-center ${isCollapsed ? "justify-center px-1" : "px-3"} py-2 text-sm text-black bg-white md:hover:bg-gray-50 active:bg-gray-100 rounded-md border border-gray-400 transition-colors cursor-grab active:cursor-grabbing touch-none select-none`}>
      <Icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`} />{" "}
      {!isCollapsed && <span>{translatedLabel}</span>}{" "}
    </div>);
};
export function FieldTypeButton({
  fieldType,
  isCollapsed,
  onFieldAdd,
  variant,
  isTouch
}: {fieldType: SidebarFieldConfig;isCollapsed?: boolean;onFieldAdd?: () => void;variant?: "list" | "grid";isTouch?: boolean;}) {
  const { addField } = useFormStore();
  const customDragOverlayRef = useRef<HTMLDivElement | null>(null);
  const customDragCleanupRef = useRef<(() => void) | null>(null);
  const isCustomDraggingRef = useRef(false);
  const lastTouchPointRef = useRef<{x: number;y: number;} | null>(null);
  const useCustomSidebarDrag = Boolean(!isTouch || variant === "grid");
  useEffect(() => {
    return () => {
      if (!isCustomDraggingRef.current) {
        customDragCleanupRef.current?.();
      }
    };
  }, []);
  const handleTapAdd = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    addField({
      type: fieldType.type,
      label: fieldType.label,
      required: false,
      validation: fieldType.validation,
      order: 0,
      options: fieldType.options
    });
    onFieldAdd?.();
  };
  const handleCustomMobileDragStart = useCallback(
    (event: PointerEvent) => {
      if (
      !useCustomSidebarDrag ||
      event.pointerType !== "touch" &&
      event.pointerType !== "mouse" &&
      event.pointerType !== "pen" ||
      event.pointerType === "mouse" && event.button !== 0 ||
      !event.isPrimary)
      {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      customDragCleanupRef.current?.();
      const overlay = customDragOverlayRef.current;
      const activePointerId = event.pointerId;
      const initialPoint = { x: event.clientX, y: event.clientY };
      isCustomDraggingRef.current = true;
      lastTouchPointRef.current = initialPoint;
      try {
        overlay?.setPointerCapture(activePointerId);
      } catch {}
      dispatchMobileSidebarDragEvent(MOBILE_SIDEBAR_DRAG_START, {
        fieldType: fieldType.type,
        ...initialPoint
      });
      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== activePointerId) {
          return;
        }
        const nextPoint = { x: moveEvent.clientX, y: moveEvent.clientY };
        lastTouchPointRef.current = nextPoint;
        moveEvent.preventDefault();
        dispatchMobileSidebarDragEvent(MOBILE_SIDEBAR_DRAG_MOVE, {
          fieldType: fieldType.type,
          ...nextPoint
        });
      };
      const finishDrag = (endEvent?: PointerEvent) => {
        const finalPoint = endEvent ?
        { x: endEvent.clientX, y: endEvent.clientY } :
        lastTouchPointRef.current || initialPoint;
        dispatchMobileSidebarDragEvent(MOBILE_SIDEBAR_DRAG_END, {
          fieldType: fieldType.type,
          ...finalPoint
        });
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerEnd);
        window.removeEventListener("pointercancel", handlePointerCancel);
        try {
          overlay?.releasePointerCapture(activePointerId);
        } catch {}
        isCustomDraggingRef.current = false;
        customDragCleanupRef.current = null;
        lastTouchPointRef.current = null;
      };
      const handlePointerEnd = (endEvent: PointerEvent) => {
        if (endEvent.pointerId !== activePointerId) {
          return;
        }
        endEvent.preventDefault();
        finishDrag(endEvent);
      };
      const handlePointerCancel = (cancelEvent: PointerEvent) => {
        if (cancelEvent.pointerId !== activePointerId) {
          return;
        }
        finishDrag(cancelEvent);
      };
      window.addEventListener("pointermove", handlePointerMove, {
        passive: false
      });
      window.addEventListener("pointerup", handlePointerEnd, {
        passive: false
      });
      window.addEventListener("pointercancel", handlePointerCancel, {
        passive: false
      });
      customDragCleanupRef.current = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerEnd);
        window.removeEventListener("pointercancel", handlePointerCancel);
        try {
          overlay?.releasePointerCapture(activePointerId);
        } catch {}
      };
    },
    [fieldType.type, useCustomSidebarDrag]
  );
  useEffect(() => {
    const overlay = customDragOverlayRef.current;
    if (!overlay || !useCustomSidebarDrag) {
      return;
    }
    overlay.addEventListener("pointerdown", handleCustomMobileDragStart, {
      passive: false
    });
    return () => {
      overlay.removeEventListener("pointerdown", handleCustomMobileDragStart);
    };
  }, [handleCustomMobileDragStart, useCustomSidebarDrag]);
  return (
    <div className="relative w-full h-full">
      <div
        className="relative z-0 select-none h-full"
        onClick={(e) => {
          if (isTouch && !isCollapsed && variant !== "grid") {
            handleTapAdd(e);
          }
        }}>
        <FieldTypeButtonVisual
          fieldType={fieldType}
          isCollapsed={isCollapsed}
          variant={variant} />
      </div>
      {useCustomSidebarDrag &&
      <div
        ref={customDragOverlayRef}
        className="absolute inset-0 z-20 bg-transparent"
        style={{
          touchAction: "none",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          cursor: "grab"
        }} />
      }
    </div>);
}