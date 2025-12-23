import React, { useState, useEffect } from 'react';
import { Plus, LayoutTemplate, FileText, CheckCircle2, X, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { Field, FieldType } from '@/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PageNavigationProps {
  fields: Field[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onAddPage: () => void;
  onAddWelcome?: () => void;
  onAddThankYou?: () => void;
  onDeletePage?: (pageIndex: number) => void;
  onRenamePage?: (pageIndex: number, newTitle: string) => void;
  onReorderPages?: (oldIndex: number, newIndex: number) => void;
  hasWelcome?: boolean;
  hasThankYou?: boolean;
  className?: string;
}

interface SortablePageTabProps {
  pageIndex: number;
  currentPage: number;
  totalContentPages: number;
  pageTitle: string;
  onPageChange: (page: number) => void;
  onDeletePage?: (pageIndex: number) => void;
  onRenamePage?: (pageIndex: number, newTitle: string) => void;
}

function SortablePageTab({
  pageIndex,
  currentPage,
  totalContentPages,
  pageTitle,
  onPageChange,
  onDeletePage,
  onRenamePage,
}: SortablePageTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `page-${pageIndex}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(pageTitle);

  useEffect(() => {
    setEditValue(pageTitle);
  }, [pageTitle]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop propagation to prevent drag
    setIsEditing(true);
  };

  const handleRename = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== pageTitle) {
      onRenamePage?.(pageIndex, editValue);
    } else {
      setEditValue(pageTitle);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(pageTitle);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer ${
        currentPage === pageIndex
          ? 'bg-black text-white shadow-md'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => !isEditing && onPageChange(pageIndex)}
      {...attributes}
    >
      <div 
        {...listeners} 
        className="mr-2 cursor-grab active:cursor-grabbing hover:text-gray-400"
        onClick={(e) => e.stopPropagation()} // Prevent page switch when clicking drag handle
      >
         <GripVertical className={`w-3 h-3 ${currentPage === pageIndex ? 'text-gray-400' : 'text-gray-300'}`} />
      </div>

      <FileText className={`w-4 h-4 mr-2 ${currentPage === pageIndex ? 'text-gray-300' : 'text-gray-400'}`} />
      
      {isEditing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="bg-transparent border-b border-white/50 text-white focus:outline-none w-20 px-0.5"
        />
      ) : (
        <span onDoubleClick={handleDoubleClick} title="Double click to rename">
          {pageTitle}
        </span>
      )}

      {totalContentPages > 1 && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onDeletePage?.(pageIndex);
          }}
          className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm hover:bg-red-600"
          title="Delete page"
        >
          <X className="w-3 h-3" />
        </span>
      )}
    </div>
  );
}

export default function PageNavigation({
  fields,
  currentPage,
  onPageChange,
  onAddPage,
  onAddWelcome,
  onAddThankYou,
  onDeletePage,
  onRenamePage,
  onReorderPages,
  pageSettings = [], // New Prop
  hasWelcome = true,
  hasThankYou = true,
  className = '',
}: PageNavigationProps & { pageSettings?: { id: string; title: string }[] }) {
  const pageBreaks = fields.filter((f) => f.type === FieldType.PAGE_BREAK);
  const totalContentPages = pageBreaks.length + 1;
  const contentPages = Array.from({ length: totalContentPages }, (_, i) => i);

  // Helper to get page title
  const getPageTitle = (index: number) => {
    // Priority: pageSettings > Legacy (Page 1) > Default
    if (pageSettings && pageSettings[index]) {
        return pageSettings[index].title;
    }
    return `Page ${index + 1}`;
  };

  const orderedPages = [
    ...(hasWelcome ? [-1] : []),
    ...contentPages,
    ...(hasThankYou ? [-2] : []),
  ];
  const currentOrderedIndex = orderedPages.indexOf(currentPage);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    if (containerRef.current) {
      const activeTab = containerRef.current.querySelector('[data-active="true"]');
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentOrderedIndex > 0) {
      onPageChange(orderedPages[currentOrderedIndex - 1]);
    }
  };

  const handleNextPage = () => {
    if (currentOrderedIndex < orderedPages.length - 1) {
      onPageChange(orderedPages[currentOrderedIndex + 1]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
        // active.id is 'page-0', 'page-1'
        const oldIndex = parseInt((active.id as string).replace('page-', ''));
        const newIndex = parseInt((over.id as string).replace('page-', ''));
        
        if (!isNaN(oldIndex) && !isNaN(newIndex)) {
            onReorderPages?.(oldIndex, newIndex);
        }
    }
  };

  return (
    <div className={`bg-white border-t border-gray-200 shadow-lg flex items-center justify-between px-4 h-16 ${className}`}>
      {/* Navigation Controls (Prev/Next Page) */}
      <div className="flex items-center space-x-0.5 mr-2 text-gray-500 flex-shrink-0">
        <button
          onClick={handlePrevPage}
          disabled={currentOrderedIndex <= 0}
          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNextPage}
          disabled={
            currentOrderedIndex === -1 || currentOrderedIndex >= orderedPages.length - 1
          }
          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex flex-1 items-center space-x-1 overflow-x-auto p-2 min-w-0 max-w-[700px] no-scrollbar [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Welcome Page Tab */}
        {hasWelcome && (
          <button
            onClick={() => onPageChange(-1)}
            data-active={currentPage === -1}
            className={`
                group relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 pr-8 flex-shrink-0 whitespace-nowrap
                ${
                  currentPage === -1
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }
            `}
          >
            <LayoutTemplate
              className={`w-4 h-4 mr-2 ${currentPage === -1 ? 'text-gray-300' : 'text-gray-400'}`}
            />
            Welcome Screen
            <span
              onClick={(e) => {
                e.stopPropagation();
                onDeletePage?.(-1);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm hover:bg-red-600"
              title="Delete page"
            >
              <X className="w-3 h-3" />
            </span>
          </button>
        )}

        {hasWelcome && <div className="w-px h-6 bg-gray-200 mx-2 flex-shrink-0" />}

        {/* Content Pages (Draggable) */}
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext 
                items={contentPages.map(id => `page-${id}`)}
                strategy={horizontalListSortingStrategy}
            >
                <div className="flex items-center space-x-1">
                {contentPages.map((pageIndex) => (
                    <SortablePageTab
                        key={pageIndex}
                        pageIndex={pageIndex}
                        currentPage={currentPage}
                        totalContentPages={totalContentPages}
                        pageTitle={getPageTitle(pageIndex)}
                        onPageChange={onPageChange}
                        onDeletePage={onDeletePage}
                        onRenamePage={onRenamePage}
                    />
                ))}
                </div>
            </SortableContext>
        </DndContext>

        {hasThankYou && <div className="w-px h-6 bg-gray-200 mx-2 flex-shrink-0" />}

        {/* Thank You Page Tab */}
        {hasThankYou && (
          <button
            onClick={() => onPageChange(-2)}
            data-active={currentPage === -2}
            className={`
                group relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 pr-8 flex-shrink-0 whitespace-nowrap
                ${
                  currentPage === -2
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }
                `}
          >
            <CheckCircle2
              className={`w-4 h-4 mr-2 ${currentPage === -2 ? 'text-gray-300' : 'text-gray-400'}`}
            />
            End Page
            <span
              onClick={(e) => {
                e.stopPropagation();
                onDeletePage?.(-2);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm hover:bg-red-600"
              title="Delete page"
            >
              <X className="w-3 h-3" />
            </span>
          </button>
        )}
      </div>

      <div className="relative group ml-4 z-50">
        <button
          onClick={onAddPage}
          className="flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg shadow-sm hover:bg-gray-800 hover:shadow-md transition-all duration-200 border border-transparent"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Page
        </button>

        {/* Dropdown Menu */}
        <div className="absolute bottom-full right-0 mb-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-bottom-right scale-95 group-hover:scale-100">
          {/* Standard Page - Always Available */}
          <button
            onClick={onAddPage}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black flex items-center transition-colors first:rounded-t-xl"
          >
            <FileText className="w-4 h-4 mr-2.5 text-gray-400" />
            Page
          </button>

          {/* Welcome Page Option */}
          <button
            onClick={() => !hasWelcome && onAddWelcome?.()}
            disabled={hasWelcome}
            className={`w-full text-left px-4 py-2.5 text-sm flex items-center transition-colors ${
              hasWelcome
                ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <LayoutTemplate
              className={`w-4 h-4 mr-2.5 ${hasWelcome ? 'text-gray-300' : 'text-gray-400'}`}
            />
            {hasWelcome ? 'Welcome Page (Added)' : 'Welcome Page'}
          </button>

          {/* End Page Option */}
          <button
            onClick={() => !hasThankYou && onAddThankYou?.()}
            disabled={hasThankYou}
            className={`w-full text-left px-4 py-2.5 text-sm flex items-center transition-colors last:rounded-b-xl ${
              hasThankYou
                ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 mr-2.5 ${hasThankYou ? 'text-gray-300' : 'text-gray-400'}`}
            />
            {hasThankYou ? 'End Page (Added)' : 'End Page'}
          </button>
        </div>
      </div>
    </div>
  );
}
