import { useState, useRef, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction, RefObject } from "react";
import { FieldType } from "@/types";
import type { Form, Field } from "@/types";
import { allFields } from "@/components/form-builder/sidebar/config";
import type { MobileSidebarDragDetail } from "@/utils/mobileSidebarDrag";
import {
  MOBILE_SIDEBAR_DRAG_END,
  MOBILE_SIDEBAR_DRAG_MOVE,
  MOBILE_SIDEBAR_DRAG_START } from
"@/utils/mobileSidebarDrag";
import {
  getTopLevelCanvasSlots,
  getStableTopLevelDropIndexAtPoint,
  createFieldFromType,
  findGlobalIndex,
  reorderTopLevelFieldBlock,
  triggerDroppedFieldAnimation,
  type MobileCanvasDragState } from
"../../pages/form-edit/utils/formEditUtils";
const AUTO_SCROLL_MAX_SPEED = 18;
const AUTO_SCROLL_SMOOTHING = 0.18;
const AUTO_SCROLL_STOP_EPSILON = 0.2;
const AUTO_SCROLL_INDEX_STEP_INTERVAL = 72;
export const getAutoScrollTargetSpeed = (
scrollContainer: HTMLDivElement,
y: number) =>
{
  const rect = scrollContainer.getBoundingClientRect();
  const threshold = Math.max(72, Math.min(132, rect.height * 0.18));
  let nextSpeed = 0;
  if (y < rect.top + threshold) {
    const ratio = Math.min(1, (rect.top + threshold - y) / threshold);
    nextSpeed = -(ratio * ratio) * AUTO_SCROLL_MAX_SPEED;
  } else if (y > rect.bottom - threshold) {
    const ratio = Math.min(1, (y - (rect.bottom - threshold)) / threshold);
    nextSpeed = ratio * ratio * AUTO_SCROLL_MAX_SPEED;
  }
  return nextSpeed;
};
export const getSteppedDropIndex = (
currentIndex: number | null,
nextIndex: number | null,
speed: number) =>
{
  if (nextIndex === null || currentIndex === null || speed === 0) {
    return nextIndex;
  }
  if (speed > 0) {
    return Math.min(nextIndex, currentIndex + 1);
  }
  return Math.max(nextIndex, currentIndex - 1);
};
export const PREVIEW_HANDLE_CENTER_OFFSET = 15;
export const getCenteredPointerTransform = (x: number, y: number) =>
`translate3d(${x}px, ${y}px, 0) translate(-50%, -${PREVIEW_HANDLE_CENTER_OFFSET}px)`;
export interface UseMobileDragOptions {
  currentForm: Form | null;
  currentPage: number;
  activeSidebarTab: string;
  visibleTopLevelFields: Field[];
  scrollContainerRef: RefObject<HTMLDivElement>;
  mobilePreviewRef: RefObject<HTMLDivElement>;
  mobileCanvasPreviewRef: RefObject<HTMLDivElement>;
  setActiveFields: Dispatch<SetStateAction<Field[]>>;
  updateForm: (updates: Partial<Form>) => void;
  selectField: (id: string | null) => void;
  setMobileDrawerContent: Dispatch<SetStateAction<any>>;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  isDraggingSidebar: boolean;
  setIsDraggingSidebar: Dispatch<SetStateAction<boolean>>;
  isDraggingSidebarRef: React.MutableRefObject<boolean>;
}
export function useMobileDrag({
  currentForm,
  currentPage,
  activeSidebarTab,
  visibleTopLevelFields,
  scrollContainerRef,
  mobilePreviewRef,
  mobileCanvasPreviewRef,
  setActiveFields,
  updateForm,
  selectField,
  setMobileDrawerContent,
  setIsMobileMenuOpen,
  isDraggingSidebar,
  setIsDraggingSidebar,
  isDraggingSidebarRef
}: UseMobileDragOptions) {
  const mobileDragPointRef = useRef<{x: number;y: number;} | null>(null);
  const mobileDragRafRef = useRef<number | null>(null);
  const mobileAutoScrollRafRef = useRef<number | null>(null);
  const mobileAutoScrollSpeedRef = useRef(0);
  const mobileAutoScrollTargetSpeedRef = useRef(0);
  const mobileDropIndexRef = useRef<number | null>(null);
  const mobileAutoScrollIndexTickRef = useRef(0);
  const sidebarDropCleanupTimeoutRef = useRef<number | null>(null);
  const [mobileSidebarDrag, setMobileSidebarDrag] = useState<MobileSidebarDragDetail | null>(null);
  const [mobileSidebarPlaceholderHeight, setMobileSidebarPlaceholderHeight] = useState<number | null>(null);
  const [mobileDropIndex, setMobileDropIndex] = useState<number | null>(null);
  const [sidebarDroppedFieldId, setSidebarDroppedFieldId] = useState<string | null>(null);
  const mobileCanvasDragRef = useRef<MobileCanvasDragState | null>(null);
  const mobileCanvasDragPointRef = useRef<{x: number;y: number;} | null>(null);
  const mobileCanvasDragRafRef = useRef<number | null>(null);
  const mobileCanvasAutoScrollRafRef = useRef<number | null>(null);
  const mobileCanvasAutoScrollSpeedRef = useRef(0);
  const mobileCanvasAutoScrollTargetSpeedRef = useRef(0);
  const mobileCanvasAutoScrollIndexTickRef = useRef(0);
  const mobileCanvasPointerCleanupRef = useRef<(() => void) | null>(null);
  const mobileCanvasDropIndexRef = useRef<number | null>(null);
  const mobileCanvasDropCleanupTimeoutRef = useRef<number | null>(null);
  const isDraggingMobileCanvasRef = useRef(false);
  const [mobileCanvasDrag, setMobileCanvasDrag] = useState<MobileCanvasDragState | null>(null);
  const [mobileCanvasDropIndex, setMobileCanvasDropIndex] = useState<number | null>(null);
  const [isMobileCanvasPreviewVisible, setIsMobileCanvasPreviewVisible] = useState(false);
  const [mobileCanvasDroppedFieldId, setMobileCanvasDroppedFieldId] = useState<string | null>(null);
  const activeMobileDragField = useMemo(
    () => allFields.find((field) => field.type === mobileSidebarDrag?.fieldType) || null,
    [mobileSidebarDrag]
  );
  const activeMobileCanvasDragField = useMemo(
    () => currentForm?.fields?.find((field) => field.id === mobileCanvasDrag?.fieldId) || null,
    [currentForm?.fields, mobileCanvasDrag]
  );
  const activeMobileCanvasDragConfig = useMemo(
    () =>
    activeMobileCanvasDragField ?
    allFields.find((field) => field.type === activeMobileCanvasDragField.type) || null :
    null,
    [activeMobileCanvasDragField]
  );
  const updateMobilePreviewPosition = () => {
    mobileDragRafRef.current = null;
    const point = mobileDragPointRef.current;
    const preview = mobilePreviewRef.current;
    if (!point || !preview) return;
    preview.style.transform = getCenteredPointerTransform(point.x, point.y);
  };
  const scheduleMobilePreviewPosition = () => {
    if (mobileDragRafRef.current !== null) return;
    mobileDragRafRef.current = requestAnimationFrame(updateMobilePreviewPosition);
  };
  const getMobileDropIndexAtPoint = (x: number, y: number) => {
    const canvas = document.querySelector('[data-rfd-droppable-id="CANVAS"]') as HTMLElement | null;
    if (!canvas) return null;
    const canvasRect = canvas.getBoundingClientRect();
    const isWithinCanvas =
    x >= canvasRect.left && x <= canvasRect.right &&
    y >= canvasRect.top && y <= canvasRect.bottom;
    if (!isWithinCanvas) return null;
    const fieldElements = getTopLevelCanvasSlots(canvas);
    if (fieldElements.length === 0) return 0;
    return getStableTopLevelDropIndexAtPoint(canvas, y, mobileDropIndexRef.current);
  };
  const updateMobileDropTarget = (
  x: number,
  y: number,
  options?: {mode?: "pointer" | "autoscroll";speed?: number;}) =>
  {
    const nextIndex = getMobileDropIndexAtPoint(x, y);
    const resolvedIndex =
    options?.mode === "autoscroll" ?
    getSteppedDropIndex(mobileDropIndexRef.current, nextIndex, options.speed || 0) :
    nextIndex;
    mobileDropIndexRef.current = resolvedIndex;
    setMobileDropIndex((currentIndex) =>
    currentIndex === resolvedIndex ? currentIndex : resolvedIndex
    );
  };
  const updateMobileAutoScroll = (y: number) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      mobileAutoScrollSpeedRef.current = 0;
      mobileAutoScrollTargetSpeedRef.current = 0;
      return;
    }
    mobileAutoScrollTargetSpeedRef.current = getAutoScrollTargetSpeed(scrollContainer, y);
  };
  const runMobileAutoScroll = () => {
    mobileAutoScrollRafRef.current = null;
    if (!isDraggingSidebarRef.current) {
      mobileAutoScrollSpeedRef.current = 0;
      mobileAutoScrollTargetSpeedRef.current = 0;
      return;
    }
    const scrollContainer = scrollContainerRef.current;
    const point = mobileDragPointRef.current;
    if (!scrollContainer || !point) return;
    const nextSpeed =
    mobileAutoScrollSpeedRef.current +
    (mobileAutoScrollTargetSpeedRef.current - mobileAutoScrollSpeedRef.current) * AUTO_SCROLL_SMOOTHING;
    mobileAutoScrollSpeedRef.current =
    Math.abs(nextSpeed) < AUTO_SCROLL_STOP_EPSILON &&
    Math.abs(mobileAutoScrollTargetSpeedRef.current) < AUTO_SCROLL_STOP_EPSILON ?
    0 :
    nextSpeed;
    if (mobileAutoScrollSpeedRef.current !== 0) {
      scrollContainer.scrollTop += mobileAutoScrollSpeedRef.current;
      const now = performance.now();
      if (now - mobileAutoScrollIndexTickRef.current >= AUTO_SCROLL_INDEX_STEP_INTERVAL) {
        mobileAutoScrollIndexTickRef.current = now;
        updateMobileDropTarget(point.x, point.y, {
          mode: "autoscroll",
          speed: mobileAutoScrollSpeedRef.current
        });
      }
    }
    mobileAutoScrollRafRef.current = requestAnimationFrame(runMobileAutoScroll);
  };
  const ensureMobileAutoScrollLoop = () => {
    if (mobileAutoScrollRafRef.current !== null) return;
    mobileAutoScrollRafRef.current = requestAnimationFrame(runMobileAutoScroll);
  };
  const stopMobileAutoScrollLoop = () => {
    mobileAutoScrollSpeedRef.current = 0;
    mobileAutoScrollTargetSpeedRef.current = 0;
    mobileAutoScrollIndexTickRef.current = 0;
    if (mobileAutoScrollRafRef.current !== null) {
      cancelAnimationFrame(mobileAutoScrollRafRef.current);
      mobileAutoScrollRafRef.current = null;
    }
  };
  const insertMobileSidebarField = (detail: MobileSidebarDragDetail) => {
    if (!currentForm || currentPage < 0 || activeSidebarTab === "logic") return null;
    const visualIndex = getMobileDropIndexAtPoint(detail.x, detail.y);
    if (visualIndex === null) return null;
    const currentFields = currentForm.fields || [];
    const newField = createFieldFromType(currentForm.id, detail.fieldType);
    const boundedVisualIndex = Math.min(visualIndex, visibleTopLevelFields.length);
    const insertIndex = findGlobalIndex(currentFields, currentPage, boundedVisualIndex);
    const nextFields = [...currentFields];
    nextFields.splice(insertIndex, 0, newField);
    const orderedFields = nextFields.map((field, index) => ({
      ...field,
      order: index
    }));
    setActiveFields(orderedFields);
    updateForm({ fields: orderedFields });
    selectField(newField.id);
    return newField.id;
  };
  const finishMobileSidebarDrag = (droppedFieldId?: string) => {
    setMobileDrawerContent(null);
    setIsMobileMenuOpen(false);
    setMobileSidebarDrag(null);
    setMobileDropIndex(null);
    mobileDropIndexRef.current = null;
    setIsDraggingSidebar(false);
    document.body.classList.remove("is-dragging-sidebar");
    if (droppedFieldId) {
      triggerDroppedFieldAnimation(
        droppedFieldId,
        sidebarDropCleanupTimeoutRef,
        setSidebarDroppedFieldId
      );
    }
  };
  const getMobileCanvasDropIndexAtPoint = (x: number, y: number) => {
    const canvas = document.querySelector('[data-rfd-droppable-id="CANVAS"]') as HTMLElement | null;
    if (!canvas) return null;
    const canvasRect = canvas.getBoundingClientRect();
    const isWithinCanvas =
    x >= canvasRect.left && x <= canvasRect.right &&
    y >= canvasRect.top && y <= canvasRect.bottom;
    if (!isWithinCanvas) return null;
    const fieldElements = getTopLevelCanvasSlots(canvas);
    if (fieldElements.length === 0) return 0;
    return getStableTopLevelDropIndexAtPoint(canvas, y, mobileCanvasDropIndexRef.current);
  };
  const updateMobileCanvasPreviewPosition = () => {
    mobileCanvasDragRafRef.current = null;
    const drag = mobileCanvasDragRef.current;
    const point = mobileCanvasDragPointRef.current;
    const preview = mobileCanvasPreviewRef.current;
    if (!drag || !point || !preview) return;
    preview.style.transform = getCenteredPointerTransform(point.x, point.y);
  };
  const scheduleMobileCanvasPreviewPosition = () => {
    if (mobileCanvasDragRafRef.current !== null) return;
    mobileCanvasDragRafRef.current = requestAnimationFrame(updateMobileCanvasPreviewPosition);
  };
  const updateMobileCanvasDropTarget = (
  x: number,
  y: number,
  options?: {mode?: "pointer" | "autoscroll";speed?: number;}) =>
  {
    const nextIndex = getMobileCanvasDropIndexAtPoint(x, y);
    const resolvedIndex =
    options?.mode === "autoscroll" ?
    getSteppedDropIndex(mobileCanvasDropIndexRef.current, nextIndex, options.speed || 0) :
    nextIndex;
    mobileCanvasDropIndexRef.current = resolvedIndex;
    setMobileCanvasDropIndex((currentIndex) =>
    currentIndex === resolvedIndex ? currentIndex : resolvedIndex
    );
  };
  const updateMobileCanvasAutoScroll = (y: number) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      mobileCanvasAutoScrollSpeedRef.current = 0;
      mobileCanvasAutoScrollTargetSpeedRef.current = 0;
      return;
    }
    mobileCanvasAutoScrollTargetSpeedRef.current = getAutoScrollTargetSpeed(scrollContainer, y);
  };
  const runMobileCanvasAutoScroll = () => {
    mobileCanvasAutoScrollRafRef.current = null;
    if (!isDraggingMobileCanvasRef.current) {
      mobileCanvasAutoScrollSpeedRef.current = 0;
      mobileCanvasAutoScrollTargetSpeedRef.current = 0;
      return;
    }
    const scrollContainer = scrollContainerRef.current;
    const point = mobileCanvasDragPointRef.current;
    if (!scrollContainer || !point) return;
    const nextSpeed =
    mobileCanvasAutoScrollSpeedRef.current +
    (mobileCanvasAutoScrollTargetSpeedRef.current - mobileCanvasAutoScrollSpeedRef.current) * AUTO_SCROLL_SMOOTHING;
    mobileCanvasAutoScrollSpeedRef.current =
    Math.abs(nextSpeed) < AUTO_SCROLL_STOP_EPSILON &&
    Math.abs(mobileCanvasAutoScrollTargetSpeedRef.current) < AUTO_SCROLL_STOP_EPSILON ?
    0 :
    nextSpeed;
    if (mobileCanvasAutoScrollSpeedRef.current !== 0) {
      scrollContainer.scrollTop += mobileCanvasAutoScrollSpeedRef.current;
      const now = performance.now();
      if (now - mobileCanvasAutoScrollIndexTickRef.current >= AUTO_SCROLL_INDEX_STEP_INTERVAL) {
        mobileCanvasAutoScrollIndexTickRef.current = now;
        updateMobileCanvasDropTarget(point.x, point.y, {
          mode: "autoscroll",
          speed: mobileCanvasAutoScrollSpeedRef.current
        });
      }
    }
    mobileCanvasAutoScrollRafRef.current = requestAnimationFrame(runMobileCanvasAutoScroll);
  };
  const ensureMobileCanvasAutoScrollLoop = () => {
    if (mobileCanvasAutoScrollRafRef.current !== null) return;
    mobileCanvasAutoScrollRafRef.current = requestAnimationFrame(runMobileCanvasAutoScroll);
  };
  const stopMobileCanvasAutoScrollLoop = () => {
    mobileCanvasAutoScrollSpeedRef.current = 0;
    mobileCanvasAutoScrollTargetSpeedRef.current = 0;
    mobileCanvasAutoScrollIndexTickRef.current = 0;
    if (mobileCanvasAutoScrollRafRef.current !== null) {
      cancelAnimationFrame(mobileCanvasAutoScrollRafRef.current);
      mobileCanvasAutoScrollRafRef.current = null;
    }
  };
  const commitMobileCanvasReorder = () => {
    const drag = mobileCanvasDragRef.current;
    const visualIndex = mobileCanvasDropIndexRef.current;
    if (!drag || visualIndex === null || !currentForm || currentPage < 0) return;
    const maxVisualIndex = Math.max(visibleTopLevelFields.length - 1, 0);
    const boundedVisualIndex = Math.min(visualIndex, maxVisualIndex);
    const reorderedFields = reorderTopLevelFieldBlock(
      currentForm.fields || [],
      currentPage,
      drag.fieldId,
      boundedVisualIndex
    );
    if (!reorderedFields) return;
    setActiveFields(reorderedFields);
    updateForm({ fields: reorderedFields });
    selectField(drag.fieldId);
  };
  const finishMobileCanvasDrag = (droppedFieldId?: string) => {
    mobileCanvasPointerCleanupRef.current?.();
    mobileCanvasPointerCleanupRef.current = null;
    isDraggingMobileCanvasRef.current = false;
    stopMobileCanvasAutoScrollLoop();
    requestAnimationFrame(() => {
      setMobileCanvasDrag(null);
      setMobileCanvasDropIndex(null);
      if (droppedFieldId) {
        triggerDroppedFieldAnimation(
          droppedFieldId,
          mobileCanvasDropCleanupTimeoutRef,
          setMobileCanvasDroppedFieldId
        );
      }
      requestAnimationFrame(() => {
        mobileCanvasDragRef.current = null;
        mobileCanvasDragPointRef.current = null;
        mobileCanvasDropIndexRef.current = null;
      });
    });
  };
  const handleMobileCanvasDragStart = (
  field: Field,
  event: React.PointerEvent<HTMLDivElement>) =>
  {
    if (
    activeSidebarTab === "logic" ||
    event.pointerType !== "touch" && event.pointerType !== "mouse" && event.pointerType !== "pen" ||
    event.pointerType === "mouse" && event.button !== 0 ||
    !event.isPrimary)
    {
      return;
    }
    const sourceIndex = visibleTopLevelFields.findIndex((entry) => entry.id === field.id);
    const handleElement = event.currentTarget;
    const fieldElement = handleElement.closest("[data-field-id]") as HTMLElement | null;
    if (sourceIndex === -1 || !fieldElement) return;
    event.preventDefault();
    event.stopPropagation();
    mobileCanvasPointerCleanupRef.current?.();
    stopMobileCanvasAutoScrollLoop();
    const pointerId = event.pointerId;
    const initialPoint = { x: event.clientX, y: event.clientY };
    const fieldRect = fieldElement.getBoundingClientRect();
    const dragState: MobileCanvasDragState = {
      fieldId: field.id,
      offsetX: initialPoint.x - fieldRect.left,
      offsetY: initialPoint.y - fieldRect.top,
      width: fieldRect.width,
      height: fieldRect.height,
      sourceIndex
    };
    try {
      handleElement.setPointerCapture(pointerId);
    } catch {}
    mobileCanvasDragRef.current = dragState;
    mobileCanvasDragPointRef.current = initialPoint;
    mobileCanvasDropIndexRef.current = sourceIndex;
    isDraggingMobileCanvasRef.current = true;
    setMobileCanvasDroppedFieldId(null);
    setIsMobileCanvasPreviewVisible(true);
    setMobileCanvasDrag(dragState);
    setMobileCanvasDropIndex(sourceIndex);
    scheduleMobileCanvasPreviewPosition();
    updateMobileCanvasAutoScroll(initialPoint.y);
    ensureMobileCanvasAutoScrollLoop();
    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      moveEvent.preventDefault();
      const nextPoint = { x: moveEvent.clientX, y: moveEvent.clientY };
      mobileCanvasDragPointRef.current = nextPoint;
      updateMobileCanvasDropTarget(nextPoint.x, nextPoint.y);
      scheduleMobileCanvasPreviewPosition();
      updateMobileCanvasAutoScroll(nextPoint.y);
    };
    const cleanupPointerListeners = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      try {
        handleElement.releasePointerCapture(pointerId);
      } catch {}
    };
    const handlePointerUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== pointerId) return;
      upEvent.preventDefault();
      const finalPoint = { x: upEvent.clientX, y: upEvent.clientY };
      mobileCanvasDragPointRef.current = finalPoint;
      updateMobileCanvasDropTarget(finalPoint.x, finalPoint.y);
      stopMobileCanvasAutoScrollLoop();
      setIsMobileCanvasPreviewVisible(false);
      requestAnimationFrame(() => {
        commitMobileCanvasReorder();
        finishMobileCanvasDrag(field.id);
      });
    };
    const handlePointerCancel = (cancelEvent: PointerEvent) => {
      if (cancelEvent.pointerId !== pointerId) return;
      stopMobileCanvasAutoScrollLoop();
      setIsMobileCanvasPreviewVisible(false);
      finishMobileCanvasDrag();
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp, { passive: false });
    window.addEventListener("pointercancel", handlePointerCancel, { passive: false });
    mobileCanvasPointerCleanupRef.current = cleanupPointerListeners;
  };
  useEffect(() => {
    if (!mobileSidebarDrag) {
      setMobileSidebarPlaceholderHeight(null);
      return;
    }
    const frameId = requestAnimationFrame(() => {
      const previewHeight = mobilePreviewRef.current?.getBoundingClientRect().height;
      setMobileSidebarPlaceholderHeight(
        previewHeight && previewHeight > 0 ? Math.ceil(previewHeight) : null
      );
    });
    return () => cancelAnimationFrame(frameId);
  }, [activeMobileDragField, mobileSidebarDrag, mobilePreviewRef]);
  useEffect(() => {
    return () => {
      if (mobileDragRafRef.current !== null) cancelAnimationFrame(mobileDragRafRef.current);
      if (mobileAutoScrollRafRef.current !== null) cancelAnimationFrame(mobileAutoScrollRafRef.current);
      if (mobileCanvasDragRafRef.current !== null) cancelAnimationFrame(mobileCanvasDragRafRef.current);
      mobileCanvasPointerCleanupRef.current?.();
      if (mobileCanvasDropCleanupTimeoutRef.current !== null) window.clearTimeout(mobileCanvasDropCleanupTimeoutRef.current);
      if (sidebarDropCleanupTimeoutRef.current !== null) window.clearTimeout(sidebarDropCleanupTimeoutRef.current);
      stopMobileAutoScrollLoop();
      stopMobileCanvasAutoScrollLoop();
    };
  }, []);
  useEffect(() => {
    const handleMobileSidebarDragStart = (event: Event) => {
      const detail = (event as CustomEvent<MobileSidebarDragDetail>).detail;
      isDraggingSidebarRef.current = true;
      mobileDragPointRef.current = { x: detail.x, y: detail.y };
      setSidebarDroppedFieldId(null);
      setMobileDrawerContent(null);
      setIsMobileMenuOpen(false);
      setMobileSidebarDrag(detail);
      setIsDraggingSidebar(true);
      updateMobileDropTarget(detail.x, detail.y);
      scheduleMobilePreviewPosition();
      updateMobileAutoScroll(detail.y);
      ensureMobileAutoScrollLoop();
      document.body.classList.add("is-dragging-sidebar");
    };
    const handleMobileSidebarDragMove = (event: Event) => {
      const detail = (event as CustomEvent<MobileSidebarDragDetail>).detail;
      mobileDragPointRef.current = { x: detail.x, y: detail.y };
      updateMobileDropTarget(detail.x, detail.y);
      scheduleMobilePreviewPosition();
      updateMobileAutoScroll(detail.y);
    };
    const handleMobileSidebarDragEnd = (event: Event) => {
      const detail = (event as CustomEvent<MobileSidebarDragDetail>).detail;
      isDraggingSidebarRef.current = false;
      mobileDragPointRef.current = { x: detail.x, y: detail.y };
      stopMobileAutoScrollLoop();
      const droppedFieldId = insertMobileSidebarField(detail);
      finishMobileSidebarDrag(droppedFieldId || undefined);
    };
    window.addEventListener(MOBILE_SIDEBAR_DRAG_START, handleMobileSidebarDragStart);
    window.addEventListener(MOBILE_SIDEBAR_DRAG_MOVE, handleMobileSidebarDragMove);
    window.addEventListener(MOBILE_SIDEBAR_DRAG_END, handleMobileSidebarDragEnd);
    return () => {
      window.removeEventListener(MOBILE_SIDEBAR_DRAG_START, handleMobileSidebarDragStart);
      window.removeEventListener(MOBILE_SIDEBAR_DRAG_MOVE, handleMobileSidebarDragMove);
      window.removeEventListener(MOBILE_SIDEBAR_DRAG_END, handleMobileSidebarDragEnd);
    };
  }, [activeSidebarTab, currentForm, currentPage, selectField, updateForm, visibleTopLevelFields.length]);
  useEffect(() => {
    if (!isDraggingSidebar) {
      isDraggingSidebarRef.current = false;
      setMobileDropIndex(null);
      mobileDropIndexRef.current = null;
      mobileDragPointRef.current = null;
      stopMobileAutoScrollLoop();
    }
  }, [isDraggingSidebar]);
  return {
    mobileSidebarDrag,
    mobileDropIndex,
    mobileSidebarPlaceholderHeight,
    sidebarDroppedFieldId,
    activeMobileDragField,
    mobileCanvasDrag,
    mobileCanvasDropIndex,
    isMobileCanvasPreviewVisible,
    mobileCanvasDroppedFieldId,
    activeMobileCanvasDragField,
    activeMobileCanvasDragConfig,
    mobileCanvasDragPointRef,
    handleMobileCanvasDragStart
  };
}