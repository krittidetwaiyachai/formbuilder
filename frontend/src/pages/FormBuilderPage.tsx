import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DndContext, closestCenter, DragEndEvent, DragOverEvent, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { ArrowLeft, Edit2, Check, X, Eye, Send, Undo2, Redo2 } from 'lucide-react';
import { useFormStore } from '@/store/formStore';
import { FormStatus, FieldType, Field } from '@/types';
import FieldSidebar from '@/components/form-builder/FieldSidebar';
import FieldItem from '@/components/form-builder/FieldItem';
import FieldItemPreview from '@/components/form-builder/FieldItemPreview';
import PropertiesPanel from '@/components/form-builder/PropertiesPanel';
import api from '@/lib/api';

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewForm = searchParams.get('new') === 'true';
  const {
    currentForm,
    selectedFieldId,
    history,
    historyIndex,
    loadForm,
    saveForm,
    selectField,
    updateForm,
    setCurrentForm,
    addField,
    deleteField,
    reorderFields,
    undo,
    redo,
  } = useFormStore();
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragEvent, setDragEvent] = useState<DragStartEvent | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [sidebarDragFieldId, setSidebarDragFieldId] = useState<string | null>(null); // เก็บ field id ที่สร้างจาก sidebar (สำหรับลบเมื่อยกเลิก)

  // State for optimistic updates during drag
  const [activeFields, setActiveFields] = useState<Field[]>([]);
  
  // Sync local state with store when not dragging
  useEffect(() => {
    if (activeId === null && currentForm?.fields) {
      setActiveFields(currentForm.fields);
    }
  }, [currentForm?.fields, activeId]);

  const autoScrollIntervalRef = useRef<number | null>(null);
  const previousFormStrRef = useRef<string>('');
  const firstRenderRef = useRef(true);
  
  // Custom modifier: center horizontally, cursor at drag handle (top of box)
  const snapCenterTopToCursor = ({ transform, draggingNodeRect, pointerCoordinates, ...args }: any) => {
    // Use snapCenterToCursor for horizontal centering (works regardless of where you click)
    const centered = snapCenterToCursor({ transform, draggingNodeRect, pointerCoordinates, ...args });
    
    if (!draggingNodeRect) {
      return centered;
    }
    
    // Calculate offset to position cursor at drag handle (top area)
    // Drag handle structure in FieldItemPreview and FieldItem:
    // - Container: px-4 pt-3 pb-2
    //   * pt-3 = 0.75rem = 12px (padding-top)
    //   * pb-2 = 0.5rem = 8px (padding-bottom)
    //   * Total container height = 12px + 8px = 20px
    // - Line: h-0.5 = 0.125rem = 2px (height)
    // - Center of drag handle line = pt-3 (12px) + (pb-2/2) (4px) = 16px from top of overlay
    // 
    // Formula: offsetY = -(height/2) + dragHandleY
    // This moves from center (height/2) to top (0), then down to drag handle (16px)
    // 
    // If cursor is at bottom, we need to INCREASE dragHandleY value to move cursor up
    // offsetY = -(height/2) + dragHandleY
    // If offsetY is too negative, cursor will be at bottom
    // To move cursor up, we need to increase dragHandleY
    // The drag handle is at 16px from top, but we need to account for the calculation
    // Let's try an even larger value
    const dragHandleY = 120; // Further increased to move cursor up to the drag handle
    
    const offsetY = -(draggingNodeRect.height / 2) + dragHandleY;
    
    return {
      ...centered,
      y: centered.y + offsetY, // Position cursor at drag handle line
    };
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Prevent text selection (Ctrl+A) globally on this page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+A (Cmd+A on Mac) - but allow in input fields
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const target = e.target as HTMLElement;
        // Allow Ctrl+A in input, textarea, and contenteditable elements
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  // Track mouse position during drag
  useEffect(() => {
    if (!activeId) {
      setMousePosition(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeId]);

  // Auto-scroll canvas when dragging near edges with smooth animation
  useEffect(() => {
    if (!activeId || !mousePosition) {
      if (autoScrollIntervalRef.current) {
        cancelAnimationFrame(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      return;
    }

    // Check if dragging (from sidebar OR from canvas)
    const activeData = dragEvent?.active?.data?.current;
    if (!activeData || (activeData.source !== 'sidebar' && activeData.source !== 'canvas')) {
      if (autoScrollIntervalRef.current) {
        cancelAnimationFrame(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      return;
    }

    // Smooth auto-scroll with requestAnimationFrame
    const smoothScroll = () => {
      if (!mousePosition) return;

      const canvasElement = document.querySelector('.canvas-scroll-container') as HTMLDivElement;
      if (!canvasElement) return;

      const rect = canvasElement.getBoundingClientRect();
      const activeData = dragEvent?.active?.data?.current;
      const isFromSidebar = activeData?.source === 'sidebar';
      
      // Different settings for sidebar drag vs canvas drag
      const scrollThreshold = isFromSidebar ? 150 : 300; // Much narrower for sidebar
      const maxScrollSpeed = isFromSidebar ? 12 : 18; // Further reduced speed for sidebar
      const minScrollSpeed = isFromSidebar ? 1 : 3;
      const outsideMargin = isFromSidebar ? 60 : 120; // Further reduced margin for sidebar
      const horizontalMargin = isFromSidebar ? 30 : 30;

      const mouseY = mousePosition.y;
      const mouseX = mousePosition.x;

      // Check if mouse is within canvas horizontal bounds
      if (mouseX < rect.left - horizontalMargin || mouseX > rect.right + horizontalMargin) {
        autoScrollIntervalRef.current = requestAnimationFrame(smoothScroll);
        return;
      }

      // Check if canvas can scroll
      const canScrollDown = canvasElement.scrollTop < (canvasElement.scrollHeight - canvasElement.clientHeight);
      const canScrollUp = canvasElement.scrollTop > 0;

      let scrollSpeed = 0;

      // Scroll down when near bottom
      if (mouseY > rect.bottom - scrollThreshold && mouseY < rect.bottom + outsideMargin && canScrollDown) {
        // Calculate progressive speed based on distance from edge
        const distanceFromBottom = rect.bottom - mouseY;
        const normalizedDistance = Math.max(0, Math.min(1, distanceFromBottom / scrollThreshold));
        scrollSpeed = minScrollSpeed + (maxScrollSpeed - minScrollSpeed) * (1 - normalizedDistance);
        canvasElement.scrollTop += scrollSpeed;
      }
      // Scroll up when near top
      else if (mouseY < rect.top + scrollThreshold && mouseY > rect.top - outsideMargin && canScrollUp) {
        // Calculate progressive speed based on distance from edge
        const distanceFromTop = mouseY - rect.top;
        const normalizedDistance = Math.max(0, Math.min(1, distanceFromTop / scrollThreshold));
        scrollSpeed = minScrollSpeed + (maxScrollSpeed - minScrollSpeed) * (1 - normalizedDistance);
        canvasElement.scrollTop -= scrollSpeed;
      }

      autoScrollIntervalRef.current = requestAnimationFrame(smoothScroll);
    };

    autoScrollIntervalRef.current = requestAnimationFrame(smoothScroll);

    return () => {
      if (autoScrollIntervalRef.current) {
        cancelAnimationFrame(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [activeId, mousePosition, dragEvent]);

  useEffect(() => {
    if (id) {
      if (isNewForm && id.startsWith('temp-')) {
        // สร้าง form ใหม่ใน local state
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
        });
        setTitleValue('Untitled Form');
      } else {
        loadForm(id).catch((error: any) => {
           console.error('Error loading form:', error);
           // If backend is not available, create a temporary form
           if (error.code === 'ERR_NETWORK' || error.message?.includes('CONNECTION_REFUSED')) {
             console.warn('Backend not available, creating temporary form');
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
             });
             setTitleValue('Untitled Form');
           } else {
             setLoadingError('Failed to load form. Please try again or check your connection.');
           }
        });
      }
    }
  }, [id, isNewForm, loadForm, setCurrentForm]);

  useEffect(() => {
    if (currentForm) {
      setTitleValue(currentForm.title);
      // Initialize lastSaved from server data if not already set (e.g. on page refresh)
      if (!lastSaved && currentForm.updatedAt) {
        setLastSaved(new Date(currentForm.updatedAt));
      }
    }
  }, [currentForm]);

  // Auto-save logic
  useEffect(() => {
    if (!currentForm) return;
    
    // Create a string representation of the form content (excluding timestamps)
    // This allows us to detect REAL changes vs just timestamp updates from the server
    const { updatedAt, createdAt, ...contentToTrack } = currentForm;
    const currentFormStr = JSON.stringify(contentToTrack);

    // Skip the very first render to avoid saving immediately on load
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      previousFormStrRef.current = currentFormStr;
      return;
    }

    // Check if content actually changed
    if (currentFormStr === previousFormStrRef.current) {
      return;
    }
    
    // Update ref immediately so we don't trigger again for this state
    previousFormStrRef.current = currentFormStr;

    setSaving(true);
    const timer = setTimeout(() => {
      handleSave(true); // true = quiet mode (no success toast)
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentForm]);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    const activeData = event.active.data.current;
    
    // ถ้าเป็น sidebar drag - สร้าง field ใหม่ใน local state เท่านั้น
    if (activeData?.source === 'sidebar' && currentForm) {
      const fieldType = activeData.type as FieldType;
      const fieldLabel = activeData.label as string;
      
      const timestamp = Date.now();
      const tempFieldId = `temp-${timestamp}`;
      
      setSidebarDragFieldId(tempFieldId);
      setNewlyAddedFieldId(tempFieldId);
      
      // Create optimistic field
      const newOptimisticField: Field = {
        id: tempFieldId,
        formId: currentForm.id,
        type: fieldType,
        label: fieldLabel,
        required: false,
        order: activeFields.length,
        placeholder: '',
      };
      
      // Update local state immediately
      setActiveFields(prev => [...prev, newOptimisticField]);
      
      setActiveId(tempFieldId);
      setDragEvent({
        ...event,
        active: { 
          ...event.active, 
          id: tempFieldId,
          data: { current: { source: 'canvas', field: newOptimisticField } }
        }
      });

    } else {
      // Canvas drag
      setSidebarDragFieldId(null);
      setActiveId(id);
      setDragEvent(event);
    }
    
    setMousePosition(null);
  };

  // No longer needed for local updates
  const lastReorderTime = useRef(0);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Determine the ID of the item being dragged
    // If it's a sidebar drag, we use the temp ID we created
    const activeFieldId = sidebarDragFieldId ? sidebarDragFieldId : (active.id as string);
    const overFieldId = over.id as string;

    if (activeFieldId === overFieldId) return;

    const activeIndex = activeFields.findIndex(f => f.id === activeFieldId);
    const overIndex = activeFields.findIndex(f => f.id === overFieldId);

    // Only sort if we found both items in our local list
    if (activeIndex !== -1 && overIndex !== -1) {
      // Sort locally
      setActiveFields((items) => arrayMove(items, activeIndex, overIndex));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // ถ้าวางสำเร็จ (มี over)
    if (over) {
       // Commit change to store
       // activeFields is currently sorted reflecting the user's view.
       // We just update the whole fields list.
       
       // Re-index orders to be safe
       const finalFields = activeFields.map((f, index) => ({ ...f, order: index }));
       
       updateForm({ fields: finalFields });
       
       // Cleanup flags
       setSidebarDragFieldId(null);
       // newlyAddedFieldId remains active for highlighting
    } else {
       // Cancelled / Dropped outside
       if (sidebarDragFieldId) {
          // Revert: reset to store state
          setActiveFields(currentForm?.fields || []);
          setSidebarDragFieldId(null);
          setNewlyAddedFieldId(null);
       } else {
          // Revert sort
          setActiveFields(currentForm?.fields || []);
       }
    }
    
    setActiveId(null);
    setDragEvent(null);
    setMousePosition(null);
  };
  
  const handleSave = async (quiet = false) => {
    if (!currentForm) return;

    setSaving(true);
    if (!quiet) setMessage(null);
    
    try {
      if (isNewForm && currentForm.id.startsWith('temp-')) {
        // สร้าง form ใหม่
        const response = await api.post('/forms', {
          title: currentForm.title,
          description: currentForm.description,
          status: currentForm.status,
          isQuiz: currentForm.isQuiz,
          quizSettings: currentForm.quizSettings,
          fields: currentForm.fields?.map((f) => ({
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            required: f.required,
            validation: f.validation,
            order: f.order,
            options: f.options,
            correctAnswer: f.correctAnswer,
            score: f.score,
          })) || [],
        });
        
        // อัปเดต URL และ form
        const newId = response.data.form.id;
        setCurrentForm({ ...currentForm, id: newId });
        navigate(`/forms/${newId}/builder`, { replace: true });
        if (!quiet) setMessage({ type: 'success', text: 'Form created successfully!' });
      } else {
        // อัปเดต form ที่มีอยู่
        await saveForm();
        if (!quiet) setMessage({ type: 'success', text: 'Form saved successfully!' });
      }
      setLastSaved(new Date());
      if (!quiet) setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save form';
      const fieldErrors = error.response?.data?.errors;
      if (fieldErrors && Array.isArray(fieldErrors)) {
        const fieldErrorMessages = fieldErrors.map((err: any) => err.message || err).join(', ');
        setMessage({
          type: 'error',
          text: `${errorMessage}: ${fieldErrorMessages}`,
        });
      } else {
        setMessage({
          type: 'error',
          text: errorMessage,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (currentForm && titleValue.trim()) {
      updateForm({ title: titleValue.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTitleValue(currentForm?.title || '');
    setIsEditingTitle(false);
  };

  if (loadingError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            <p>{loadingError}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // State for newly added field visual feedback
  const [newlyAddedFieldId, setNewlyAddedFieldId] = useState<string | null>(null);

  // Clear new field highlight when selecting any field
  const handleSelectField = useCallback((id: string, autoFocus?: boolean) => {
    setNewlyAddedFieldId(null);
    selectField(id, autoFocus);
  }, [selectField]);

  // Canvas content renderer
  // Canvas content renderer
  const renderCanvasContent = () => {
    const { setNodeRef } = useDroppable({
      id: 'canvas',
      data: {
        droppableId: 'canvas',
      },
    });

    // Valid hook usage: Must be called unconditionally
    const itemIds = useMemo(() => activeFields.map((f) => f.id), [activeFields]);

    // Show blank loading state (or minimal skeleton) instead of "Empty State" text
    if (!currentForm) {
      return <div className="min-h-[200px]" />;
    }
    
    return (
      <div ref={setNodeRef} className="min-h-[200px]">
        {activeFields.length > 0 ? (
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {activeFields.map((field) => (
                <FieldItem
                  key={field.id}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  onSelect={handleSelectField}
                  // Highlight if it's currently being dragged from sidebar OR if it was just added
                  isNewFromSidebar={sidebarDragFieldId === field.id || newlyAddedFieldId === field.id}
                />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-lg mb-2">Drag or click elements to add</p>
            <p className="text-sm text-gray-500">
              Drag form elements from the left side panel or click to add them
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col" onKeyDown={(e) => {
      // Prevent Ctrl+A (Cmd+A on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        e.stopPropagation();
      }
    }}>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      autoScroll={false}
    >
      <div className="flex flex-1 bg-white overflow-hidden">
        <FieldSidebar />
        <div className="flex-1 flex flex-col">
          <div className="bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleSave();
                        if (e.key === 'Escape') handleTitleCancel();
                        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                          e.stopPropagation();
                        }
                      }}
                      className="text-xl font-bold text-black border border-gray-400 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-black select-text"
                      autoFocus
                    />
                    <button
                      onClick={handleTitleSave}
                      className="text-black hover:text-gray-700 p-1"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleTitleCancel}
                      className="text-black hover:text-gray-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 
                      onClick={handleTitleEdit}
                      className="text-xl font-bold text-black cursor-pointer hover:text-gray-700"
                      title="Click to edit title"
                    >
                      {currentForm?.title || 'Loading...'}
                    </h1>
                    <button
                      onClick={handleTitleEdit}
                      className="text-gray-500 hover:text-black p-1"
                      title="Edit title"
                      disabled={!currentForm}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {message && (
                <div
                  className={`px-4 py-2 rounded-md text-sm ${
                    message.type === 'success'
                      ? 'bg-gray-200 text-black'
                      : 'bg-gray-100 text-black'
                  }`}
                >
                  {message.text}
                </div>
              )}
              {/* Action Buttons (Save Status) */}
              <div className="flex items-center text-sm mr-2">
                {saving ? (
                  <span className="text-gray-500 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                    Saving...
                  </span>
                ) : !currentForm ? (
                  <span className="text-gray-500 flex items-center gap-2">
                     <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                     Loading...
                  </span>
                ) : lastSaved ? (
                  <span className="text-gray-500 flex items-center">
                    All changes saved at {lastSaved.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })} น.
                    <div className="ml-1.5 p-0.5 rounded-full bg-green-100">
                       <Check className="h-3 w-3 text-green-600" />
                    </div>
                  </span>
                ) : null}
              </div>

              <div className="w-px h-4 bg-gray-300 mx-1" />

              {/* Undo/Redo */}
              <div className="flex items-center gap-1">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 text-gray-400 hover:text-black rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 text-gray-400 hover:text-black rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <Redo2 className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => window.open(`/forms/${id}/preview`, '_blank')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-400 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-100"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Preview
              </button>
              <button
                onClick={() => handleSave(false)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Publish
              </button>
            </div>
          </div>
          </div>

          <div className="flex-1 flex overflow-hidden bg-white">
          <div 
            className="canvas-scroll-container flex-1 p-6 overflow-y-auto overflow-x-hidden bg-gray-100 scrollbar-hide"
            style={{
              overscrollBehaviorX: 'none',
            }}
          >
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-black mb-4">Form Fields</h2>
                {renderCanvasContent()}
              </div>
            </div>
          </div>
          <div className="overflow-hidden" style={{ overscrollBehavior: 'none' }}>
            <PropertiesPanel />
          </div>
          </div>
        </div>
      </div>
      
      <DragOverlay 
        dropAnimation={null}
        modifiers={
          dragEvent?.active?.data?.current?.source === 'canvas' 
            ? [snapCenterTopToCursor]  // Canvas: cursor at drag handle
            : dragEvent?.active?.data?.current?.source === 'sidebar'
            ? [snapCenterTopToCursor]  // Sidebar: cursor at drag handle (same as canvas)
            : undefined
        }
      >
        {activeId ? (() => {
          // Simplification: logic is now unified.
          // Because handleDragStart adds the sidebar item to activeFields immediately,
          // we can ALWAYS find the field in activeFields, regardless of source.
          const draggedField = activeFields.find(f => f.id === activeId);
          
          if (draggedField) {
             return (
               <div 
                 style={{ 
                   width: '400px', 
                   maxWidth: '90vw',
                   pointerEvents: 'none', // Ensure overlay doesn't interfere with mouse events
                   opacity: 0.9,
                 }}
               >
                 <FieldItemPreview field={draggedField} />
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
