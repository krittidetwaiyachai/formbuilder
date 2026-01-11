"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormElement } from "@/types/form";
import { useBuilderStore } from "@/hooks/useBuilderStore";
import DesignerElementCard from "./DesignerElementCard";
import { cn } from "@/lib/utils";
import * as React from "react";

interface DesignerElementWrapperProps {
  element: FormElement;
  index?: number;
}

export default function DesignerElementWrapper({
  element,
  index,
}: DesignerElementWrapperProps) {
  const { selectedElementId, setSelectedElement, removeElement } =
    useBuilderStore();
  const isSelected = selectedElementId === element.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    data: {
      source: "canvas",
      elementId: element.id,
    index: index,
    },
  });

  const elementRef = React.useRef<HTMLDivElement | null>(null);

  // Force lock position during drag
  React.useLayoutEffect(() => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    
    // Only run lock logic if actually dragging this element
    if (isDragging) {
      // Lock position by continuously resetting transform
      const lockPosition = () => {
        if (element && isDragging) {
          // Force remove any transform
          const computedStyle = window.getComputedStyle(element);
          if (computedStyle.transform && computedStyle.transform !== 'none') {
            element.style.transform = 'none';
            element.style.left = '0';
            element.style.top = '0';
          }
        }
      };
      
      // Use MutationObserver to watch for transform changes
      const observer = new MutationObserver(lockPosition);
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['style'],
      });
      
      // Also use requestAnimationFrame as backup
      const rafId = requestAnimationFrame(function animate() {
        lockPosition();
        if (isDragging) {
          requestAnimationFrame(animate);
        }
      });
      
      return () => {
        observer.disconnect();
        cancelAnimationFrame(rafId);
      };
    }
  }, [isDragging]);

  const style = {
    transform: isDragging ? undefined : (transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.3 : 1,
    visibility: 'visible',
    // touchAction: 'none', // Removed to allow text selection and scrolling
  };

  // Create custom listeners that ignore contentEditable elements and specific form/text tags
  const customListeners = React.useMemo(() => {
    if (!listeners) return {};
    
    const customHandlers: any = {};
    Object.keys(listeners).forEach((key) => {
      const originalHandler = (listeners as any)[key];
      if (typeof originalHandler === 'function') {
        customHandlers[key] = (e: any) => {
          const target = e.target as HTMLElement;
          
          // Prevent drag if target is interacting with content
          if (
            target.isContentEditable || 
            target.closest('[contenteditable="true"]') ||
            // Also prevent drag on these specific tags to allow click-to-select/edit to work reliably
            ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'LABEL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P'].includes(target.tagName)
          ) {
            return;
          }
          originalHandler(e);
        };
      } else {
        customHandlers[key] = originalHandler;
      }
    });
    return customHandlers;
  }, [listeners]);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        elementRef.current = node;
      }}
      style={style}
      {...attributes}
      {...customListeners}
      className={cn(
        "relative cursor-move",
        isDragging && "pointer-events-none flex justify-center"
      )}
    >
      <DesignerElementCard
        element={element}
        isSelected={isSelected}
        isDragging={isDragging}
        onClick={(e) => {
          // Don't trigger onClick if clicking on a contenteditable element
          const target = e.target as HTMLElement;
          if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
            // Let the child handle validation/selection via onFocus
            return;
          }
          e.stopPropagation();
          setSelectedElement(element.id);
        }}
        onDelete={(e) => {
          e.stopPropagation();
          removeElement(element.id);
        }}
      />
    </div>
  );
}
