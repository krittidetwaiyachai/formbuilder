import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { generateUUID } from '@/utils/uuid';
import { DragDropContext } from '@hello-pangea/dnd';
import { useFormStore } from '@/store/formStore';
import { FieldType, Field, FormStatus } from '@/types';
import FieldSidebar from '@/components/form-builder/FieldSidebar';
import PropertiesPanel from '@/components/form-builder/PropertiesPanel';
import FormThemePanel from '@/components/builder/FormThemePanel';
import PageNavigation from '@/components/form-builder/PageNavigation';

import FormBuilderHeader from '@/components/form-builder/FormBuilderHeader';
import CanvasArea from '@/components/form-builder/CanvasArea';
import WelcomeScreenEditor from '@/components/form-builder/properties/WelcomeScreenEditor';
import ThankYouScreenEditor from '@/components/form-builder/ThankYouScreenEditor';
import LogicCanvas from '@/components/form-builder/LogicCanvas';
import QuizModeBanner from '@/components/form-builder/QuizModeBanner';


import { usePageManagement } from '@/hooks/form/usePageManagement';
import { useFormDragAndDrop } from '@/hooks/form/useDragAndDrop';
import { ArrowUp, Settings } from 'lucide-react';
import { useFormShortcuts } from '@/hooks/form/useFormShortcuts';
import { LiquidFab } from '@/components/ui/LiquidFab';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

import ThemeSelectionModal from '@/components/builder/ThemeSelectionModal';

