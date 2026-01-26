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

import { useTranslation } from 'react-i18next';

export default function BundleEditor() {
  const { t } = useTranslation();
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
  
  useEffect(() => {
    if (isDirty) {
        setSaveStatus('saving');
        const timer = setTimeout(async () => {
            try {
                await saveBundle();
                setSaveStatus('saved');
                setLastSaved(new Date());
            } catch (error) {
                console.error("Autosave failed", error);
                setSaveStatus('error');
            }
        }, 1000); 

        return () => clearTimeout(timer);
    }
  }, [isDirty, saveBundle]); 

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
          name: t('admin.editor.untitled'),
          description: '',
          isPII: false,
          isActive: true,
          fields: [],
        });
      } else if (id) {
        try {
          const response = await api.get(`/bundles/${id}`);
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
      case FieldType.TEXT: return t('admin.editor.field.short_text');
      case FieldType.TEXTAREA: return t('admin.editor.field.long_text');
      case FieldType.NUMBER: return t('admin.editor.field.number');
      case FieldType.EMAIL: return t('admin.editor.field.email');
      case FieldType.PHONE: return t('admin.editor.field.phone');
      case FieldType.DATE: return t('admin.editor.field.date');
      case FieldType.TIME: return t('admin.editor.field.time');
      case FieldType.RADIO: return t('admin.editor.field.single_choice');
      case FieldType.CHECKBOX: return t('admin.editor.field.multiple_choice');
      case FieldType.DROPDOWN: return t('admin.editor.field.dropdown');
      case FieldType.HEADER: return t('admin.editor.field.header');
      case FieldType.PARAGRAPH: return t('admin.editor.field.paragraph');
      case FieldType.DIVIDER: return t('admin.editor.field.separator');
      case FieldType.RATE: return t('admin.editor.field.rating');
      case FieldType.ADDRESS: return t('admin.editor.field.address');
      case FieldType.FULLNAME: return t('admin.editor.field.fullname');
      case FieldType.MATRIX: return t('admin.editor.field.matrix');
      case FieldType.TABLE: return t('admin.editor.field.table');
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
                     <h1 className="text-lg md:text-xl font-bold text-black truncate leading-tight">{bundle?.name || t('admin.editor.untitled')}</h1>
                     <Edit2 className="h-3.5 w-3.5 text-gray-400 group-hover:text-black opacity-0 group-hover:opacity-100 transition-all" />
                   </div>
                 )}
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                 
               <div className="flex items-center">
                 {saveStatus === 'saving' ? (
                     <div className="w-8 h-8 flex items-center justify-center">
                         <Loader size={20} />
                     </div>
                 ) : saveStatus === 'error' ? (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600" title={t('admin.editor.save_failed')}>
                          <X className="h-4 w-4" />
                      </div>
                 ) : (
                     <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600">
                         <Check className="h-4 w-4" />
                     </div>
                 )}
                 <span className="hidden md:inline text-xs text-gray-400 ml-2">
                     {saveStatus === 'saving' ? t('admin.editor.saving') : saveStatus === 'error' ? t('admin.editor.save_failed') : (
                         <span>
                             {t('admin.editor.saved')}
                             {lastSaved && ` at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`}
                         </span>
                     )}
                 </span>
               </div>

               <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />

               <div className="hidden md:flex items-center gap-1">
                    <button 
                        onClick={undo} 
                        disabled={history.past.length === 0} 
                        className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 transition-colors"
                        title={t('admin.editor.undo_shortcut')}
                    >
                        <Undo2 className="h-4 w-4"/>
                    </button>
                    <button 
                        onClick={redo} 
                        disabled={history.future.length === 0} 
                        className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 transition-colors"
                        title={t('admin.editor.redo_shortcut')}
                    >
                        <Redo2 className="h-4 w-4"/>
                    </button>
               </div>
               
               <div className="h-6 w-px bg-gray-200 mx-1" />

               <div className="flex items-center gap-2">
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
                                   <span>{t('admin.editor.status_draft')}</span>
                               </div>
                           </SelectItem>
                           <SelectItem value="published">
                               <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-green-500" />
                                   <span>{t('admin.editor.status_published')}</span>
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
