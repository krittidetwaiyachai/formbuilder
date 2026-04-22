import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DragStart } from "@hello-pangea/dnd";
import { useFormStore } from "@/store/formStore";
import { FieldType } from "@/types";
import type { Field } from "@/types";
import FieldSidebar from "@/components/form-builder/FieldSidebar";
import FormBuilderHeader from "@/components/form-builder/FormBuilderHeader";
import { allFields } from "@/components/form-builder/sidebar/config";
import {
  FieldDragPreviewCard,
  SidebarDragPreview } from
"@/components/form-builder/sidebar/SidebarDragPreview";
import { usePageManagement } from "@/hooks/form/usePageManagement";
import { useFormDragAndDrop } from "@/hooks/form/useDragAndDrop";
import { useCollaboration } from "@/hooks/useCollaboration";
import ThemeSelectionModal from "@/components/builder/ThemeSelectionModal";
import { SmoothScrollProvider } from "@/contexts/SmoothScrollContext";
import { useFormLoad } from "@/hooks/form/useFormLoad";
import { useFormSocket } from "@/hooks/form/useFormSocket";
import { useFormSave } from "@/hooks/form/useFormSave";
import MobileDrawer from "@/components/form-builder/MobileDrawer";
import ThemeActionButton from "@/components/form-builder/ThemeActionButton";
import CanvasArea from "@/components/form-builder/CanvasArea";
import LogicCanvas from "@/components/form-builder/LogicCanvas";
import QuizModeBanner from "@/components/form-builder/QuizModeBanner";
import PropertiesPanel from "@/components/form-builder/PropertiesPanel";
import PageNavigation from "@/components/form-builder/PageNavigation";
import WelcomeScreenEditor from "@/components/form-builder/properties/WelcomeScreenEditor";
import ThankYouScreenEditor from "@/components/form-builder/ThankYouScreenEditor";
import { generateUUID } from "@/utils/uuid";
import type { MobileSidebarDragDetail } from "@/utils/mobileSidebarDrag";
import {
  MOBILE_SIDEBAR_DRAG_END,
  MOBILE_SIDEBAR_DRAG_MOVE,
  MOBILE_SIDEBAR_DRAG_START } from