export default function FormBuilderPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  
  
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  
  
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
    setSocket,
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
  
  const [deletePageConfirm, setDeletePageConfirm] = useState<{ isOpen: boolean; index: number | null }>({ isOpen: false, index: null });

  
  const [activeFields, setActiveFields] = useState<Field[]>([]);
  
  
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

  
  const fieldsToRender = isDragging ? activeFields : (currentForm?.fields || []);

  
  const onDragStart = (start: any) => {
      
      if (currentForm?.fields) {
          setActiveFields(currentForm.fields);
      }
      originalOnDragStart(start);
  };

  
   

  const previousFormStrRef = useRef<string>('');
  const firstRenderRef = useRef(true);

  
  const handleSave = async (isAutoSave = false, silent = false, checkDebounce = false) => {
    if (!currentForm) return;
    
    
    const { updatedAt, createdAt, ...contentToTrack } = currentForm;
    const currentFormStr = JSON.stringify(contentToTrack);
    const hasChanges = currentFormStr !== previousFormStrRef.current;
    
    
    if (!hasChanges) {
      return;
    }
    
    
    if (checkDebounce) {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimestampRef.current;
      if (timeSinceLastSave < 1000) {
        
        return;
      }
      lastSaveTimestampRef.current = now;
    }
    
    setSaving(true);
    try {
      
      const savedForm = await saveForm(); 
      
      
      if (savedForm && savedForm.id !== id) {
          navigate(`/forms/${savedForm.id}/builder`, { replace: true });
      }

      await new Promise(r => setTimeout(r, 500));
      setLastSaved(new Date());
      
      
      previousFormStrRef.current = currentFormStr;
      
      if (!isAutoSave && !silent) {
          setMessage({ type: 'success', text: t('builder.toast.save_success') });
          setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      setMessage({ type: 'error', text: t('builder.toast.save_error') });
    } finally {
      setSaving(false);
    }
  };

  
  useFormShortcuts(handleSave);

  
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
           console.error('Error loading form:', error);
           if (error.code === 'ERR_NETWORK' || error.message?.includes('CONNECTION_REFUSED')) {
             setLoadingError(t('builder.toast.load_error') + ' (Network Error)');
           } else if (error.response?.status === 403) {
             setLoadingError(t('builder.access_denied_msg'));
           } else {
             setLoadingError(t('builder.toast.load_error'));
           }
        });
      }
    }
  }, [id, isNewForm, loadForm, setCurrentForm]);

  // Socket connection
  useEffect(() => {
    if (!id || id.startsWith('temp-')) return;
    
    const socketUrl = import.meta.env.VITE_API_URL;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    let baseUrl: string;
    
    if (socketUrl) {
      baseUrl = socketUrl.replace('/api', '');
    } else if (backendUrl) {
      baseUrl = backendUrl.replace('/api', '');
    } else {
      baseUrl = window.location.origin;
    }

    // Connect to the 'forms' namespace
    const socket = io(`${baseUrl}/forms`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to form gateway');
      socket.emit('join_form', id);
    });

    socket.on('form_updated', (data: any) => {
      // Update form state without emitting back to socket
      // Using a function update to ensure we have latest state if needed, 
      // but here we just push the data from server
      updateForm(data, false); 
    });

    setSocket(socket);

    return () => {
      socket.emit('leave_form', id);
      socket.disconnect();
      setSocket(null);
    };
  }, [id, setSocket, updateForm]);

  
  useEffect(() => {
    if (currentForm?.updatedAt && lastSaved === null) {
      setLastSaved(new Date(currentForm.updatedAt));
    }
  }, [currentForm?.updatedAt, lastSaved]);



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
      
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }
      
      
      
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

  
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (!currentForm) return;
      
      
      const { updatedAt, createdAt, ...contentToTrack } = currentForm;
      const currentFormStr = JSON.stringify(contentToTrack);
      
      if (currentFormStr !== previousFormStrRef.current) {
        
        e.preventDefault();
        e.returnValue = '';
        
        
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

  
  useEffect(() => {
    const handleLinkClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (!link || !currentForm) return;
      
      
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
      
      
      const hasPendingSave = pendingTimerRef.current !== null;
      
      
      const { updatedAt, createdAt, ...contentToTrack } = currentForm;
      const currentFormStr = JSON.stringify(contentToTrack);
      
      if ((hasPendingSave || currentFormStr !== previousFormStrRef.current) && !isNavigating) {
        e.preventDefault();
        e.stopPropagation();
        
        
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
          setMessage({ type: 'success', text: t('builder.toast.save_before_nav') });
          
          
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

    
    const handlePopState = async () => {
      if (!currentForm || isNavigating) return;
      
      
      const hasPendingSave = pendingTimerRef.current !== null;
      
      const { updatedAt, createdAt, ...contentToTrack } = currentForm;
      const currentFormStr = JSON.stringify(contentToTrack);
      
      if (hasPendingSave || currentFormStr !== previousFormStrRef.current) {
        
        window.history.pushState(null, '', window.location.href);
        
        
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

    
    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('popstate', handlePopState);
    
    
    window.history.pushState(null, '', window.location.href);
    
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentForm, isNavigating, navigate, saveForm]);

  
  useBeforeUnload(
    React.useCallback(() => {
      if (!currentForm) return false;
      
      const { updatedAt, createdAt, ...contentToTrack } = currentForm;
      const currentFormStr = JSON.stringify(contentToTrack);
      
      return currentFormStr !== previousFormStrRef.current;
    }, [currentForm])
  );

  
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDrawerContent, setMobileDrawerContent] = useState<'fields' | 'properties' | 'settings' | null>(null);

  const openMobileDrawer = (content: 'fields' | 'properties' | 'settings') => {
    setMobileDrawerContent(content);
    setIsMobileMenuOpen(false);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerContent(null);
  };

  if (loadingError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('builder.access_denied')}</h2>
          <p className="text-gray-500 mb-6">{loadingError === "You don't have permission to access this form." ? t('builder.access_denied_msg') : loadingError}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium w-full"
          >
            {t('builder.back_to_dashboard')}
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
    >
      <div className="flex flex-1 bg-gray-50 overflow-hidden relative">
        
        { }
        <div className="hidden md:flex h-full">
            <FieldSidebar />
        </div>

        { }
        {mobileDrawerContent && (
            <div className="md:hidden fixed inset-0 z-[9999] flex">
                { }
                <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
                    onClick={closeMobileDrawer}
                />
                
                { }
                <div className={`relative w-full max-w-[90%] md:max-w-[400px] h-full bg-white shadow-2xl animate-in ${mobileDrawerContent === 'fields' ? 'slide-in-from-left mr-auto md:rounded-r-2xl' : 'slide-in-from-right ml-auto md:rounded-l-2xl'} duration-300 flex flex-col overflow-hidden`}>
                    
                { }
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

                    { }
                    {mobileDrawerContent === 'fields' && (
                        <button 
                            onClick={closeMobileDrawer}
                            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    )}

                    { }
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

        { }
        <div className="md:hidden absolute bottom-40 right-10 z-[90]">
            { }
             <div className="absolute inset-0 flex items-center justify-center">
                { }
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
                
                { }
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
                
                { }
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
                
                { }
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
                
                { }
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
                
                { }
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
            
            { }
             <div className="relative w-8 h-8 flex items-center justify-center z-50">
                <LiquidFab 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    isOpen={isMobileMenuOpen}
                />
            </div>
        </div>

        { }
        {isMobileMenuOpen && (
            <div 
                className="md:hidden fixed inset-0 z-[89] bg-black/30 backdrop-blur-[2px] animate-in fade-in"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}

        <div className="flex-1 flex flex-col min-w-0"> { }
          
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
              { }
              <div className="absolute top-6 right-8 z-30 hidden md:block"> { }
                  <div className="relative w-16 h-16">
                    { }
                    <div 
                      className="absolute inset-0 opacity-80"
                      style={{
                        background: 'linear-gradient(135deg, #ffc9de, #e4c1f9, #c1d5f9, #c1f9e4, #f9f1c1)',
                        borderRadius: '60% 40% 50% 50% / 50% 60% 40% 50%',
                        animation: 'morph 3s ease-in-out infinite, gradientShift 2s ease infinite'
                      }}
                    />
                    
                    { }
                    <button
                      onClick={() => setIsThemeModalOpen(true)}
                      className="absolute inset-1 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group flex items-center justify-center"
                      title={t('builder.theme.settings_title')}
                    >
                      { }
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
                        { }
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

              { }
              <button
                  onClick={() => {
                    const container = scrollContainerRef.current;
                    if (!container) return;

                    const startPosition = container.scrollTop;
                    const distance = -startPosition; 
                    const duration = 1000; 
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
                      fields={fieldsToRender}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      onAddPage={handleAddPage}
                      onAddWelcome={handleAddWelcome}
                      onAddThankYou={handleAddThankYou}
                      onDeletePage={(idx) => setDeletePageConfirm({ isOpen: true, index: idx })}
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
            
             { }
            
           </div>
        </div>
      </div>
    </DragDropContext>
      <ConfirmDialog
        open={deletePageConfirm.isOpen}
        onOpenChange={(open) => !open && setDeletePageConfirm(prev => ({ ...prev, isOpen: false }))}
        title={t('builder.pagination.delete_page_title')}
        description={t('builder.pagination.delete_page_desc')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
        onConfirm={() => {
            if (deletePageConfirm.index !== null) {
                handleDeletePage(deletePageConfirm.index);
            }
        }}
      />
      
      {currentForm && (
        <ThemeSelectionModal
            isOpen={isThemeModalOpen}
            onClose={() => setIsThemeModalOpen(false)}
            currentTheme={currentForm.settings as any}
            onThemeSelect={(newTheme) => {
                updateForm({ settings: { ...currentForm.settings, ...newTheme } });
            }}
        />
      )}
    </div>
  );
}
