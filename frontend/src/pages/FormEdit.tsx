import { useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DragStart } from "@hello-pangea/dnd";
import { useFormStore } from "@/store/formStore";
import { FieldType } from "@/types";
import type { Field } from "@/types";
import FieldSidebar from "@/components/form-builder/FieldSidebar";
import FormBuilderHeader from "@/components/form-builder/FormBuilderHeader";
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
import { ArrowUp } from "lucide-react";

export default function FormBuilderPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeFields, setActiveFields] = useState<Field[]>([]);

  const {
    currentForm,
    selectedFieldId,
    updateForm,
    selectField,
    activeSidebarTab,
    additionalSelectedIds,
    setActiveSidebarTab,
  } = useFormStore();

  const { loadingError } = useFormLoad(id);
  useFormSocket(id);
  const { saving, message, lastSaved, handleSave } = useFormSave(id);

  const {
    onDragEnd,
    onDragStart: originalOnDragStart,
    isDragging,
  } = useFormDragAndDrop({
    id: id!,
    activeFields,
    setActiveFields,
    updateForm,
    selectField,
    currentPage,
  });

  const onDragStart = (start: DragStart) => {
    if (currentForm?.fields) setActiveFields(currentForm.fields);
    originalOnDragStart(start);
  };

  const fieldsToRender = isDragging ? activeFields : currentForm?.fields || [];

  const {
    selectField: notifySelectField,
    deselectField: notifyDeselectField,
    getFieldUsers,
  } = useCollaboration({
    formId: id || "",
    enabled: !!id && !id.startsWith("temp-"),
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDrawerContent, setMobileDrawerContent] = useState<
    "fields" | "properties" | "settings" | null
  >(null);

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
    handleReorderPages,
  } = usePageManagement({
    currentForm,
    activeFields: fieldsToRender,
    setActiveFields,
    currentPage,
    setCurrentPage,
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

  if (loadingError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {t("builder.access_denied")}
          </h2>
          <p className="text-gray-500 mb-6">
            {loadingError === "You don't have permission to access this form."
              ? t("builder.access_denied_msg")
              : loadingError}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium w-full"
          >
            {t("builder.back_to_dashboard")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <DragDropContext
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        autoScrollerOptions={{
          maxPixelScroll: 15,
          startFromPercentage: 0.2,
          maxScrollAtPercentage: 0.05,
        }}
      >
        <div className="flex flex-1 bg-gray-50 overflow-hidden relative">
          <div className="hidden md:flex h-full">
            <FieldSidebar />
          </div>

          <MobileDrawer
            isOpen={isMobileMenuOpen}
            setIsOpen={setIsMobileMenuOpen}
            drawerContent={mobileDrawerContent}
            openDrawer={openMobileDrawer}
            closeDrawer={() => setMobileDrawerContent(null)}
            currentPage={currentPage}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <FormBuilderHeader
              currentForm={currentForm}
              saving={saving}
              lastSaved={lastSaved}
              message={message}
              handleSave={handleSave}
              updateForm={updateForm}
            />

            <div className="flex-1 flex overflow-hidden bg-white">
              <div className="flex-1 flex flex-col relative min-w-0 bg-white">
                <ThemeActionButton setIsThemeModalOpen={setIsThemeModalOpen} />

                <SmoothScrollProvider targetId="builder-canvas-scroll-container">
                  <div
                    id="builder-canvas-scroll-container"
                    ref={scrollContainerRef}
                    className={`canvas-scroll-container flex-1 flex flex-col ${currentPage < 0 ? "overflow-hidden" : "overflow-y-auto"} px-4 md:px-8 pt-0 pb-0 scrollbar-hide relative`}
                    style={{ overscrollBehaviorX: "none" }}
                    onScroll={(e) => {
                      const target = e.target as HTMLDivElement;
                      setShowScrollTop(target.scrollTop > 300);
                    }}
                    onClick={() => {
                      if (selectedFieldId) selectField(null);
                    }}
                  >
                    {activeSidebarTab === "logic" ? (
                      <LogicCanvas />
                    ) : (
                      <>
                        {currentForm?.isQuiz && (
                          <QuizModeBanner
                            form={currentForm}
                            onOpenSettings={() =>
                              setActiveSidebarTab("settings")
                            }
                          />
                        )}
                        {currentPage === -1 ? (
                          <WelcomeScreenEditor
                            currentForm={currentForm}
                            updateForm={updateForm}
                          />
                        ) : currentPage === -2 ? (
                          <ThankYouScreenEditor
                            currentForm={currentForm}
                            updateForm={updateForm}
                          />
                        ) : (
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
                            />
                          </div>
                        )}
                      </>
                    )}

                    {showScrollTop && (
                      <button
                        onClick={() =>
                          scrollContainerRef.current?.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          })
                        }
                        className="fixed bottom-8 right-8 z-50 p-3 bg-white text-gray-600 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                        title={t("common.scroll_top")}
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </SmoothScrollProvider>

                {currentForm && (
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
                  />
                )}
              </div>

              <div className="hidden lg:flex w-[320px] bg-white border-l border-gray-200 flex-col h-full z-20">
                <PropertiesPanel currentPage={currentPage} />
              </div>

              <ThemeSelectionModal
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
                  themeName: currentForm?.settings?.themeName,
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
                      fontFamily: theme.fontFamily,
                    },
                  });
                }}
              />
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
