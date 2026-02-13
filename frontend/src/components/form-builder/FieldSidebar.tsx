import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import {
  ChevronRight,
  ChevronLeft,
  Layers,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { fieldCategories, allFields } from './sidebar/config';
import { SidebarDragPreview } from './sidebar/SidebarDragPreview';
import { SidebarCategory } from './sidebar/SidebarCategory';
import { TemplatePopup } from './sidebar/TemplatePopup';

const useIsTouchDevice = () => {
    const [isTouch, setIsTouch] = React.useState(false);
    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const checkTouch = () => {
            return (
                ('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (window.matchMedia('(hover: none) and (pointer: coarse)').matches)
            );
        };
        setIsTouch(checkTouch());
    }, []);
    return isTouch;
};

interface FieldSidebarProps {
  onFieldSelected?: () => void;
  className?: string;
  variant?: 'list' | 'grid'; 
}

export default function FieldSidebar({ onFieldSelected, className, variant }: FieldSidebarProps) {
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const isTouch = useIsTouchDevice();

  useSmoothScroll('field-sidebar-scroll-container');

  const visualVariant = variant || (className ? 'grid' : 'list');

  const handleFieldSelect = () => {
      if (onFieldSelected) {
          onFieldSelected();
      }
  };

  return (
    <div 
      className={className || `bg-white border-r border-gray-200 flex flex-col h-full shadow-sm relative z-20 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-[300px]'}`}
    >

      {!className && (
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 shadow-md rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:scale-110 transition-all z-50 flex items-center justify-center w-8 h-8"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
      )}

      <div className={`p-4 border-b border-gray-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} bg-white relative`}>
        {!isCollapsed && <h2 className="font-semibold text-gray-800 whitespace-nowrap overflow-hidden">{t('builder.fields')}</h2>}
      </div>

       <div className={`border-b border-gray-100 bg-gray-50/50 ${isCollapsed ? 'p-2' : 'px-4 py-4'}`}>
            {isCollapsed ? (
                <button
                    onClick={() => setIsTemplateOpen(!isTemplateOpen)}
                    className="w-full flex items-center justify-center p-2 rounded-lg bg-black text-white hover:bg-zinc-800 transition-colors group relative overflow-hidden"
                    title="Field Bundles"
                >
                     <div className="absolute inset-0 bg-white/10 rounded-lg blur-sm group-hover:bg-white/20 transition-colors animate-pulse" />
                     <div className="relative z-10 p-1"><Layers className="h-5 w-5 animate-wiggle" /></div>
                </button>
            ) : (
                <button
                    onClick={() => setIsTemplateOpen(!isTemplateOpen)}
                    className="relative w-full group isolate"
                >
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl group-hover:bg-white/40 transition-colors duration-500 animate-pulse" />
                    <div className="absolute -inset-[2px] rounded-xl overflow-hidden pb-px">
                        <div className="absolute top-[50%] left-[50%] w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(transparent_0deg,transparent_270deg,white_360deg)] opacity-100 shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-spin-slow" />
                    </div>
                    <div className="relative w-full bg-black rounded-[10px] px-4 py-3 flex items-center justify-between z-10 border border-transparent group-hover:bg-zinc-950 overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 pointer-events-none" />
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
                        <div className="flex items-center gap-3 z-20">
                            <div className="relative group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300">
                                <Layers className="relative w-5 h-5 text-white animate-wiggle" />
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-sm font-bold text-white tracking-wide">{t('builder.field_bundles')}</span>
                                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase group-hover:text-white transition-colors">{t('builder.bundles_subtitle')}</span>
                            </div>
                        </div>
                         <div className="relative z-20">
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300 shadow-sm" />
                         </div>
                    </div>
                </button>
            )}
            <AnimatePresence>
                {isTemplateOpen && (<TemplatePopup onClose={() => setIsTemplateOpen(false)} />)}
            </AnimatePresence>
       </div>
 
       <div id="field-sidebar-scroll-container" className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'} space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent`}>
         <Droppable 
           droppableId="SIDEBAR" 
           isDropDisabled={true}
           renderClone={(provided, _snapshot, rubric) => {
              const fieldType = allFields[rubric.source.index];
              return (
                  <div
                     ref={provided.innerRef}
                     {...provided.draggableProps}
                     {...provided.dragHandleProps}
                     style={{
                         ...provided.draggableProps.style,
                         pointerEvents: 'none', 
                         zIndex: 99999, 
                     }}
                     className="pointer-events-none" 
                  >
                      <SidebarDragPreview fieldType={fieldType} />
                  </div>
              );
         }}
       >
         {(provided) => (
              <div 
                 ref={provided.innerRef} 
                 {...provided.droppableProps}
                 className={visualVariant === 'list' ? "space-y-6" : "space-y-8 pb-10"}
              >
                 {fieldCategories.map((category) => (
                     <SidebarCategory key={category.name} category={category} isCollapsed={isCollapsed} onFieldAdd={handleFieldSelect} variant={visualVariant} isTouch={isTouch} />
                 ))}
                 {provided.placeholder}
             </div>
         )}
       </Droppable>
       </div>
     </div>
   );
}
