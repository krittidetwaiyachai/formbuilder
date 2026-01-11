import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { useFormStore } from '@/store/formStore';
import { FieldType, Field, FormStatus } from '@/types';
import FieldSidebar from '@/components/form-builder/FieldSidebar';
import PropertiesPanel from '@/components/form-builder/PropertiesPanel';
import PageNavigation from '@/components/form-builder/PageNavigation';

import FormBuilderHeader from '@/components/form-builder/FormBuilderHeader';
import CanvasArea from '@/components/form-builder/CanvasArea';
import WelcomeScreenEditor from '@/components/form-builder/properties/WelcomeScreenEditor';
import ThankYouScreenEditor from '@/components/form-builder/ThankYouScreenEditor';
import LogicCanvas from '@/components/form-builder/LogicCanvas';
import QuizModeBanner from '@/components/form-builder/QuizModeBanner';

// Custom Hooks
import { usePageManagement } from '@/hooks/form/usePageManagement';
import { useFormDragAndDrop } from '@/hooks/form/useDragAndDrop';
import { ArrowUp } from 'lucide-react';
import { useFormShortcuts } from '@/hooks/form/useFormShortcuts';

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewForm = searchParams.get('new') === 'true';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const {
    currentForm,
    selectedFieldId,
    loadForm,
    selectField,
    updateForm,
    saveForm, // Import saveForm
    setCurrentForm,

    deselectAll, // Destructure
    toggleFieldSelection, // Destructure
    additionalSelectedIds,
    setActiveSidebarTab,
    activeSidebarTab,
  } = useFormStore();
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const pendingNavigationRef = useRef<string | null>(null);
  const pendingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimestampRef = useRef<number>(0);

  // State for optimistic updates during drag
  const [activeFields, setActiveFields] = useState<Field[]>([]);
  
  // Custom Hook for Drag & Drop
  const {
      onDragEnd,
      onDragStart: originalOnDragStart,
      isDragging
  } = useFormDragAndDrop({
      id: id!,
      activeFields, // Pass local state directly
      setActiveFields,
      currentForm,
      updateForm,
      selectField
  });

  // Derived state for rendering: Use store directly unless dragging
  const fieldsToRender = isDragging ? activeFields : (currentForm?.fields || []);

  // Sync local state exactly when drag starts to ensure smooth transition
  const onDragStart = (start: any) => {
      // Initialize activeFields with current form state before drag begins
      if (currentForm?.fields) {
          setActiveFields(currentForm.fields);
      }
      originalOnDragStart(start);
  };

  // Remove the useEffect that was causing double-render lag
  /* 
  useEffect(() => {
    if (!isDragging && currentForm?.fields) {
      if (JSON.stringify(currentForm.fields) !== JSON.stringify(activeFields)) {
          setActiveFields(currentForm.fields);
      }
    }
  }, [currentForm, activeFields, setActiveFields, isDragging]);
  */

  const previousFormStrRef = useRef<string>('');
  const firstRenderRef = useRef(true);

  // Auto-save logic (defined here so we can pass to shortcuts)
  const handleSave = async (isAutoSave = false, silent = false, checkDebounce = false) => {
    if (!currentForm) return;
    
    // Check if there are actual changes
    const { updatedAt, createdAt, ...contentToTrack } = currentForm;
    const currentFormStr = JSON.stringify(contentToTrack);
    const hasChanges = currentFormStr !== previousFormStrRef.current;
    
    // Skip save if no changes (prevents unnecessary activity logs)
    if (!hasChanges) {
      return;
    }
    
    // Debounce check for manual saves (Ctrl+S)
    if (checkDebounce) {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimestampRef.current;
      if (timeSinceLastSave < 1000) {
        // Less than 1 second since last save, skip
        return;
      }
      lastSaveTimestampRef.current = now;
    }
    
    setSaving(true);
    try {
      // Use saveForm() from store to call API
      const savedForm = await saveForm(); 
      
      // If we just saved a new form (converted temp -> real), redirect
      if (savedForm && savedForm.id !== id) {
          navigate(`/forms/${savedForm.id}/builder`, { replace: true });
      }

      await new Promise(r => setTimeout(r, 500));
      setLastSaved(new Date());
      
      // Update previousFormStrRef after successful save
      previousFormStrRef.current = currentFormStr;
      
      if (!isAutoSave && !silent) {
          setMessage({ type: 'success', text: 'Form saved successfully' });
          setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      setMessage({ type: 'error', text: 'Failed to save form' });
    } finally {
      setSaving(false);
    }
  };

  // Initialize Shortcuts with handleSave
  useFormShortcuts(handleSave);

  // Load Form Logic
  useEffect(() => {
    if (id) {
      if (isNewForm && id.startsWith('temp-')) {
        setCurrentForm({
          id: id,
          title: 'Untitled Form',
          description: '',
          status: FormStatus.DRAFT,
          isQuiz: false,
          fields: [],
          conditions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdById: '',
          pageSettings: [{ id: crypto.randomUUID(), title: 'Page 1' }]
        });
      } else {
        loadForm(id).catch((error: any) => {
           if (error.code === 'ERR_NETWORK' || error.message?.includes('CONNECTION_REFUSED')) {
             console.warn('Backend not available, creating temporary form');
             setCurrentForm({
               id: id,
               title: 'Untitled Form',
               status: FormStatus.DRAFT,
               isQuiz: false,
               fields: [],
               conditions: [],
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString(),
               createdById: '',
               pageSettings: [{ id: crypto.randomUUID(), title: 'Page 1' }]
             });
           } else {
             setLoadingError('Failed to load form.');
           }
        });
      }
    }
  }, [id, isNewForm, loadForm, setCurrentForm]);



  useEffect(() => {
    if (!currentForm) return;
    const { updatedAt, createdAt, ...contentToTrack } = currentForm;
    const currentFormStr = JSON.stringify(contentToTrack);
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      previousFormStrRef.current = currentFormStr;
      return;
    }
    if (currentFormStr !== previousFormStrRef.current) {
      // Clear existing timer
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }
      
      // Set new timer - DON'T update previousFormStrRef here!
      // Let handleSave update it after successful save
      pendingTimerRef.current = setTimeout(async () => {
        await handleSave(true);
        pendingTimerRef.current = null;
      }, 1000);
      
      return () => {
        if (pendingTimerRef.current) {
          clearTimeout(pendingTimerRef.current);
        }
      };
    }
  }, [currentForm]);

  // Save before closing the page
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (!currentForm) return;
      
      // Check if there are unsaved changes
      const { updatedAt, createdAt, ...contentToTrack } = currentForm;
      const currentFormStr = JSON.stringify(contentToTrack);
      
      if (currentFormStr !== previousFormStrRef.current) {
        // Try to save synchronously before unload
        e.preventDefault();
        e.returnValue = '';
        
        // Save immediately
        try {
          await saveForm();
        } catch (error) {
          console.error('Failed to save before unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentForm, saveForm]);

  // Block navigation and save before leaving
  useEffect(() => {
    const handleLinkClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (!link || !currentForm) return;
      
      // Check if it's an internal navigation link
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
      
      // Check if there's a pending autosave timer
      const hasPendingSave = pendingTimerRef.current !== null;
      
      // Check if there are unsaved changes
      const { updatedAt, createdAt, ...contentToTrack } = currentForm;
      const currentFormStr = JSON.stringify(contentToTrack);
      
      if ((hasPendingSave || currentFormStr !== previousFormStrRef.current) && !isNavigating) {
        e.preventDefault();
        e.stopPropagation();
        
        // Clear pending timer if exists
        if (pendingTimerRef.current) {
          clearTimeout(pendingTimerRef.current);
          pendingTimerRef.current = null;
        }
        
        setIsNavigating(true);
        setSaving(true);
        pendingNavigationRef.current = href;
        
        try {
          await saveForm();
          previousFormStrRef.current = currentFormStr;
          setLastSaved(new Date());
          setMessage({ type: 'success', text: 'Saved before navigation' });
          
          // Navigate after save
          setTimeout(() => {
            navigate(href);
            setIsNavigating(false);
            setSaving(false);
          }, 300);
        } catch (error) {
          console.error('Failed to save before navigation:', error);
          setMessage({ type: 'error', text: 'Failed to save' });
          setIsNavigating(false);
          setSaving(false);
          pendingNavigationRef.current = null;
        }
      }
    };

    // Handle browser back button
    const handlePopState = async () => {
      if (!currentForm || isNavigating) return;
      
      // Check if there's a pending autosave timer
      const hasPendingSave = pendingTimerRef.current !== null;
      
      const { updatedAt, createdAt, ...contentToTrack } = currentForm;
      const currentFormStr = JSON.stringify(contentToTrack);
      
      if (hasPendingSave || currentFormStr !== previousFormStrRef.current) {
        // Prevent navigation
        window.history.pushState(null, '', window.location.href);
        
        // Clear pending timer if exists
        if (pendingTimerRef.current) {
          clearTimeout(pendingTimerRef.current);
          pendingTimerRef.current = null;
        }
        
        setIsNavigating(true);
        setSaving(true);
        
        try {
          await saveForm();
          previousFormStrRef.current = currentFormStr;
          setLastSaved(new Date());
          setMessage({ type: 'success', text: 'Saved before navigation' });
          
          // Allow navigation after save
          setTimeout(() => {
            setIsNavigating(false);
            setSaving(false);
            window.history.back();
          }, 300);
        } catch (error) {
          console.error('Failed to save before back navigation:', error);
          setMessage({ type: 'error', text: 'Failed to save' });
          setIsNavigating(false);
          setSaving(false);
        }
      }
    };

    // Intercept all link clicks
    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('popstate', handlePopState);
    
    // Push initial state to enable popstate detection
    window.history.pushState(null, '', window.location.href);
    
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentForm, isNavigating, navigate, saveForm]);

  // Use React Router's beforeunload for unsaved changes warning
  useBeforeUnload(
    React.useCallback(() => {
      if (!currentForm) return false;
      
      const { updatedAt, createdAt, ...contentToTrack } = currentForm;
      const currentFormStr = JSON.stringify(contentToTrack);
      
      return currentFormStr !== previousFormStrRef.current;
    }, [currentForm])
  );

  // Page Management Hook
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

  // Filter visible fields for "Canvas"
  const visibleFields = useMemo(() => {
    const pages: Field[][] = [];
    let currentBatch: Field[] = [];
    
    fieldsToRender.forEach(field => {
        if (field.type === FieldType.PAGE_BREAK) {
             currentBatch.push(field); 
             pages.push(currentBatch);
             currentBatch = [];
        } else {
             currentBatch.push(field);
        }
    });
    pages.push(currentBatch); 
    
    if (currentPage >= 0) {
        return pages[currentPage] || [];
    }
    return [];
  }, [fieldsToRender, currentPage]);

  if (loadingError) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{loadingError}</div>;
  }

  return (
    <div className="h-full flex flex-col">
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <div className="flex flex-1 bg-white overflow-hidden">
        <FieldSidebar />
        <div className="flex-1 flex flex-col">
          
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
              {/* Floating Theme Button */}
              <div className="absolute top-6 right-8 z-30">
                  <div className="relative w-16 h-16">
                    {/* Abstract colorful blob behind */}
                    <div 
                      className="absolute inset-0 opacity-80"
                      style={{
                        background: 'linear-gradient(135deg, #ffc9de, #e4c1f9, #c1d5f9, #c1f9e4, #f9f1c1)',
                        borderRadius: '60% 40% 50% 50% / 50% 60% 40% 50%',
                        animation: 'morph 3s ease-in-out infinite, gradientShift 2s ease infinite'
                      }}
                    />
                    
                    {/* Circular white button */}
                    <button
                      onClick={() => setActiveSidebarTab('theme')}
                      className="absolute inset-1 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group flex items-center justify-center"
                      title="Theme Settings"
                    >
                      {/* Icon */}
                      <svg className="w-7 h-7 relative z-10 transition-transform duration-300 group-hover:rotate-6" viewBox="0 0 24 24" fill="none">
                        <path 
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.512 2 12 2Z"
                          fill="#f8f8f8"
                          stroke="#e0e0e0"
                          strokeWidth="1.5"
                        />
                        <circle cx="7.5" cy="10" r="2" fill="#ffc9de" />
                        <circle cx="11" cy="6.5" r="2" fill="#e4c1f9" />
                        <circle cx="16" cy="9" r="2" fill="#c1d5f9" />
                        <circle cx="9" cy="14" r="1.5" fill="#c1f9e4" />
                      </svg>
                    </button>
                  </div>
                  <style>{`
                    @keyframes morph {
                      0%, 100% { border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%; }
                      25% { border-radius: 50% 60% 40% 50% / 40% 50% 60% 50%; }
                      50% { border-radius: 40% 50% 60% 50% / 50% 40% 50% 60%; }
                      75% { border-radius: 50% 40% 50% 60% / 60% 50% 40% 50%; }
                    }
                    @keyframes gradientShift {
                      0%, 100% { filter: hue-rotate(0deg); }
                      50% { filter: hue-rotate(30deg); }
                    }
                  `}</style>
              </div>
              
              <div 
                ref={scrollContainerRef}
                className={`canvas-scroll-container flex-1 ${currentPage < 0 ? 'overflow-hidden' : 'overflow-y-auto'} px-6 pt-0 ${currentPage < 0 ? 'pb-0' : 'pb-32'} scrollbar-hide relative scroll-smooth`}
                style={{ overscrollBehaviorX: 'none' }}
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  setShowScrollTop(target.scrollTop > 300);
                }}
                onClick={() => {
                  // If the click reaches here (bubbled from CanvasArea or clicked directly on gray background), deselect all.
                  // FieldItem stops propagation, so clicking fields won't trigger this.
                  deselectAll();
                }}
              >
                <div className={`${currentPage < 0 ? 'max-w-6xl' : 'max-w-2xl'} mx-auto flex flex-col min-h-full pb-0 transition-all duration-300`}>
                  <div className="bg-white px-6 py-0 flex-1 relative group">
                    
                    {currentPage === -1 && (
                        <WelcomeScreenEditor currentForm={currentForm} updateForm={updateForm} />
                    )}
                    
                    {currentPage === -2 && (
                        <ThankYouScreenEditor currentForm={currentForm} updateForm={updateForm} />
                    )}

                    {currentPage >= 0 && activeSidebarTab !== 'logic' && (
                      <>
                        {/* Quiz Mode Banner */}
                        {currentForm?.isQuiz && (
                          <QuizModeBanner 
                            form={currentForm} 
                            onOpenSettings={() => setActiveSidebarTab('settings')}
                          />
                        )}
                        
                        <CanvasArea 
                          visibleFields={visibleFields}
                          currentForm={currentForm}
                          selectedFieldId={selectedFieldId}
                          onSelectField={selectField}
                          onDeselect={deselectAll}
                          onToggleSelect={toggleFieldSelection}
                          additionalSelectedIds={additionalSelectedIds}
                        />
                      </>
                    )}

                    {activeSidebarTab === 'logic' && (
                      <LogicCanvas />
                    )}
                  </div>
                </div>

              </div>

              {/* Scroll to Top Button */}
              <button
                  onClick={() => {
                    const container = scrollContainerRef.current;
                    if (!container) return;

                    const startPosition = container.scrollTop;
                    const distance = -startPosition; // Scroll UP (negative distance)
                    const duration = 1000; // 1s for luxurious smooth scroll
                    let startTime: number | null = null;

                    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
                      t /= d / 2;
                      if (t < 1) return c / 2 * t * t + b;
                      t--;
                      return -c / 2 * (t * (t - 2) - 1) + b;
                    };



                    const animation = (currentTime: number) => {
                      if (startTime === null) startTime = currentTime;
                      const timeElapsed = currentTime - startTime;
                      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);

                      container.scrollTop = run;

                      if (timeElapsed < duration) {
                        requestAnimationFrame(animation);
                      }
                    };

                    requestAnimationFrame(animation);
                  }}
                  className={`
                    absolute bottom-24 right-8 z-30 p-3 bg-black text-white rounded-full shadow-xl 
                    transition-all duration-500 ease-spring
                    hover:scale-110 hover:bg-gray-800 hover:shadow-2xl
                    ${showScrollTop 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
                    }
                  `}
                >
                  <ArrowUp className="w-6 h-6" />
                </button>

              <div className="z-10">
                   <PageNavigation 
                      fields={activeFields}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      onAddPage={handleAddPage}
                      onAddWelcome={handleAddWelcome}
                      onAddThankYou={handleAddThankYou}
                      onDeletePage={handleDeletePage}
                      onRenamePage={handleRenamePage}
                      onReorderPages={handleReorderPages}
                      hasWelcome={currentForm?.welcomeSettings ? (currentForm.welcomeSettings.isActive ?? true) : false}
                      hasThankYou={currentForm?.thankYouSettings?.isActive ?? true}
                      className="border-t border-gray-200"
                      pageSettings={currentForm?.pageSettings}
                   />
              </div>
            </div>

            <div className="w-80 flex-shrink-0 overflow-hidden bg-white border-l border-gray-200" style={{ overscrollBehavior: 'none' }}>
              <PropertiesPanel currentPage={currentPage} />
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
    </div>
  );
}
