import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DragStart, DropResult } from "@hello-pangea/dnd";
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
import { useMobileDrag, getCenteredPointerTransform } from "@/hooks/form/useMobileDrag";
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
import {
  checkTouchDevice,
  stripHtml,
  getFieldLabelForType } from
"./form-edit/utils/formEditUtils";
export default function FormBuilderPage() {
  const { t } = useTranslation();
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobilePreviewRef = useRef<HTMLDivElement>(null);
  const mobileCanvasPreviewRef = useRef<HTMLDivElement>(null);
  const desktopDropCleanupTimeoutRef = useRef<number | null>(null);
  const scrollToTopRafRef = useRef<number | null>(null);
  const isDraggingSidebarRef = useRef(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeFields, setActiveFields] = useState<Field[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [desktopDroppedFieldId, setDesktopDroppedFieldId] =
  useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDrawerContent, setMobileDrawerContent] = useState<
    "fields" | "properties" | "settings" | null>(
    null);
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
  const handleDragEnd = (result: DropResult) => {
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
  const {
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
  } = useMobileDrag({
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
  });
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