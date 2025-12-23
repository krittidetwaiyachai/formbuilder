import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useFormStore } from '@/store/formStore';
import { FieldType, Field, FormStatus } from '@/types';
import FieldSidebar from '@/components/form-builder/FieldSidebar';
import FieldItem from '@/components/form-builder/FieldItem';
import PropertiesPanel from '@/components/form-builder/PropertiesPanel';
import PageNavigation from '@/components/form-builder/PageNavigation';

// Extracted Components
import FormBuilderHeader from '@/components/form-builder/FormBuilderHeader';
import CanvasArea from '@/components/form-builder/CanvasArea';
import WelcomeScreenEditor from '@/components/form-builder/WelcomeScreenEditor';
import ThankYouScreenEditor from '@/components/form-builder/ThankYouScreenEditor';

// Custom Hooks
import { usePageManagement } from '@/hooks/usePageManagement';
import { useFormDragAndDrop } from '@/hooks/useFormDragAndDrop';

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isNewForm = searchParams.get('new') === 'true';
  const {
    currentForm,
    selectedFieldId,
    loadForm,
    selectField,
    updateForm,
    setCurrentForm,
  } = useFormStore();
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // State for optimistic updates during drag
  const [activeFields, setActiveFields] = useState<Field[]>([]);
  
  // Custom Hook for Drag & Drop
  const {
      activeId,
      sidebarDragFieldId,
      newlyAddedFieldId,
      handleDragStart,
      handleDragEnd,
      sensors,
      snapCenterTopToCursor,
      closestCenter
  } = useFormDragAndDrop({
      id: id!,
      activeFields,
      setActiveFields,
      currentForm,
      updateForm,
      selectField
  });

  // Sync local state with store when not dragging
  useEffect(() => {
    if (activeId === null && currentForm?.fields) {
      setActiveFields(currentForm.fields);
    }
  }, [currentForm?.fields, activeId]);

  const previousFormStrRef = useRef<string>('');
  const firstRenderRef = useRef(true);

  // Keyboard events (Prevent Ctrl+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

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
    if (currentForm) {
      if (!lastSaved && currentForm.updatedAt) setLastSaved(new Date(currentForm.updatedAt));
    }
  }, [currentForm]);

  // Auto-save logic
  const handleSave = async (isAutoSave = false) => {
    if (!currentForm) return;
    setSaving(true);
    try {
      await updateForm(currentForm); 
      await new Promise(r => setTimeout(r, 500));
      setLastSaved(new Date());
      if (!isAutoSave) {
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
      const timer = setTimeout(() => handleSave(true), 2000);
      previousFormStrRef.current = currentFormStr;
      return () => clearTimeout(timer);
    }
  }, [currentForm]);

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
      activeFields,
      setActiveFields,
      currentPage,
      setCurrentPage
  });

  // Filter visible fields for \"Canvas\"
  const visibleFields = useMemo(() => {
    const pages: Field[][] = [];
    let currentBatch: Field[] = [];
    
    activeFields.forEach(field => {
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
  }, [activeFields, currentPage]);

  if (loadingError) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{loadingError}</div>;
  }

  return (
    <div className="h-full flex flex-col" onKeyDown={(e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault(); e.stopPropagation();
      }
    }}>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd} 
      autoScroll={false}
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
            <div className="flex-1 flex flex-col relative min-w-0 bg-gray-100">
              
              <div 
                className="canvas-scroll-container flex-1 overflow-y-auto p-6 scrollbar-hide"
                style={{ overscrollBehaviorX: 'none' }}
              >
                <div className="max-w-2xl mx-auto flex flex-col min-h-[600px] pb-20">
                  <div className="bg-white rounded-xl shadow-sm p-6 flex-1 relative group">
                    
                    {currentPage === -1 && (
                        <WelcomeScreenEditor currentForm={currentForm} updateForm={updateForm} />
                    )}
                    
                    {currentPage === -2 && (
                        <ThankYouScreenEditor currentForm={currentForm} updateForm={updateForm} />
                    )}

                    {currentPage >= 0 && (
                      <CanvasArea 
                        visibleFields={visibleFields}
                        currentForm={currentForm}
                        selectedFieldId={selectedFieldId}
                        onSelectField={selectField}
                        sidebarDragFieldId={sidebarDragFieldId}
                        newlyAddedFieldId={newlyAddedFieldId}
                      />
                    )}
                  </div>
                </div>
              </div>

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
                      hasWelcome={currentForm?.welcomeSettings?.isActive ?? true}
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
      
      <DragOverlay dropAnimation={null} modifiers={[snapCenterTopToCursor]}>
        {activeId ? (() => {
          const draggedField = activeFields.find(f => f.id === activeId);
          if (draggedField) {
             return (
               <div style={{ width: '100%', maxWidth: '90vw', pointerEvents: 'none', opacity: 0.9 }}>
                 <FieldItem field={draggedField} isSelected={true} onSelect={() => {}} isOverlay={true} />
               </div>
             );
          }
          return null;
        })() : null}
      </DragOverlay>
    </DndContext>
    </div>
  );
}
