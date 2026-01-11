"use client";

import { FormElement } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import FormElementRenderer from "./FormElementRenderer";
import { cn } from "@/lib/utils";

interface DesignerElementCardProps {
  element: FormElement;
  isSelected?: boolean;
  onDelete?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

export default function DesignerElementCard({
  element,
  isSelected,
  onDelete,
  onClick,
  isDragging,
  isOverlay,
}: DesignerElementCardProps) {
  if (isDragging || isOverlay) {
    return (
      <div 
        className="w-64 bg-white rounded-xl shadow-2xl p-4 border-2 border-primary/20 ring-4 ring-black/5 cursor-grabbing flex flex-col gap-2"
      >
         <div className="flex justify-center">
             <div className="w-8 h-1 bg-gray-200 rounded-full" />
         </div>
         <div className="flex items-center gap-2">
             <span className="font-medium text-base truncate text-primary">{element.type}</span> 
         </div>
         <div className="h-8 w-full bg-gray-50 rounded border border-gray-100 flex items-center px-3 text-xs text-gray-400 font-medium select-none">
             {element.type} Field
         </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative group",
        isSelected && "z-10"
      )}
    >
      <div
        className={cn(
          "relative border rounded-lg bg-white cursor-pointer transition-all duration-200",
          !isSelected && "hover:border-primary pt-6 pb-4 px-4",
          isSelected && "border-black border-[3px] shadow-2xl scale-[1.03] ring-4 ring-black/5 z-20 pt-10 pb-4 px-4"
        )}
        onMouseDown={(e) => {
          // Don't trigger onClick if clicking on a contenteditable element
          const target = e.target as HTMLElement;
          if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
            // Don't preventDefault - let the contentEditable element handle it naturally
            e.stopPropagation();
            return;
          }
        }}
        onClick={(e) => {
          // Don't trigger onClick if clicking on a contenteditable element
          const target = e.target as HTMLElement;
          if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
            e.stopPropagation();
            return;
          }
          onClick?.(e);
        }}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[50] cursor-grab active:cursor-grabbing w-full flex justify-center h-6" title="Drag to move">
          <div className="w-12 h-1.5 bg-gray-400 rounded-full" />
        </div>
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <FormElementRenderer element={element} isDesigner />
          </div>
          {isSelected && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {!isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-xs font-medium text-gray-600">
            Click to select
          </span>
        </div>
      )}
    </div>
  );
}
