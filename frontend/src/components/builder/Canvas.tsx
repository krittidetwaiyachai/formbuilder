"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useFormStore } from "@/store/formStore";
import DesignerElementWrapper from "./DesignerElementWrapper";
import { cn } from "@/lib/utils";

interface CanvasProps {
  activeId?: string | null;
}

export default function Canvas({ activeId }: CanvasProps) {
  const { currentForm } = useFormStore();
  const elements = currentForm?.fields || [];
  const theme = currentForm?.settings;
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const scrollPositionRef = React.useRef<{ x: number; y: number } | null>(null);
  const isDragging = activeId !== null;
  const prevIsDraggingRef = React.useRef(false);

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
    data: {
      droppableId: "canvas",
    },
  });

  React.useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let rafId: number | null = null;
    
    const preventScroll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const lockScrollPosition = () => {
      if (scrollPositionRef.current && canvas) {
        canvas.scrollLeft = scrollPositionRef.current.x;
        canvas.scrollTop = scrollPositionRef.current.y;
      }
      if (isDragging) {
        rafId = requestAnimationFrame(lockScrollPosition);
      }
    };

    if (isDragging && !prevIsDraggingRef.current) {
      scrollPositionRef.current = {
        x: canvas.scrollLeft,
        y: canvas.scrollTop,
      };
      
      canvas.addEventListener('scroll', preventScroll, { passive: false });
      canvas.addEventListener('wheel', preventScroll, { passive: false });
      canvas.addEventListener('touchmove', preventScroll, { passive: false });
      
      rafId = requestAnimationFrame(lockScrollPosition);
    }
    
    if (!isDragging && prevIsDraggingRef.current && scrollPositionRef.current) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      
      canvas.removeEventListener('scroll', preventScroll);
      canvas.removeEventListener('wheel', preventScroll);
      canvas.removeEventListener('touchmove', preventScroll);
      
      canvas.scrollLeft = scrollPositionRef.current.x;
      canvas.scrollTop = scrollPositionRef.current.y;
      
      scrollPositionRef.current = null;
    }
    
    prevIsDraggingRef.current = isDragging;
    
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      canvas.removeEventListener('scroll', preventScroll);
      canvas.removeEventListener('wheel', preventScroll);
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, [isDragging]);

  const getBackgroundStyle = () => {
    if (!theme) return {};
    
    if (theme.backgroundType === "color") {
      return { backgroundColor: theme.backgroundColor };
    } else if (theme.backgroundType === "image" && theme.backgroundImage) {
      return {
        backgroundImage: `url(${theme.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    } else if (theme.backgroundType === "gradient") {
      return {
        background: `linear-gradient(135deg, ${theme.backgroundColor} 0%, ${theme.primaryColor} 100%)`,
      };
    }
    return {};
  };

  const getBorderRadius = () => {
    if (!theme) return "rounded-lg";
    const radiusMap: Record<string, string> = {
      none: "rounded-none",
      small: "rounded-sm",
      medium: "rounded-lg",
      large: "rounded-xl",
    };
    const radius = theme.borderRadius || "medium";
    return radiusMap[radius] || "rounded-lg";
  };


  return (
    <div 
      ref={canvasRef}
      className="flex-1 overflow-y-auto overflow-x-hidden relative flex items-center justify-center p-8"
      style={{
        touchAction: 'pan-y',
        maxHeight: '100vh',
        position: 'relative',
      }}
    >
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[600px] max-w-2xl mx-auto shadow-sm p-8 space-y-4 relative",
          getBorderRadius(),
          isOver && "ring-2 ring-primary ring-offset-2"
        )}
        style={{
          ...getBackgroundStyle(),
          color: theme?.textColor || "#1F2937",
          fontFamily: theme?.fontFamily || "Inter",
        }}
      >
        {elements.length > 0 ? (
          <SortableContext
            items={elements.map((el) => el.id)}
            strategy={verticalListSortingStrategy}
          >
            {elements.map((element, index) => (
              <DesignerElementWrapper 
                key={element.id} 
                element={element}
                index={index}
              />
            ))}
          </SortableContext>
        ) : (
          isOver && (
            <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center text-gray-500">
              Drop here to add element
            </div>
          )
        )}
      </div>
    </div>
  );
}


