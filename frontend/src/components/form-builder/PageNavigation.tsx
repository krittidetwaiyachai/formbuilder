import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, LayoutTemplate, FileText, CheckCircle2, X, ChevronLeft, ChevronRight, GripVertical, ChevronDown, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
      className={`group relative flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer border ${
        currentPage === pageIndex
          ? 'bg-black text-white border-black shadow-sm'
          : 'bg-white text-gray-600 border-transparent hover:bg-gray-50'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => !isEditing && onPageChange(pageIndex)}
      {...attributes}
    >
      <div 
        {...listeners} 
        className="mr-2 cursor-grab active:cursor-grabbing hover:opacity-70 touch-none"
        onClick={(e) => e.stopPropagation()} 
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
          className="ml-2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          title="Delete page"
        >
          <X className={`w-3 h-3 ${currentPage === pageIndex ? 'text-gray-400' : 'text-gray-400'}`} />
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
  const { t } = useTranslation();
  const pageBreaks = fields.filter((f) => f.type === FieldType.PAGE_BREAK);
  const totalContentPages = pageBreaks.length + 1;
  const contentPages = Array.from({ length: totalContentPages }, (_, i) => i);

  // Helper to get page title
  const getPageTitle = (index: number) => {
    // Priority: pageSettings > Legacy (Page 1) > Default
    if (pageSettings && pageSettings[index]) {
        return pageSettings[index].title;
    }
    return t('builder.pagination.page', { index: index + 1 });
  };

  const orderedPages = [
    ...(hasWelcome ? [-1] : []),
    ...contentPages,
    ...(hasThankYou ? [-2] : []),
  ];
  const currentOrderedIndex = orderedPages.indexOf(currentPage);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showMobileAddMenu, setShowMobileAddMenu] = useState(false);

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
    <>
      {/* Desktop View */}
      <div className={`hidden md:flex bg-white border-t border-gray-200 shadow-lg items-center justify-between px-4 h-16 ${className}`}>
        {/* Navigation Controls (Prev/Next Page) */}
        <div className="flex items-center space-x-1 mr-4 text-gray-400 flex-shrink-0 border-r border-gray-200 pr-4 h-8">
            <button
            onClick={handlePrevPage}
            disabled={currentOrderedIndex <= 0}
            className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Previous Page"
            >
            <ChevronLeft className="w-5 h-5" />
            </button>
            <button
            onClick={handleNextPage}
            disabled={
                currentOrderedIndex === -1 || currentOrderedIndex >= orderedPages.length - 1
            }
            className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Next Page"
            >
            <ChevronRight className="w-5 h-5" />
            </button>
        </div>

        <div
            ref={containerRef}
            className="flex flex-1 items-center space-x-2 overflow-x-auto p-1 min-w-0 max-w-[800px] no-scrollbar [&::-webkit-scrollbar]:hidden mask-linear-fade"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {/* Welcome Page Tab */}
            {hasWelcome && (
            <button
                onClick={() => onPageChange(-1)}
                data-active={currentPage === -1}
                className={`
                    group relative flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 pr-2 flex-shrink-0 whitespace-nowrap border
                    ${
                    currentPage === -1
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-gray-600 border-transparent hover:bg-gray-50'
                    }
                `}
            >
                <LayoutTemplate
                className={`w-4 h-4 mr-2 ${currentPage === -1 ? 'text-gray-300' : 'text-gray-400'}`}
                />
                {t('builder.pagination.welcome_page')}
                <span
                onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage?.(-1);
                }}
                className="ml-2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete page"
                >
                <X className="w-3 h-3" />
                </span>
            </button>
            )}

            {hasWelcome && <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />}

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
                    <div className="flex items-center space-x-2">
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

            {hasThankYou && <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />}

            {/* Thank You Page Tab */}
            {hasThankYou && (
            <button
                onClick={() => onPageChange(-2)}
                data-active={currentPage === -2}
                className={`
                    group relative flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 pr-2 flex-shrink-0 whitespace-nowrap border
                    ${
                    currentPage === -2
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-gray-600 border-transparent hover:bg-gray-50'
                    }
                    `}
            >
                <CheckCircle2
                className={`w-4 h-4 mr-2 ${currentPage === -2 ? 'text-gray-300' : 'text-gray-400'}`}
                />
                {t('builder.pagination.end_page')}
                <span
                onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage?.(-2);
                }}
                className="ml-2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
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
            className="flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg shadow-sm hover:bg-gray-800 hover:shadow-md transition-all duration-200 active:scale-95"
            >
            <Plus className="h-4 w-4 mr-1.5" />
            {t('builder.pagination.add_page')}
            </button>

            {/* Dropdown Menu */}
            <div className="absolute bottom-full right-0 mb-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-bottom-right scale-95 group-hover:scale-100">
            {/* Standard Page - Always Available */}
            <button
                onClick={onAddPage}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black flex items-center transition-colors first:rounded-t-xl"
            >
                <FileText className="w-4 h-4 mr-2.5 text-gray-400" />
                {t('builder.pagination.page_generic')}
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
                {hasWelcome ? `${t('builder.pagination.welcome_page')} ${t('builder.pagination.added')}` : t('builder.pagination.welcome_page')}
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
                {hasThankYou ? `${t('builder.pagination.end_page')} ${t('builder.pagination.added')}` : t('builder.pagination.end_page')}
            </button>
            </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] px-3 h-16 flex items-center justify-between pb-safesafe ${className}`}>
        
        <div className="flex items-center gap-1">
             {/* Delete Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (currentPage === -1) onDeletePage?.(-1);
                    else if (currentPage === -2) onDeletePage?.(-2);
                    else onDeletePage?.(currentPage);
                }}
                disabled={currentPage >= 0 && totalContentPages <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                title={currentPage >= 0 && totalContentPages <= 1 ? "ไม่สามารถลบหน้าสุดท้ายได้" : "Delete Page"}
            >
                <Trash2 className="w-5 h-5" />
            </button>

            {/* Previous Button */}
            <button
                onClick={handlePrevPage}
                disabled={currentOrderedIndex <= 0}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:bg-transparent transition-all"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
        </div>

        {/* Center: Page Selector */}
        <div className="flex-1 px-2 relative flex justify-center min-w-0">
            <div className="relative inline-flex items-center justify-center max-w-full">
                <select
                    value={currentPage}
                    onChange={(e) => onPageChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                >
                    {orderedPages.map((pageIdx) => {
                         let title = '';
                         if (pageIdx === -1) title = t('builder.pagination.welcome_page');
                         else if (pageIdx === -2) title = t('builder.pagination.end_page');
                         else title = getPageTitle(pageIdx);
                         return <option key={pageIdx} value={pageIdx}>{title}</option>;
                    })}
                </select>
                <div className="flex items-center justify-between gap-2 bg-black text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium w-full max-w-[160px]">
                    <span className="truncate flex-1 text-left">
                        {currentPage === -1 ? t('builder.pagination.welcome_page') : 
                         currentPage === -2 ? t('builder.pagination.end_page') : 
                         getPageTitle(currentPage)}
                    </span>
                    {orderedPages.length > 1 && (
                        <div className="flex items-center gap-1 opacity-70 flex-shrink-0">
                            <span className="text-[10px] uppercase font-bold tracking-wider">More</span>
                            <ChevronDown className="w-3 h-3" />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Next & Add Buttons */}
        <div className="flex items-center gap-1 relative">
             <button
                onClick={handleNextPage}
                disabled={currentOrderedIndex === -1 || currentOrderedIndex >= orderedPages.length - 1}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:bg-transparent transition-all"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            <div className="relative">
                <button
                    onClick={() => setShowMobileAddMenu(!showMobileAddMenu)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white shadow-lg active:scale-95 transition-all"
                >
                    <Plus className={`w-5 h-5 transition-transform duration-200 ${showMobileAddMenu ? 'rotate-45' : ''}`} />
                </button>

                {/* Mobile Add Menu */}
                {showMobileAddMenu && createPortal(
                    <>
                        <div className="fixed inset-0 z-[9999]" onClick={() => setShowMobileAddMenu(false)} />
                        <div className="fixed bottom-24 right-4 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[9999] overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
                             {/* Standard Page */}
                            <button
                                onClick={() => { onAddPage(); setShowMobileAddMenu(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black flex items-center transition-colors border-b border-gray-50"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 text-gray-500">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-medium">{t('builder.pagination.page_generic')}</div>
                                    <div className="text-xs text-gray-400">Add a new blank page</div>
                                </div>
                            </button>

                            {/* Welcome Page */}
                            <button
                                onClick={() => { if(!hasWelcome) { onAddWelcome?.(); setShowMobileAddMenu(false); } }}
                                disabled={hasWelcome}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center transition-colors border-b border-gray-50 ${
                                hasWelcome
                                    ? 'opacity-50 cursor-not-allowed bg-gray-50/50'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${hasWelcome ? 'bg-gray-100 text-gray-300' : 'bg-indigo-50 text-indigo-500'}`}>
                                    <LayoutTemplate className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{t('builder.pagination.welcome_page')}</div>
                                    <div className="text-xs text-gray-400">{hasWelcome ? 'Already added' : 'Start with intro'}</div>
                                </div>
                                {hasWelcome && <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />}
                            </button>

                            {/* End Page */}
                            <button
                                onClick={() => { if(!hasThankYou) { onAddThankYou?.(); setShowMobileAddMenu(false); } }}
                                disabled={hasThankYou}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center transition-colors ${
                                hasThankYou
                                    ? 'opacity-50 cursor-not-allowed bg-gray-50/50'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${hasThankYou ? 'bg-gray-100 text-gray-300' : 'bg-emerald-50 text-emerald-500'}`}>
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{t('builder.pagination.end_page')}</div>
                                    <div className="text-xs text-gray-400">{hasThankYou ? 'Already added' : 'End with success'}</div>
                                </div>
                                {hasThankYou && <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />}
                            </button>
                        </div>
                    </>,
                    document.body
                )}
            </div>
        </div>
      </div>
    </>
  );
}
