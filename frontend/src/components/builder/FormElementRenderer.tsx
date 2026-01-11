"use client";

import { FormElement } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useBuilderStore } from "@/hooks/useBuilderStore";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FormElementRendererProps {
  element: FormElement;
  isDesigner?: boolean;
}

export default function FormElementRenderer({
  element,
  isDesigner = false,
}: FormElementRendererProps) {
  const { selectedElementId, updateElement, setSelectedElement } = useBuilderStore();
  const isSelected = selectedElementId === element.id;
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const isEditingRef = useRef(false);
  const lastContentRef = useRef<string>("");

  const renderEditableLabel = (label: string, required: boolean = false) => {
    const handleLabelBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      isEditingRef.current = false;
      const newContent = e.currentTarget.textContent || "";
      if (newContent !== element.label) {
        updateElement(element.id, { label: newContent });
      }
    };

    const handleLabelFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      if (isDesigner) {
        setSelectedElement(element.id);
      }
      isEditingRef.current = true;
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
      }
      e.stopPropagation();
    };

    const handleLabelClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
    };

    const handleLabelMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
    };


    const setLabelRef = (node: HTMLDivElement | null) => {
      if (labelRef.current === node) return;
      labelRef.current = node;
      if (node && !isEditingRef.current) {
        node.textContent = labelContent;
      }
    };

    const labelContent = element.label || "Label";

    useLayoutEffect(() => {
      if (labelRef.current && !isEditingRef.current) {
        labelRef.current.textContent = labelContent;
      }
    }, [labelContent]);

    useLayoutEffect(() => {
      if (labelRef.current && isDesigner && isSelected && !isEditingRef.current) {
        labelRef.current.focus();
      }
    }, [isDesigner, isSelected]);
    const [labelMarkup] = useState({ __html: element.label || "Label" });

    // Sync content changes from outside (e.g. undo/redo)
    useEffect(() => {
      if (labelRef.current && document.activeElement !== labelRef.current) {
        if (labelRef.current.textContent !== element.label) {
          labelRef.current.textContent = element.label || "Label";
        }
      }
    }, [element.label]);

    if (isDesigner) {
      return (
        <div
          key={`label-${element.id}`}
          ref={setLabelRef}
          contentEditable
          suppressContentEditableWarning
          tabIndex={0}
          className={cn(
            "text-sm font-medium text-gray-700 border-none outline-none bg-transparent cursor-text min-h-[1.2em] p-1 -m-1 rounded inline-block",
            !isSelected && "cursor-pointer" 
          )}
          onBlur={handleLabelBlur}
          onFocus={handleLabelFocus}
          onKeyDown={handleLabelKeyDown}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={handleLabelMouseDown}
          onPointerDown={(e) => e.stopPropagation()}
          style={{ pointerEvents: "auto", userSelect: "text" }}
          suppressHydrationWarning
          dangerouslySetInnerHTML={labelMarkup}
        />
      );
    } else {
      return (
        <Label>
          {labelContent}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      );
    }
  };

  const renderElement = () => {
    switch (element.type) {
      case "text":
      case "email":
      case "number":
        return (
          <div className="space-y-2">
            {renderEditableLabel(element.label, element.required)}
            <Input
              type={element.type}
              placeholder={element.placeholder}
              disabled={isDesigner}
              readOnly={isDesigner}
            />
            {element.helperText && (
              <p className="text-xs text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            {renderEditableLabel(element.label, element.required)}
            <Textarea
              placeholder={element.placeholder}
              rows={element.rows || 4}
              disabled={isDesigner}
              readOnly={isDesigner}
            />
            {element.helperText && (
              <p className="text-xs text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            {renderEditableLabel(element.label, element.required)}
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDesigner}
            >
              <option value="">Select an option</option>
              {element.options?.map((opt) => (
                <option key={opt.id} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {element.helperText && (
              <p className="text-xs text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            {renderEditableLabel(element.label, element.required)}
            <div className="space-y-2">
              {element.options?.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={opt.id}
                    disabled={isDesigner}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={opt.id} className="text-sm">
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
            {element.helperText && (
              <p className="text-xs text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-3">
            {renderEditableLabel(element.label, element.required)}
            <div className="space-y-2">
              {element.options?.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={opt.id}
                    name={element.id}
                    disabled={isDesigner}
                    className="h-4 w-4"
                  />
                  <label htmlFor={opt.id} className="text-sm">
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
            {element.helperText && (
              <p className="text-xs text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case "date":
        return (
          <div className="space-y-2">
            {renderEditableLabel(element.label, element.required)}
            <Input
              type="date"
              disabled={isDesigner}
              readOnly={isDesigner}
            />
            {element.helperText && (
              <p className="text-xs text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div className="space-y-2">
            {renderEditableLabel(element.label, element.required)}
            <Input
              type="file"
              accept={element.accept}
              disabled={isDesigner}
            />
            {element.helperText && (
              <p className="text-xs text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case "rating":
        return (
          <div className="space-y-2">
            {renderEditableLabel(element.label, element.required)}
            <div className="flex gap-1">
              {Array.from({ length: element.max || 5 }).map((_, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  disabled={isDesigner}
                  className="h-8 w-8"
                >
                  <Star className="h-5 w-5 text-yellow-400" />
                </Button>
              ))}
            </div>
            {element.helperText && (
              <p className="text-xs text-muted-foreground">
                {element.helperText}
              </p>
            )}
          </div>
        );

      case "heading":
        const handleHeadingBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
          isEditingRef.current = false;
          const newContent = e.currentTarget.textContent || "";
          headingContentRef.current = newContent;
          if (newContent !== element.content) {
            updateElement(element.id, { content: newContent });
          }
        };

        const handleHeadingFocus = (e: React.FocusEvent<HTMLHeadingElement>) => {
          if (isDesigner) {
            setSelectedElement(element.id);
          }
          isEditingRef.current = true;
        };

        const handleHeadingKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
          // Prevent Enter from creating a new line, just blur instead
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          // Stop propagation to prevent card onClick
          e.stopPropagation();
        };

        const handleHeadingClick = (e: React.MouseEvent<HTMLHeadingElement>) => {
          // Stop propagation to prevent card onClick
          e.stopPropagation();
        };

        const handleHeadingMouseDown = (e: React.MouseEvent<HTMLHeadingElement>) => {
          // Stop propagation to prevent card onClick
          e.stopPropagation();
          // Don't preventDefault - let browser handle focus naturally
        };

        const handleHeadingInput = (e: React.FormEvent<HTMLHeadingElement>) => {
          // Stop propagation to prevent any parent handlers
          e.stopPropagation();
          // Prevent React from updating the content
          isEditingRef.current = true;
        };

        const handleHeadingBeforeInput = (e: React.FormEvent<HTMLHeadingElement>) => {
          // Mark as editing to prevent React from interfering
          isEditingRef.current = true;
        };

        // Store content in ref to track what we set vs what React might try to set
        const headingContentRef = useRef<string>(element.content || "Heading");
        const headingInitializedRef = useRef(false);
        
        // Reset initialization flag when selection changes
        useEffect(() => {
          if (!isSelected) {
            headingInitializedRef.current = false;
          }
        }, [isSelected]);
        
        // Set content via ref callback - this runs synchronously during render
        const setHeadingRef = (node: HTMLHeadingElement | null) => {
          if (headingRef.current === node) return; // Already set
          
          headingRef.current = node;
          if (node && isDesigner && isSelected) {
            const elementContent = element.content || "Heading";
            
            // Only set content if element is empty or not initialized
            if (!headingInitializedRef.current || !node.textContent || node.textContent.trim() === "") {
              headingContentRef.current = elementContent;
              node.textContent = elementContent;
              headingInitializedRef.current = true;
            } else {
              // Preserve existing content if element already has content
              headingContentRef.current = node.textContent;
            }
          }
        };

        // Auto-focus when selected and enforce it
        useEffect(() => {
          if (headingRef.current && isDesigner && isSelected && !isEditingRef.current) {
             const element = headingRef.current;
             
             // Initial focus
             element.focus();
             
             // Ensure cursor at end
             const setCursorToEnd = () => {
                const range = document.createRange();
                const sel = window.getSelection();
                if (sel) {
                  range.selectNodeContents(element);
                  range.collapse(false);
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
             };
             setCursorToEnd();

             // Re-focus helper if lost immediately (e.g. by dnd-kit or other handlers)
             const checkFocus = setTimeout(() => {
                if (document.activeElement !== element) {
                   element.focus();
                   setCursorToEnd();
                }
             }, 50);

             return () => clearTimeout(checkFocus);
          }
        }, [isDesigner, isSelected]);

        // Helper variables
        // We use useState to keep the dangerouslySetInnerHTML prop stable across renders
        // This prevents React from updating the DOM on every keystroke (which kills cursor)
        const [headingMarkup] = useState(() => {
          const content = element.content || "Heading";
          return {
            __html: content
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;")
          };
        });

        // Sync content changes from outside (e.g. undo/redo)
        useEffect(() => {
          if (headingRef.current && document.activeElement !== headingRef.current) {
             const currentContent = element.content || "Heading";
             if (headingRef.current.textContent !== currentContent) {
                headingRef.current.textContent = currentContent;
             }
          }
        }, [element.content]);

        // Force focus on selection change
        useEffect(() => {
          if (headingRef.current && isDesigner && isSelected) {
             const element = headingRef.current;
             if (document.activeElement !== element) {
                element.focus({ preventScroll: true });
                // Ensure cursor at end
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(element);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
             }
          }
        }, [isDesigner, isSelected]);

        return (
          <div className="space-y-2">
            {element.headingImage && (
              <img
                src={element.headingImage}
                alt="Heading"
                className="w-full h-auto rounded-lg object-cover"
                style={{ maxHeight: "200px" }}
              />
            )}
            <h2
              ref={headingRef}
              contentEditable={isDesigner}
              suppressContentEditableWarning={true}
              className={cn(
                "text-2xl font-bold",
                isDesigner && "outline-none cursor-text min-h-[1.5em]",
                !isSelected && "cursor-pointer"
              )}
              onBlur={isDesigner ? handleHeadingBlur : undefined}
              onFocus={isDesigner ? handleHeadingFocus : undefined}
              onKeyDown={isDesigner ? handleHeadingKeyDown : undefined}
              onClick={isDesigner ? (e) => e.stopPropagation() : undefined}
              onMouseDown={isDesigner ? handleHeadingMouseDown : undefined}
              onPointerDown={isDesigner ? (e) => e.stopPropagation() : undefined}
              onInput={isDesigner ? handleHeadingInput : undefined}
              onBeforeInput={isDesigner ? handleHeadingBeforeInput : undefined}
              style={
                isDesigner
                  ? { pointerEvents: "auto", userSelect: "text" as const }
                  : undefined
              }
              dangerouslySetInnerHTML={headingMarkup}
            />
          </div>
        );

      case "paragraph":
        const handleParagraphBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
          isEditingRef.current = false;
          const newContent = e.currentTarget.textContent || "";
          paragraphContentRef.current = newContent;
          if (newContent !== element.content) {
            updateElement(element.id, { content: newContent });
          }
        };

        const handleParagraphFocus = (e: React.FocusEvent<HTMLParagraphElement>) => {
          if (isDesigner) {
            setSelectedElement(element.id);
          }
          isEditingRef.current = true;
        };

        const handleParagraphKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
          // Stop propagation to prevent card onClick
          e.stopPropagation();
        };

        const handleParagraphClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
          // Stop propagation to prevent card onClick
          e.stopPropagation();
        };

        const handleParagraphMouseDown = (e: React.MouseEvent<HTMLParagraphElement>) => {
          // Stop propagation to prevent card onClick
          e.stopPropagation();
          // Don't preventDefault - let browser handle focus naturally
        };

        const handleParagraphInput = (e: React.FormEvent<HTMLParagraphElement>) => {
          // Stop propagation to prevent any parent handlers
          e.stopPropagation();
          // Prevent React from updating the content
          isEditingRef.current = true;
        };

        const handleParagraphBeforeInput = (e: React.FormEvent<HTMLParagraphElement>) => {
          // Mark as editing to prevent React from interfering
          isEditingRef.current = true;
        };

        // Store content in ref to track what we set vs what React might try to set
        const paragraphContentRef = useRef<string>(element.content || "Paragraph");
        const paragraphInitializedRef = useRef(false);
        
        // Reset initialization flag when selection changes
        useEffect(() => {
          if (!isSelected) {
            paragraphInitializedRef.current = false;
          }
        }, [isSelected]);
        
        // Set content via ref callback - this runs synchronously during render
        const setParagraphRef = (node: HTMLParagraphElement | null) => {
          if (paragraphRef.current === node) return; // Already set
          
          paragraphRef.current = node;
          if (node && isDesigner && isSelected) {
            const elementContent = element.content || "Paragraph";
            
            // Only set content if element is empty or not initialized
            if (!paragraphInitializedRef.current || !node.textContent || node.textContent.trim() === "") {
              paragraphContentRef.current = elementContent;
              node.textContent = elementContent;
              paragraphInitializedRef.current = true;
            } else {
              // Preserve existing content if element already has content
              paragraphContentRef.current = node.textContent;
            }
          }
        };

        // Auto-focus when selected and enforce it
        useEffect(() => {
          if (paragraphRef.current && isDesigner && isSelected && !isEditingRef.current) {
             const element = paragraphRef.current;
             
             // Initial focus
             element.focus();
             
             // Ensure cursor at end
             const setCursorToEnd = () => {
                const range = document.createRange();
                const sel = window.getSelection();
                if (sel) {
                  range.selectNodeContents(element);
                  range.collapse(false);
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
             };
             setCursorToEnd();

             // Re-focus helper if lost immediately 
             const checkFocus = setTimeout(() => {
                if (document.activeElement !== element) {
                   element.focus();
                   setCursorToEnd();
                }
             }, 50);

             return () => clearTimeout(checkFocus);
          }
        }, [isDesigner, isSelected]);

        // Helper variables
        // Stable markup state to prevent React re-renders on typing
        const [paragraphMarkup] = useState(() => {
          const content = element.content || "Paragraph";
          return {
            __html: content
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;")
          };
        });

        // Sync content changes from outside (e.g. undo/redo)
        useEffect(() => {
          if (paragraphRef.current && document.activeElement !== paragraphRef.current) {
             const currentContent = element.content || "Paragraph";
             if (paragraphRef.current.textContent !== currentContent) {
                paragraphRef.current.textContent = currentContent;
             }
          }
        }, [element.content]);

        // Force focus on selection change
        useEffect(() => {
          if (paragraphRef.current && isDesigner && isSelected) {
             const element = paragraphRef.current;
             if (document.activeElement !== element) {
                element.focus({ preventScroll: true });
                // Ensure cursor at end
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(element);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
             }
          }
        }, [isDesigner, isSelected]);

        return (
          <p
            ref={paragraphRef}
            contentEditable={isDesigner}
            suppressContentEditableWarning={true}
            className={cn(
              "text-muted-foreground",
              isDesigner && "outline-none cursor-text min-h-[1.5em]",
              !isSelected && "cursor-pointer"
            )}
            onBlur={isDesigner ? handleParagraphBlur : undefined}
            onFocus={isDesigner ? handleParagraphFocus : undefined}
            onKeyDown={isDesigner ? handleParagraphKeyDown : undefined}
            onClick={isDesigner ? (e) => e.stopPropagation() : undefined}
            onMouseDown={isDesigner ? handleParagraphMouseDown : undefined}
            onPointerDown={isDesigner ? (e) => e.stopPropagation() : undefined}
            onInput={isDesigner ? handleParagraphInput : undefined}
            onBeforeInput={isDesigner ? handleParagraphBeforeInput : undefined}
            style={
              isDesigner
                ? { pointerEvents: "auto", userSelect: "text" as const }
                : undefined
            }
            dangerouslySetInnerHTML={paragraphMarkup}
          />
        );

      default:
        return <div>Unknown element type</div>;
    }
  };

  return renderElement();
}

