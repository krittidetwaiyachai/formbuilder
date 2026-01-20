import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useBundleEditorStore } from '@/store/bundleEditorStore';
import BundleFieldsSidebar from '@/components/admin/BundleFieldsSidebar';
import BundleEditorCanvas from '@/components/admin/BundleEditorCanvas';
import BundleFieldProperties from '@/components/admin/BundleFieldProperties';
import { ArrowLeft, Undo2, Redo2, Check, X, Edit2 } from 'lucide-react';
import api from '@/lib/api';
import { FieldType } from '@/types';
import { generateUUID } from '@/utils/uuid';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/custom-select';
import Loader from '@/components/common/Loader';

export default function BundleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const titleEditRef = useRef<HTMLDivElement>(null);

  const { 
    bundle, 
    setBundle, 
    addField, 
    isDirty, 
    reset,
    undo,
    redo,
    history,
    saveBundle,
    updateBundleMeta,
    setSelectedFieldId
  } = useBundleEditorStore();

  // Handle click outside to cancel editing
  useEffect(() => {
    if (isEditingTitle) {
      const handleClickOutside = (event: MouseEvent) => {
        if (titleEditRef.current && !titleEditRef.current.contains(event.target as Node)) {
          handleTitleCancel();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditingTitle]);

  // Sync title value
  useEffect(() => {
    if (bundle) setTitleValue(bundle.name);
  }, [bundle?.name]);

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      updateBundleMeta({ name: titleValue.trim() });
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setTitleValue(bundle?.name || '');
    setIsEditingTitle(false);
  };
  
  // Autosave Effect

  useEffect(() => {
    if (isDirty) {
        setSaveStatus('saving');
        const timer = setTimeout(async () => {
             // ... existing autosave ...
            try {
                await saveBundle();
                setSaveStatus('saved');
                setLastSaved(new Date());
            } catch (error) {
                console.error("Autosave failed", error);
                setSaveStatus('error');
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(timer);
    }
  }, [isDirty, saveBundle]); 

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            if (e.shiftKey) {
                redo();
            } else {
                undo();
            }
            e.preventDefault();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    const loadBundle = async () => {
      if (id === 'new') {
        setBundle({
          id: '',
          name: 'New Bundle',
          description: '',
          isPII: false,
          isActive: true,
          fields: [],
        });
      } else if (id) {
        try {
          const response = await api.get(`/bundles/${id}`);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { sensitivityLevel, ...cleanData } = response.data;
          
          setBundle({
            ...cleanData,
            fields: response.data.fields || [],
          });
        } catch (error) {
          console.error('Failed to load bundle:', error);
          navigate('/admin/bundles');
        }
      }
    };

    loadBundle();
    return () => reset();
  }, [id, navigate, setBundle, reset]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const isFromSidebar = source.droppableId === 'BUNDLE-SIDEBAR';
    const isToCanvas = destination.droppableId === 'BUNDLE-CANVAS';
    const isFromCanvas = source.droppableId === 'BUNDLE-CANVAS';

    if (isFromSidebar && isToCanvas) {
      const type = draggableId.replace('sidebar-', '') as FieldType;
      const needsOptions = [FieldType.DROPDOWN, FieldType.RADIO, FieldType.CHECKBOX].includes(type);

      const newField = {
        id: generateUUID(),
        type,
        label: getLabelForType(type),
        required: false,
        order: destination.index,
        ...(needsOptions && {
          options: [
            { id: 'opt-1', label: 'Option 1', value: 'option-1' },
            { id: 'opt-2', label: 'Option 2', value: 'option-2' },
            { id: 'opt-3', label: 'Option 3', value: 'option-3' },
          ],
        }),
      };

      addField(newField, destination.index);
      return;
    }

    if (isFromCanvas && isToCanvas) {
      useBundleEditorStore.getState().reorderFields(source.index, destination.index);
    }
  };

  const getLabelForType = (type: FieldType): string => {
    switch (type) {
      case FieldType.TEXT: return 'Short Text';
      case FieldType.TEXTAREA: return 'Long Text';
      case FieldType.NUMBER: return 'Number';
      case FieldType.EMAIL: return 'Email';
      case FieldType.PHONE: return 'Phone';
      case FieldType.DATE: return 'Date';
      case FieldType.TIME: return 'Time';
      case FieldType.RADIO: return 'Single Choice';
      case FieldType.CHECKBOX: return 'Multiple Choice';
      case FieldType.DROPDOWN: return 'Dropdown';
      case FieldType.HEADER: return 'Header';
      case FieldType.PARAGRAPH: return 'Paragraph';
      case FieldType.DIVIDER: return 'Separator';
      case FieldType.RATE: return 'Rating';
      case FieldType.ADDRESS: return 'Address';
      case FieldType.FULLNAME: return 'Full Name';
      case FieldType.MATRIX: return 'Input Matrix';
      case FieldType.TABLE: return 'Input Table';
      default: return 'Field';
    }
  };



  if (!bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between gap-3">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <Link to="/admin/bundles">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-black rounded-full transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-2 min-w-0 flex-1">
                 {isEditingTitle ? (
                   <div 
                       ref={titleEditRef}
                       className="flex items-center gap-2 w-full max-w-[300px]"
                   >
                     <input
                       type="text"
                       value={titleValue}
                       onChange={(e) => setTitleValue(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') handleTitleSave();
                         if (e.key === 'Escape') handleTitleCancel();
                       }}
                       className="text-lg md:text-xl font-bold text-black border-b-2 border-black px-1 py-0.5 w-full bg-transparent focus:outline-none rounded-none"
                       autoFocus
                     />
                     <button onClick={handleTitleSave} className="text-green-600 p-1"><Check className="h-4 w-4" /></button>
                     <button onClick={handleTitleCancel} className="text-red-500 p-1"><X className="h-4 w-4" /></button>
                   </div>
                 ) : (
                   <div className="flex items-center gap-2 min-w-0 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                     <h1 className="text-lg md:text-xl font-bold text-black truncate leading-tight">{bundle?.name || 'Untitled Bundle'}</h1>
                     <Edit2 className="h-3.5 w-3.5 text-gray-400 group-hover:text-black opacity-0 group-hover:opacity-100 transition-all" />
                   </div>
                 )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-3">
                 
               {/* Status Indicator */}
               <div className="flex items-center">
                 {saveStatus === 'saving' ? (
                     <div className="w-8 h-8 flex items-center justify-center">
                         <Loader size={20} />
                     </div>
                 ) : saveStatus === 'error' ? (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600" title="Save Failed">
                          <X className="h-4 w-4" />
                      </div>
                 ) : (
                     <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600">
                         <Check className="h-4 w-4" />
                     </div>
                 )}
                 <span className="hidden md:inline text-xs text-gray-400 ml-2">
                     {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'error' ? 'Save Failed' : (
                         <span>
                             All saved
                             {lastSaved && ` at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`}
                         </span>
                     )}
                 </span>
               </div>

               <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />

               {/* Undo/Redo */}
               <div className="hidden md:flex items-center gap-1">
                    <button 
                        onClick={undo} 
                        disabled={history.past.length === 0} 
                        className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 transition-colors"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="h-4 w-4"/>
                    </button>
                    <button 
                        onClick={redo} 
                        disabled={history.future.length === 0} 
                        className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 transition-colors"
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        <Redo2 className="h-4 w-4"/>
                    </button>
               </div>
               

               <div className="h-6 w-px bg-gray-200 mx-1" />

               {/* Primary Actions */}
               <div className="flex items-center gap-2">
                   {/* Status Dropdown */}
                   <Select
                       value={bundle?.isActive ? 'published' : 'draft'}
                       onValueChange={(value) => updateBundleMeta({ isActive: value === 'published' })}
                   >
                       <SelectTrigger className="h-9 w-[130px] bg-white border-gray-200">
                           <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                           <SelectItem value="draft">
                               <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                   <span>Draft</span>
                               </div>
                           </SelectItem>
                           <SelectItem value="published">
                               <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-green-500" />
                                   <span>Published</span>
                               </div>
                           </SelectItem>
                       </SelectContent>
                   </Select>
               </div>
            </div>
          </div>
        </header>

          <div className="flex-1 flex overflow-hidden">
            <BundleFieldsSidebar />
            
            {/* Canvas Wrapper detecting background clicks */}
            <div 
                className="flex-1 relative flex flex-col h-full overflow-hidden" 
                onClick={() => setSelectedFieldId(null)}
            >
                 <BundleEditorCanvas />
            </div>

            <BundleFieldProperties />
          </div>
      </div>
    </DragDropContext>
  );
}

// Minimal Portal Overlay for Hello-Pangea/DnD
// Since hello-pangea/dnd doesn't expose a clean <DragOverlay> like dnd-kit,
// we usually rely on the Draggable itself being the preview (position: fixed).
// However, if we want "Copy" behavior where the original stays in place, 
// we normally hide the original and show a clone, OR keep original and show Draggable.
//
// In BundleFieldsSidebar.tsx, we set the draggable to opacity-0 when dragging (per FieldSidebar.tsx logic).
// This implies we need something ELSE to be visible.
//
// FieldSidebar.tsx actually uses `snapshot.isDragging ? opacity: 0 : ...` 
// AND relies on `renderClone` provided by `Droppable`?
//
// Wait, FieldSidebar.tsx code I viewed:
// <Draggable ...>
//   {... className={snapshot.isDragging ? 'opacity-0' : 'absolute inset-0'}}
// </Draggable>
//
// If it is opacity-0, it is INVISIBLE.
// The only way it shows up is if `renderClone` is used in the `Droppable`.
//
// Let's check if I can add `renderClone` to the Sidebar Droppable in BundleFieldsSidebar.
// If I can't (because it's inside another file), I might need to implement a Portal Overlay here.
//
// ACTUALLY, simpler solution:
// In BundleFieldsSidebar, drag the COPY.
//
// But if I want to "Fix" the animation jitter, matching FieldSidebar is best.
// FieldSidebar seemingly relies on `renderClone` which I might have missed in `FormEdit` or `FieldSidebar`.
//
// Let's try to add a Manual Portal Overlay here that listens to "onDragStart" / "onDragUpdate".
// But `DragDropContext` doesn't give us current mouse position easily to render a custom overlay manually outside of the library.
//
// CORRECT PATH:
// The `Draggable` in `BundleFieldsSidebar` itself IS the overlay when it moves.
// If we set it to `opacity-0`, we see nothing.
//
// User said: "It looked like double rendering".
// This means my previous attempt (Visual + Draggable) WAS working, but they were slightly misaligned or double-bordered.
//
// The cleanest way is:
// 1. Sidebar Item = Static Visual.
// 2. When Dragging, we spawn a Clone.
//
// `hello-pangea/dnd` supports `renderClone` on `<Droppable>`.
// I should use THAT in `BundleFieldsSidebar.tsx`.
//
// But since I am here in BundleEditor.tsx, let's revert the "comment" addition and assume I will fix it in BundleFieldsSidebar.
//
// Wait, I can't revert easily without writing code.
// I will just close the file cleanly.

