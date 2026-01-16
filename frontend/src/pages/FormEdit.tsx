import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { generateUUID } from '@/utils/uuid';
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
import { ArrowUp, Settings } from 'lucide-react';
import { useFormShortcuts } from '@/hooks/form/useFormShortcuts';
import { LiquidFab } from '@/components/ui/LiquidFab';

export default function FormBuilderPage() {
  const { t } = useTranslation();
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
    saveForm,
    setCurrentForm,
    deselectAll,
    toggleFieldSelection,
    additionalSelectedIds,
    setActiveSidebarTab,
    activeSidebarTab,
    undo,
    redo,
    historyIndex,
    history,
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

      updateForm,
      selectField,
      currentPage
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
          pageSettings: [{ id: generateUUID(), title: 'Page 1' }]
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
               pageSettings: [{ id: generateUUID(), title: 'Page 1' }]
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDrawerContent, setMobileDrawerContent] = useState<'fields' | 'properties' | 'settings' | null>(null);

  const openMobileDrawer = (content: 'fields' | 'properties' | 'settings') => {
    setMobileDrawerContent(content);
    setIsMobileMenuOpen(false);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerContent(null);
  };

  return (
    <div className="h-full flex flex-col">
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <div className="flex flex-1 bg-gray-50 overflow-hidden relative">
        
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:flex h-full">
            <FieldSidebar />
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileDrawerContent && (
            <div className="md:hidden fixed inset-0 z-[9999] flex">
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
                    onClick={closeMobileDrawer}
                />
                
                {/* Drawer Content */}
                <div className={`relative w-full max-w-[90%] md:max-w-[400px] h-full bg-white shadow-2xl animate-in ${mobileDrawerContent === 'fields' ? 'slide-in-from-left mr-auto md:rounded-r-2xl' : 'slide-in-from-right ml-auto md:rounded-l-2xl'} duration-300 flex flex-col overflow-hidden`}>
                    
                {/* Drawer Header - Hide for fields to save space */}
                    {mobileDrawerContent !== 'fields' && (
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                            <div className="flex items-center gap-2">
                                {mobileDrawerContent === 'properties' && (
                                    <>
                                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                            <Settings className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-gray-900">{t('builder.properties.title')}</span>
                                    </>
                                )}
                                {mobileDrawerContent === 'settings' && (
                                    <>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                                            <Settings className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-gray-900">{t('builder.settings')}</span>
                                    </>
                                )}
                            </div>
                            
                            <button 
                                onClick={closeMobileDrawer}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                    )}

                    {/* Floating Close Button for Fields view */}
                    {mobileDrawerContent === 'fields' && (
                        <button 
                            onClick={closeMobileDrawer}
                            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    )}

                    {/* Drawer Body */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
                        {mobileDrawerContent === 'fields' && (
                            <FieldSidebar 
                                onFieldSelected={closeMobileDrawer} 
                                className="w-full h-full flex flex-col shadow-none border-none"
                            />
                        )}
                        {mobileDrawerContent === 'properties' && (
                            <PropertiesPanel currentPage={currentPage} />
                        )}
                        {mobileDrawerContent === 'settings' && (
                            <PropertiesPanel currentPage={currentPage} />
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Mobile Speed Dial Menu */}
        <div className="md:hidden absolute bottom-40 right-10 z-[90]">
            {/* Sub-buttons (Radial Layout) */}
             <div className="absolute inset-0 flex items-center justify-center">
                {/* Settings (Vertical/Top) */}
                <button
                    onClick={() => openMobileDrawer('settings')}
                    className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out ${
                        isMobileMenuOpen 
                        ? '-translate-y-[90px] translate-x-0 opacity-100 scale-100' 
                        : 'translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none'
                    }`}
                    title={t('builder.settings')}
                >
                    {isMobileMenuOpen && <span className="speed-dial-label" style={{ marginTop: '-50px' }}>{t('builder.settings')}</span>}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                
                {/* Logic or Back to Canvas (Diagonal High) */}
                    {activeSidebarTab === 'logic' ? (
                        <button
                            onClick={() => { setActiveSidebarTab('builder'); setIsMobileMenuOpen(false); }}
                            className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-75 ${
                                isMobileMenuOpen 
                                ? '-translate-y-[75px] -translate-x-[45px] opacity-100 scale-100' 
                                : 'translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none'
                            }`}
                            title={t('builder.back_to_canvas')}
                        >
                            {isMobileMenuOpen && <span className="speed-dial-label" style={{ marginTop: '-14px' }}>{t('builder.back_to_canvas')}</span>}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                        </button>
                    ) : (
                        <button
                            onClick={() => { setActiveSidebarTab('logic'); setIsMobileMenuOpen(false); }}
                            className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-75 ${
                                isMobileMenuOpen 
                                ? '-translate-y-[75px] -translate-x-[45px] opacity-100 scale-100' 
                                : 'translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none'
                            }`}
                            title={t('builder.tabs.logic')}
                        >
                            {isMobileMenuOpen && <span className="speed-dial-label" style={{ marginTop: '-14px' }}>{t('builder.tabs.logic')}</span>}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v12"/><path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M15 6a9 9 0 0 0-9 9"/><path d="M18 15v6"/><path d="M21 18h-6"/></svg>
                        </button>
                    )}
                
                {/* Properties (Diagonal Low) */}
                <button
                    onClick={() => openMobileDrawer('properties')}
                    className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-100 ${
                        isMobileMenuOpen 
                        ? '-translate-y-[45px] -translate-x-[75px] opacity-100 scale-100' 
                        : 'translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none'
                    }`}
                    title={t('builder.properties.title')}
                >
                    {isMobileMenuOpen && <span className="speed-dial-label" style={{ marginTop: '0px' }}>{t('builder.properties.title')}</span>}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                </button>
                
                {/* Add Field (Horizontal/Left) */}
                <button
                    onClick={() => openMobileDrawer('fields')}
                    className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-150 ${
                        isMobileMenuOpen 
                        ? 'translate-y-0 -translate-x-[90px] opacity-100 scale-100' 
                        : 'translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none'
                    }`}
                    title={t('builder.add_field')}
                >
                    {isMobileMenuOpen && <span className="speed-dial-label">{t('builder.add_field')}</span>}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                </button>
                
                {/* Undo (Diagonal Low Right) */}
                <button
                    onClick={() => { undo(); setIsMobileMenuOpen(false); }}
                    disabled={historyIndex <= 0}
                    className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-75 disabled:opacity-30 disabled:cursor-not-allowed ${
                        isMobileMenuOpen 
                        ? 'translate-y-[45px] -translate-x-[75px] opacity-100 scale-100' 
                        : 'translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none'
                    }`}
                    title={t('builder_header.undo')}
                >
                    {isMobileMenuOpen && <span className="speed-dial-label">{t('builder_header.undo')}</span>}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                </button>
                
                {/* Redo (Near Undo) */}
                <button
                    onClick={() => { redo(); setIsMobileMenuOpen(false); }}
                    disabled={historyIndex >= history.length - 1}
                    className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-100 disabled:opacity-30 disabled:cursor-not-allowed ${
                        isMobileMenuOpen 
                        ? 'translate-y-[75px] -translate-x-[45px] opacity-100 scale-100' 
                        : 'translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none'
                    }`}
                    title={t('builder_header.redo')}
                >
                    {isMobileMenuOpen && <span className="speed-dial-label" style={{ marginTop: '25px' }}>{t('builder_header.redo')}</span>}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
                </button>
            </div>
            
            {/* Main FAB Toggle */}
             <div className="relative w-8 h-8 flex items-center justify-center z-50">
                <LiquidFab 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    isOpen={isMobileMenuOpen}
                />
            </div>
        </div>

        {/* Backdrop for speed dial when open */}
        {isMobileMenuOpen && (
            <div 
                className="md:hidden fixed inset-0 z-[89] bg-black/30 backdrop-blur-[2px] animate-in fade-in"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}

        <div className="flex-1 flex flex-col min-w-0"> {/* added min-w-0 to prevent flex item overflow */}
          
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
              <div className="absolute top-6 right-8 z-30 hidden md:block"> {/* Hide theme blob on mobile to save space, or maybe make it smaller? For now hiding to clean up UI */}
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
                className={`canvas-scroll-container flex-1 flex flex-col ${currentPage < 0 ? 'overflow-hidden' : 'overflow-y-auto'} px-4 md:px-8 pt-0 pb-0 scrollbar-hide relative scroll-smooth`}
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
                <div className={`${currentPage < 0 ? 'max-w-6xl' : 'max-w-2xl'} flex-grow mx-auto flex flex-col min-h-full pb-0 transition-all duration-300 w-full`}>
                  <div className={`${currentPage < 0 ? 'bg-white' : ''} px-2 md:px-0 py-0 flex-1 relative group`}>
                    
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
                            onOpenSettings={() => {
                              setActiveSidebarTab('settings');
                              openMobileDrawer('settings');
                            }}
                          />
                        )}
                        
                        <CanvasArea 
                          visibleFields={visibleFields}
                          currentForm={currentForm}
                          selectedFieldId={selectedFieldId}
                          onSelectField={selectField}
                          onDeselect={deselectAll}
                          onToggleSelect={toggleFieldSelection}
                          onOpenProperties={() => openMobileDrawer('properties')}
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
                    absolute bottom-36 md:bottom-24 left-4 md:left-auto md:right-8 z-30 p-3 bg-black text-white rounded-full shadow-xl 
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

            <div className="hidden md:block w-80 flex-shrink-0 overflow-hidden bg-white border-l border-gray-200" style={{ overscrollBehavior: 'none' }}>
              <PropertiesPanel currentPage={currentPage} />
            </div>
            
             {/* Mobile Properties Panel Drawer - Could be added as well, currently hiding to focus on main flow */}
            
          </div>
        </div>
      </div>
    </DragDropContext>
    </div>
  );
}