"@/utils/mobileSidebarDrag";
const checkTouchDevice = () => {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(hover: none) and (pointer: coarse)").matches);
};
const getFieldLabelForType = (type: FieldType) => {
  const config = allFields.find((field) => field.type === type);
  if (config) {
    return config.label;
  }
  switch (type) {
    case FieldType.TEXT:
      return "Short Text";
    case FieldType.TEXTAREA:
      return "Long Text";
    case FieldType.NUMBER:
      return "Number";
    case FieldType.EMAIL:
      return "Email";
    case FieldType.PHONE:
      return "Phone";
    case FieldType.DATE:
      return "Date";
    case FieldType.TIME:
      return "Time";
    case FieldType.RADIO:
      return "Single Choice";
    case FieldType.CHECKBOX:
      return "Multiple Choice";
    case FieldType.DROPDOWN:
      return "Dropdown";
    case FieldType.HEADER:
      return "Heading";
    case FieldType.PARAGRAPH:
      return "Text Block";
    case FieldType.DIVIDER:
      return "Separator";
    case FieldType.PAGE_BREAK:
      return "Page Break";
    case FieldType.RATE:
      return "Star Rating";
    case FieldType.ADDRESS:
      return "Address";
    case FieldType.FULLNAME:
      return "Full Name";
    case FieldType.FILE:
      return "File Upload";
    case FieldType.MATRIX:
      return "Matrix Logic";
    case FieldType.TABLE:
      return "Input Table";
    case FieldType.GROUP:
      return "Field Group";
    default:
      return "Field";
  }
};
const stripHtml = (value?: string) =>
(value || "").
replace(/<[^>]*>/g, " ").
replace(/\s+/g, " ").
trim();
const getTopLevelCanvasSlots = (canvas: HTMLElement) =>
Array.from(
  canvas.querySelectorAll<HTMLElement>('[data-top-level-field-slot="true"]')
);
const getStableTopLevelDropIndexAtPoint = (
canvas: HTMLElement,
y: number,
currentIndex: number | null) =>
{
  const canvasRect = canvas.getBoundingClientRect();
  const fieldElements = getTopLevelCanvasSlots(canvas);
  if (fieldElements.length === 0) {
    return 0;
  }
  const midpoints = fieldElements.map((element) => {
    const rect = element.getBoundingClientRect();
    return rect.top + rect.height / 2;
  });
  let nextIndex = fieldElements.length;
  for (let index = 0; index < midpoints.length; index++) {
    if (y < midpoints[index]) {
      nextIndex = index;
      break;
    }
  }
  if (
  currentIndex === null ||
  currentIndex < 0 ||
  currentIndex > fieldElements.length)
  {
    return nextIndex;
  }
  const upperBoundary = currentIndex === 0 ? canvasRect.top : midpoints[currentIndex - 1];
  const lowerBoundary =
  currentIndex === fieldElements.length ? canvasRect.bottom : midpoints[currentIndex];
  const activeSpan = Math.max(40, lowerBoundary - upperBoundary);
  const hysteresis = Math.min(26, activeSpan * 0.18);
  if (y >= upperBoundary - hysteresis && y <= lowerBoundary + hysteresis) {
    return currentIndex;
  }
  return nextIndex;
};
const createFieldFromType = (formId: string, type: FieldType): Field => {
  const config = allFields.find((field) => field.type === type);
  const baseOptions = config?.options ? { ...config.options } : {};
  const field: Field = {
    id: generateUUID(),
    formId,
    type,
    label: getFieldLabelForType(type),
    required: false,
    order: 0,
    validation: config?.validation,
    options: type === FieldType.GROUP ? { ...baseOptions, collapsible: true } : baseOptions
  };
  if (
  type === FieldType.RADIO ||
  type === FieldType.CHECKBOX ||
  type === FieldType.DROPDOWN)
  {
    field.options = {
      ...baseOptions,
      subLabel: "",
      options: [
      { id: generateUUID(), label: "Option 1", value: "Option 1" },
      { id: generateUUID(), label: "Option 2", value: "Option 2" },
      { id: generateUUID(), label: "Option 3", value: "Option 3" }]
    };
  } else if (
  type === FieldType.TEXT ||
  type === FieldType.TEXTAREA ||
  type === FieldType.NUMBER ||
  type === FieldType.EMAIL ||
  type === FieldType.PHONE ||
  type === FieldType.DATE ||
  type === FieldType.TIME ||
  type === FieldType.RATE ||
  type === FieldType.FULLNAME ||
  type === FieldType.ADDRESS)
  {
    field.options = {
      ...baseOptions,
      subLabel: ""
    };
  }
  return field;
};
const findGlobalIndex = (
fields: Field[],
pageIndex: number,
visualIndex: number) =>
{
  let startIndex = 0;
  if (pageIndex > 0) {
    let foundBreaks = 0;
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].type === FieldType.PAGE_BREAK) {
        foundBreaks++;
        if (foundBreaks === pageIndex) {
          startIndex = i + 1;
          break;
        }
      }
    }
  }
  let currentVisualIndex = 0;
  let i = startIndex;
  while (i < fields.length) {
    const field = fields[i];
    if (field.type === FieldType.PAGE_BREAK) {
      if (currentVisualIndex === visualIndex) return i;
      currentVisualIndex++;
      if (currentVisualIndex === visualIndex) return i + 1;
      break;
    }
    if (!field.groupId || field.type === FieldType.GROUP) {
      if (currentVisualIndex === visualIndex) {
        return i;
      }
      currentVisualIndex++;
      if (field.type === FieldType.GROUP) {
        let j = i + 1;
        while (j < fields.length && fields[j].groupId === field.id) {
          j++;
        }
        i = j - 1;
      }
    }
    i++;
  }
  return i;
};
const getTopLevelFieldBlock = (fields: Field[], fieldId: string) => {
  const startIndex = fields.findIndex((field) => field.id === fieldId);
  if (startIndex === -1) {
    return null;
  }
  const rootField = fields[startIndex];
  if (rootField.groupId && rootField.type !== FieldType.GROUP) {
    return null;
  }
  let endIndex = startIndex + 1;
  if (rootField.type === FieldType.GROUP) {
    while (endIndex < fields.length && fields[endIndex].groupId === rootField.id) {
      endIndex++;
    }
  }
  return {
    startIndex,
    endIndex,
    block: fields.slice(startIndex, endIndex)
  };
};
const reorderTopLevelFieldBlock = (
fields: Field[],
pageIndex: number,
fieldId: string,
visualIndex: number) =>
{
  const blockRange = getTopLevelFieldBlock(fields, fieldId);
  if (!blockRange) {
    return null;
  }
  const fieldsWithoutBlock = [
  ...fields.slice(0, blockRange.startIndex),
  ...fields.slice(blockRange.endIndex)];
  const insertIndex = findGlobalIndex(fieldsWithoutBlock, pageIndex, visualIndex);
  const nextFields = [...fieldsWithoutBlock];
  nextFields.splice(insertIndex, 0, ...blockRange.block);
  return nextFields.map((field, index) => ({
    ...field,
    order: index
  }));
};
interface MobileCanvasDragState {
  fieldId: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  sourceIndex: number;
}
const triggerDroppedFieldAnimation = (
fieldId: string,
cleanupRef: MutableRefObject<number | null>,
setDroppedFieldId: Dispatch<SetStateAction<string | null>>) =>
{
  setDroppedFieldId(fieldId);
  if (cleanupRef.current !== null) {
    window.clearTimeout(cleanupRef.current);
  }
  cleanupRef.current = window.setTimeout(() => {
    setDroppedFieldId(null);
    cleanupRef.current = null;
  }, 220);
};
const AUTO_SCROLL_MAX_SPEED = 18;
const AUTO_SCROLL_SMOOTHING = 0.18;
const AUTO_SCROLL_STOP_EPSILON = 0.2;
const AUTO_SCROLL_INDEX_STEP_INTERVAL = 72;
const getAutoScrollTargetSpeed = (
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
const getSteppedDropIndex = (
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
const PREVIEW_HANDLE_CENTER_OFFSET = 15;
const getCenteredPointerTransform = (x: number, y: number) =>
`translate3d(${x}px, ${y}px, 0) translate(-50%, -${PREVIEW_HANDLE_CENTER_OFFSET}px)`;
export default function FormBuilderPage() {
  const { t } = useTranslation();
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobilePreviewRef = useRef<HTMLDivElement>(null);
  const mobileDragPointRef = useRef<{x: number;y: number;} | null>(null);
  const mobileDragRafRef = useRef<number | null>(null);
  const mobileAutoScrollRafRef = useRef<number | null>(null);
  const mobileAutoScrollSpeedRef = useRef(0);
  const mobileAutoScrollTargetSpeedRef = useRef(0);
  const mobileDropIndexRef = useRef<number | null>(null);
  const mobileAutoScrollIndexTickRef = useRef(0);
  const mobileCanvasPreviewRef = useRef<HTMLDivElement>(null);
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
  const sidebarDropCleanupTimeoutRef = useRef<number | null>(null);
  const desktopDropCleanupTimeoutRef = useRef<number | null>(null);
  const scrollToTopRafRef = useRef<number | null>(null);
  const isDraggingMobileCanvasRef = useRef(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeFields, setActiveFields] = useState<Field[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [mobileSidebarDrag, setMobileSidebarDrag] =
  useState<MobileSidebarDragDetail | null>(null);
  const [mobileSidebarPlaceholderHeight, setMobileSidebarPlaceholderHeight] =
  useState<number | null>(null);
  const [mobileDropIndex, setMobileDropIndex] = useState<number | null>(null);
  const [mobileCanvasDrag, setMobileCanvasDrag] =
  useState<MobileCanvasDragState | null>(null);
  const [mobileCanvasDropIndex, setMobileCanvasDropIndex] =
  useState<number | null>(null);
  const [isMobileCanvasPreviewVisible, setIsMobileCanvasPreviewVisible] =
  useState(false);
  const [mobileCanvasDroppedFieldId, setMobileCanvasDroppedFieldId] =
  useState<string | null>(null);
  const [sidebarDroppedFieldId, setSidebarDroppedFieldId] =
  useState<string | null>(null);
  const [desktopDroppedFieldId, setDesktopDroppedFieldId] =
  useState<string | null>(null);
  const {
    currentForm,
    selectedFieldId,
    updateForm,
    selectField,
    activeSidebarTab,
    additionalSelectedIds,
    setActiveSidebarTab
  } = useFormStore();
  const scrollCanvasToTop = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    if (scrollToTopRafRef.current !== null) {
      cancelAnimationFrame(scrollToTopRafRef.current);
      scrollToTopRafRef.current = null;
    }
    const startTop = container.scrollTop;
    if (startTop <= 0) {
      return;
    }
    const startTime = performance.now();
    const durationMs = 550;
    const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);
    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(progress);
      container.scrollTop = Math.max(0, startTop * (1 - eased));
      if (progress < 1 && container.scrollTop > 0) {
        scrollToTopRafRef.current = requestAnimationFrame(animate);
        return;
      }
      container.scrollTop = 0;
      scrollToTopRafRef.current = null;
      setShowScrollTop(false);
    };
    scrollToTopRafRef.current = requestAnimationFrame(animate);
  }, []);
  const updateScrollTopButtonVisibility = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || currentPage < 0 || activeSidebarTab === "logic") {
      setShowScrollTop(false);
      return;
    }
    const nativeScrolled = container.scrollTop > 300;
    const firstTopLevelSlot = container.querySelector<HTMLElement>(
      '[data-top-level-field-slot="true"]'
    );
    let visuallyScrolled = false;
    if (firstTopLevelSlot) {
      const containerRect = container.getBoundingClientRect();
      const firstFieldRect = firstTopLevelSlot.getBoundingClientRect();
      visuallyScrolled = firstFieldRect.top < containerRect.top - 120;
    }
    setShowScrollTop(nativeScrolled || visuallyScrolled);
  }, [activeSidebarTab, currentPage]);
  const { loadingError } = useFormLoad(id);
  useFormSocket(id);
  const { saving, hasUnsavedChanges, message, lastSaved, handleSave } = useFormSave(id);
  useEffect(() => {
    if (currentForm?.fields) {
      setActiveFields(currentForm.fields);
    }
  }, [currentForm?.fields]);
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      updateScrollTopButtonVisibility();
    });
    return () => cancelAnimationFrame(rafId);
  }, [
  selectedFieldId,
  currentPage,
  activeSidebarTab,
  currentForm?.fields?.length,
  updateScrollTopButtonVisibility]
  );
  useEffect(() => {
    setIsTouchDevice(checkTouchDevice());
  }, []);
  const {
    onDragEnd,
    onDragStart: originalOnDragStart,
    isDragging
  } = useFormDragAndDrop({
    id: id!,
    activeFields,
    setActiveFields,
    updateForm,
    selectField,
    currentPage
  });
  const onDragStart = (start: DragStart) => {
    if (desktopDropCleanupTimeoutRef.current !== null) {
      window.clearTimeout(desktopDropCleanupTimeoutRef.current);
      desktopDropCleanupTimeoutRef.current = null;
    }
    setDesktopDroppedFieldId(null);
    originalOnDragStart(start);
    if (start.source.droppableId === "SIDEBAR") {
      isDraggingSidebarRef.current = true;
      setIsDraggingSidebar(true);
      document.body.classList.add("is-dragging-sidebar");
    }
  };
  const handleDragEnd = (result: any) => {
    const droppedFieldId =
    result?.source?.droppableId === "CANVAS" &&
    result?.destination?.droppableId === "CANVAS" &&
    typeof result?.draggableId === "string" &&
    !result.draggableId.startsWith("sidebar-") ?
    result.draggableId :
    null;
    isDraggingSidebarRef.current = false;
    setIsDraggingSidebar(false);
    document.body.classList.remove("is-dragging-sidebar");
    onDragEnd(result);
    if (droppedFieldId) {
      triggerDroppedFieldAnimation(
        droppedFieldId,
        desktopDropCleanupTimeoutRef,
        setDesktopDroppedFieldId
      );
    }
    if (result?.source?.droppableId === "SIDEBAR") {
      setMobileDrawerContent(null);
      setIsMobileMenuOpen(false);
    }
  };
  useEffect(() => {
    if (!isDragging) {
      if (isDraggingSidebarRef.current || document.body.classList.contains("is-dragging-sidebar")) {
        setMobileDrawerContent(null);
        setIsMobileMenuOpen(false);
        isDraggingSidebarRef.current = false;
        setIsDraggingSidebar(false);
        document.body.classList.remove("is-dragging-sidebar");
      }
    }
  }, [isDragging]);
  const fieldsToRender = isDragging ? activeFields : currentForm?.fields || [];
  const {
    selectField: notifySelectField,
    deselectField: notifyDeselectField,
    getFieldUsers
  } = useCollaboration({
    formId: id || "",
    enabled: !!id && !id.startsWith("temp-")
  });
  useEffect(() => {
    if (!id || id.startsWith("temp-")) {
      return;
    }
    if (selectedFieldId) {
      notifySelectField(selectedFieldId);
      return;
    }
    notifyDeselectField();
  }, [id, selectedFieldId, notifySelectField, notifyDeselectField]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDrawerContent, setMobileDrawerContent] = useState<
    "fields" | "properties" | "settings" | null>(
    null);
  const isDraggingSidebarRef = useRef(false);
  const openMobileDrawer = (content: "fields" | "properties" | "settings") => {
    setMobileDrawerContent(content);
    setIsMobileMenuOpen(false);
  };
  const {
    handleAddPage,
    handleAddWelcome,
    handleAddThankYou,
    handleDeletePage,
    handleRenamePage,
    handleReorderPages
  } = usePageManagement({
    currentForm,
    activeFields: fieldsToRender,
    setActiveFields,
    currentPage,
    setCurrentPage
  });
  const visibleFields = useMemo(() => {
    const pages: Field[][] = [];
    let currentBatch: Field[] = [];
    fieldsToRender.forEach((field) => {
      if (field.type === FieldType.PAGE_BREAK) {
        currentBatch.push(field);
        pages.push(currentBatch);
        currentBatch = [];
      } else {
        currentBatch.push(field);
      }
    });
    pages.push(currentBatch);
    if (currentPage >= 0) return pages[currentPage] || [];
    return [];
  }, [fieldsToRender, currentPage]);
  const visibleTopLevelFields = useMemo(
    () => visibleFields.filter((field) => !field.groupId || field.type === FieldType.GROUP),
    [visibleFields]
  );
  const activeMobileDragField = useMemo(
    () => allFields.find((field) => field.type === mobileSidebarDrag?.fieldType) || null,
    [mobileSidebarDrag]
  );
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
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [activeMobileDragField, mobileSidebarDrag]);
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
  const getMobileDropIndexAtPoint = (x: number, y: number) => {
    const canvas = document.querySelector('[data-rfd-droppable-id="CANVAS"]') as HTMLElement | null;
    if (!canvas) {
      return null;
    }
    const canvasRect = canvas.getBoundingClientRect();
    const isWithinCanvas =
    x >= canvasRect.left &&
    x <= canvasRect.right &&
    y >= canvasRect.top &&
    y <= canvasRect.bottom;
    if (!isWithinCanvas) {
      return null;
    }
    const fieldElements = getTopLevelCanvasSlots(canvas);
    if (fieldElements.length === 0) {
      return 0;
    }
    return getStableTopLevelDropIndexAtPoint(canvas, y, mobileDropIndexRef.current);
  };
  const updateMobilePreviewPosition = () => {
    mobileDragRafRef.current = null;
    const point = mobileDragPointRef.current;
    const preview = mobilePreviewRef.current;
    if (!point || !preview) {
      return;
    }
    preview.style.transform = getCenteredPointerTransform(point.x, point.y);
  };
  const scheduleMobilePreviewPosition = () => {
    if (mobileDragRafRef.current !== null) {
      return;
    }
    mobileDragRafRef.current = requestAnimationFrame(updateMobilePreviewPosition);
  };
  const updateMobileDropTarget = (
  x: number,
  y: number,
  options?: {mode?: "pointer" | "autoscroll";speed?: number;}) =>
  {
    const nextIndex = getMobileDropIndexAtPoint(x, y);
    const resolvedIndex =
    options?.mode === "autoscroll" ?
    getSteppedDropIndex(
      mobileDropIndexRef.current,
      nextIndex,
      options.speed || 0
    ) :
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
    mobileAutoScrollTargetSpeedRef.current = getAutoScrollTargetSpeed(
      scrollContainer,
      y
    );
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
    if (!scrollContainer || !point) {
      return;
    }
    const nextSpeed =
    mobileAutoScrollSpeedRef.current +
    (mobileAutoScrollTargetSpeedRef.current - mobileAutoScrollSpeedRef.current) *
    AUTO_SCROLL_SMOOTHING;
    mobileAutoScrollSpeedRef.current =
    Math.abs(nextSpeed) < AUTO_SCROLL_STOP_EPSILON &&
    Math.abs(mobileAutoScrollTargetSpeedRef.current) < AUTO_SCROLL_STOP_EPSILON ?
    0 :
    nextSpeed;
    if (mobileAutoScrollSpeedRef.current !== 0) {
      scrollContainer.scrollTop += mobileAutoScrollSpeedRef.current;
      const now = performance.now();
      if (
      now - mobileAutoScrollIndexTickRef.current >=
      AUTO_SCROLL_INDEX_STEP_INTERVAL)
      {
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
    if (mobileAutoScrollRafRef.current !== null) {
      return;
    }
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
  const insertMobileSidebarField = (detail: MobileSidebarDragDetail) => {
    if (!currentForm || currentPage < 0 || activeSidebarTab === "logic") {
      return null;
    }
    const visualIndex = getMobileDropIndexAtPoint(detail.x, detail.y);
    if (visualIndex === null) {
      return null;
    }
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
  const getMobileCanvasDropIndexAtPoint = (x: number, y: number) => {
    const canvas = document.querySelector('[data-rfd-droppable-id="CANVAS"]') as HTMLElement | null;
    if (!canvas) {
      return null;
    }
    const canvasRect = canvas.getBoundingClientRect();
    const isWithinCanvas =
    x >= canvasRect.left &&
    x <= canvasRect.right &&
    y >= canvasRect.top &&
    y <= canvasRect.bottom;
    if (!isWithinCanvas) {
      return null;
    }
    const fieldElements = getTopLevelCanvasSlots(canvas);
    if (fieldElements.length === 0) {
      return 0;
    }
    return getStableTopLevelDropIndexAtPoint(
      canvas,
      y,
      mobileCanvasDropIndexRef.current
    );
  };
  const updateMobileCanvasPreviewPosition = () => {
    mobileCanvasDragRafRef.current = null;
    const drag = mobileCanvasDragRef.current;
    const point = mobileCanvasDragPointRef.current;
    const preview = mobileCanvasPreviewRef.current;
    if (!drag || !point || !preview) {
      return;
    }
    preview.style.transform = getCenteredPointerTransform(point.x, point.y);
  };
  const scheduleMobileCanvasPreviewPosition = () => {
    if (mobileCanvasDragRafRef.current !== null) {
      return;
    }
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
    getSteppedDropIndex(
      mobileCanvasDropIndexRef.current,
      nextIndex,
      options.speed || 0
    ) :
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
    mobileCanvasAutoScrollTargetSpeedRef.current = getAutoScrollTargetSpeed(
      scrollContainer,
      y
    );
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
    if (!scrollContainer || !point) {
      return;
    }
    const nextSpeed =
    mobileCanvasAutoScrollSpeedRef.current +
    (mobileCanvasAutoScrollTargetSpeedRef.current -
    mobileCanvasAutoScrollSpeedRef.current) *
    AUTO_SCROLL_SMOOTHING;
    mobileCanvasAutoScrollSpeedRef.current =
    Math.abs(nextSpeed) < AUTO_SCROLL_STOP_EPSILON &&
    Math.abs(mobileCanvasAutoScrollTargetSpeedRef.current) < AUTO_SCROLL_STOP_EPSILON ?
    0 :
    nextSpeed;
    if (mobileCanvasAutoScrollSpeedRef.current !== 0) {
      scrollContainer.scrollTop += mobileCanvasAutoScrollSpeedRef.current;
      const now = performance.now();
      if (
      now - mobileCanvasAutoScrollIndexTickRef.current >=
      AUTO_SCROLL_INDEX_STEP_INTERVAL)
      {
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
    if (mobileCanvasAutoScrollRafRef.current !== null) {
      return;
    }
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
    if (!drag || visualIndex === null || !currentForm || currentPage < 0) {
      return;
    }
    const maxVisualIndex = Math.max(visibleTopLevelFields.length - 1, 0);
    const boundedVisualIndex = Math.min(visualIndex, maxVisualIndex);
    const reorderedFields = reorderTopLevelFieldBlock(
      currentForm.fields || [],
      currentPage,
      drag.fieldId,
      boundedVisualIndex
    );
    if (!reorderedFields) {
      return;
    }
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
    event.pointerType !== "touch" &&
    event.pointerType !== "mouse" &&
    event.pointerType !== "pen" ||
    event.pointerType === "mouse" && event.button !== 0 ||
    !event.isPrimary)
    {
      return;
    }
    const sourceIndex = visibleTopLevelFields.findIndex((entry) => entry.id === field.id);
    const handleElement = event.currentTarget;
    const fieldElement = handleElement.closest("[data-field-id]") as HTMLElement | null;
    if (sourceIndex === -1 || !fieldElement) {
      return;
    }
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
    } catch {
    }
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
      if (moveEvent.pointerId !== pointerId) {
        return;
      }
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
      } catch {
      }
    };
    const handlePointerUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== pointerId) {
        return;
      }
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
      if (cancelEvent.pointerId !== pointerId) {
        return;
      }
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
    return () => {
      if (mobileDragRafRef.current !== null) {
        cancelAnimationFrame(mobileDragRafRef.current);
      }
      if (mobileCanvasDragRafRef.current !== null) {
        cancelAnimationFrame(mobileCanvasDragRafRef.current);
      }
      mobileCanvasPointerCleanupRef.current?.();
      if (mobileCanvasDropCleanupTimeoutRef.current !== null) {
        window.clearTimeout(mobileCanvasDropCleanupTimeoutRef.current);
      }
      if (sidebarDropCleanupTimeoutRef.current !== null) {
        window.clearTimeout(sidebarDropCleanupTimeoutRef.current);
      }
      if (desktopDropCleanupTimeoutRef.current !== null) {
        window.clearTimeout(desktopDropCleanupTimeoutRef.current);
      }
      if (scrollToTopRafRef.current !== null) {
        cancelAnimationFrame(scrollToTopRafRef.current);
      }
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
  }, [
  activeSidebarTab,
  currentForm,
  currentPage,
  selectField,
  updateForm,
  visibleTopLevelFields.length]
  );
  useEffect(() => {
    if (!isDraggingSidebar) {
      isDraggingSidebarRef.current = false;
      setMobileDropIndex(null);
      mobileDropIndexRef.current = null;
      mobileDragPointRef.current = null;
      stopMobileAutoScrollLoop();
    }
  }, [isDraggingSidebar]);
  if (loadingError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">              <circle cx="12" cy="12" r="10" />              <line x1="12" y1="8" x2="12" y2="12" />              <line x1="12" y1="16" x2="12.01" y2="16" />            </svg>          </div>          <h2 className="text-2xl font-bold mb-2">            {t("builder.access_denied")}          </h2>          <p className="text-gray-500 mb-6">            {loadingError === "You don't have permission to access this form." ?
            t("builder.access_denied_msg") :
            loadingError}          </p>          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium w-full">            {t("builder.back_to_dashboard")}          </button>        </div>      </div>);
  }
  return (
    <div className="h-full flex flex-col">      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragStart={onDragStart}
        autoScrollerOptions={{
          maxPixelScroll: 15,
          startFromPercentage: 0.2,
          maxScrollAtPercentage: 0.05
        }}>        <div className="flex flex-1 bg-gray-50 overflow-hidden relative">          <div className="hidden md:flex h-full">            <FieldSidebar />          </div>          <MobileDrawer
            isOpen={isMobileMenuOpen}
            setIsOpen={setIsMobileMenuOpen}
            drawerContent={mobileDrawerContent}
            openDrawer={openMobileDrawer}
            closeDrawer={() => setMobileDrawerContent(null)}
            currentPage={currentPage}
            onOpenTheme={() => setIsThemeModalOpen(true)} />          {mobileSidebarDrag && activeMobileDragField &&
          <div
            ref={mobilePreviewRef}
            className="fixed left-0 top-0 z-[100000] pointer-events-none"
            style={{
              transform: getCenteredPointerTransform(
                mobileSidebarDrag.x,
                mobileSidebarDrag.y
              ),
              willChange: "transform"
            }}>            <SidebarDragPreview
              fieldType={activeMobileDragField}
              lightweight={isTouchDevice} />          </div>
          }          {isMobileCanvasPreviewVisible &&
          mobileCanvasDrag &&
          activeMobileCanvasDragField &&
          activeMobileCanvasDragConfig &&
          mobileCanvasDragPointRef.current &&
          <div
            ref={mobileCanvasPreviewRef}
            className="fixed left-0 top-0 z-[100001] pointer-events-none"
            style={{
              transform: getCenteredPointerTransform(
                mobileCanvasDragPointRef.current?.x ?? 0,
                mobileCanvasDragPointRef.current?.y ?? 0
              ),
              width: `${mobileCanvasDrag.width}px`,
              willChange: "transform"
            }}>            <FieldDragPreviewCard
              fieldType={activeMobileCanvasDragConfig}
              title={
              stripHtml(activeMobileCanvasDragField.label) ||
              t("common.untitled_field")
              }
              badgeLabel={getFieldLabelForType(activeMobileCanvasDragField.type)}
              width={mobileCanvasDrag.width}
              lightweight={isTouchDevice}>              <div className="space-y-2.5">                <div className="flex items-center justify-between gap-3">                  <div className="h-2 w-16 rounded-full bg-slate-200/90" />                  <div className="h-2 w-10 rounded-full bg-slate-100" />                </div>                <div className="h-10 rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,#FFFFFF,#F8FAFC)] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]" />                <div className="grid grid-cols-2 gap-2">                  <div className="h-8 rounded-xl bg-slate-100/90" />                  <div className="h-8 rounded-xl bg-slate-100/70" />                </div>              </div>            </FieldDragPreviewCard>          </div>
          }          <div className="flex-1 flex flex-col min-w-0">            <FormBuilderHeader
              currentForm={currentForm}
              saving={saving}
              hasUnsavedChanges={hasUnsavedChanges}
              lastSaved={lastSaved}
              message={message}
              handleSave={handleSave}
              updateForm={updateForm} />            <div className="flex-1 flex overflow-hidden bg-white">              <div className="flex-1 flex flex-col relative min-w-0 bg-white">                <ThemeActionButton setIsThemeModalOpen={setIsThemeModalOpen} />                <SmoothScrollProvider
                  targetId="builder-canvas-scroll-container"
                  enabled={!isTouchDevice && !isDraggingSidebar && !mobileCanvasDrag}>                  <div
                    id="builder-canvas-scroll-container"
                    ref={scrollContainerRef}
                    className={`canvas-scroll-container flex-1 flex flex-col ${currentPage < 0 ? "overflow-hidden" : "overflow-y-auto"} px-4 md:px-8 pt-0 pb-0 scrollbar-hide relative`}
                    style={{ overscrollBehaviorX: "none" }}
                    onScroll={updateScrollTopButtonVisibility}
                    onClick={() => {
                      if (selectedFieldId) selectField(null);
                    }}>
                    {activeSidebarTab === "logic" ?
                    <LogicCanvas /> :
                    <>                      {currentForm?.isQuiz &&
                      <QuizModeBanner
                        form={currentForm}
                        onOpenSettings={() => {
                          setActiveSidebarTab("settings");
                          openMobileDrawer("settings");
                        }} />
                      }                      {currentPage === -1 ?
                      <WelcomeScreenEditor
                        currentForm={currentForm}
                        updateForm={updateForm} /> :
                      currentPage === -2 ?
                      <ThankYouScreenEditor
                        currentForm={currentForm}
                        updateForm={updateForm} /> :
                      <div className="max-w-[700px] w-full mx-auto pb-32">
                            <CanvasArea
                          currentForm={currentForm}
                          visibleFields={visibleFields}
                          onSelectField={selectField}
                          selectedFieldId={selectedFieldId}
                          additionalSelectedIds={additionalSelectedIds}
                          getFieldUsers={getFieldUsers}
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                          handleAddPage={handleAddPage}
                          handleDeletePage={handleDeletePage}
                          handleRenamePage={handleRenamePage}
                          handleReorderPages={handleReorderPages}
                          handleAddWelcome={handleAddWelcome}
                          handleAddThankYou={handleAddThankYou}
                          isTouchDevice={isTouchDevice}
                          mobileDropIndex={mobileDropIndex}
                          isMobileDraggingSidebar={Boolean(mobileSidebarDrag)}
                          mobileSidebarPlaceholderHeight={mobileSidebarPlaceholderHeight}
                          mobileCanvasDropIndex={mobileCanvasDropIndex}
                          mobileCanvasDraggingFieldId={mobileCanvasDrag?.fieldId ?? null}
                          mobileCanvasDroppedFieldId={mobileCanvasDroppedFieldId}
                          sidebarDroppedFieldId={sidebarDroppedFieldId}
                          desktopDroppedFieldId={desktopDroppedFieldId}
                          onMobileCanvasDragStart={handleMobileCanvasDragStart} />
                          </div>
                      }                      </>
                    }                  </div>
                </SmoothScrollProvider>                {currentForm &&
                <PageNavigation
                  fields={currentForm?.fields || []}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onAddPage={handleAddPage}
                  onAddWelcome={handleAddWelcome}
                  onAddThankYou={handleAddThankYou}
                  onDeletePage={handleDeletePage}
                  onRenamePage={handleRenamePage}
                  onReorderPages={handleReorderPages}
                  hasWelcome={currentForm?.hasWelcome}
                  hasThankYou={currentForm?.hasThankYou}
                  showScrollTop={showScrollTop}
                  onScrollToTop={scrollCanvasToTop} />
                }
              </div>              <div className="hidden lg:flex w-[320px] bg-white border-l border-gray-200 flex-col h-full z-20">                <PropertiesPanel currentPage={currentPage} />              </div>              <ThemeSelectionModal
                isOpen={isThemeModalOpen}
                onClose={() => setIsThemeModalOpen(false)}
                currentTheme={{
                  primaryColor:
                  currentForm?.settings?.primaryColor || "#000000",
                  backgroundColor:
                  currentForm?.settings?.backgroundColor || "#FFFFFF",
                  backgroundType:
                  currentForm?.settings?.backgroundType || "color",
                  backgroundImage: currentForm?.settings?.backgroundImage,
                  textColor: currentForm?.settings?.textColor || "#1E293B",
                  buttonStyle: currentForm?.settings?.buttonStyle || "filled",
                  borderRadius: currentForm?.settings?.borderRadius || "medium",
                  fontFamily: currentForm?.settings?.fontFamily || "Inter",
                  themeName: currentForm?.settings?.themeName
                }}
                onThemeSelect={(theme) => {
                  updateForm({
                    settings: {
                      ...currentForm?.settings,
                      themeName: theme.themeName,
                      primaryColor: theme.primaryColor,
                      backgroundColor: theme.backgroundColor,
                      backgroundType: theme.backgroundType,
                      backgroundImage: theme.backgroundImage,
                      textColor: theme.textColor,
                      buttonStyle: theme.buttonStyle,
                      borderRadius: theme.borderRadius,
                      fontFamily: theme.fontFamily
                    }
                  });
                }} />            </div>          </div>        </div>      </DragDropContext>    </div>);
}