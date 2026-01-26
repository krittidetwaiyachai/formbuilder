"use client";

import { Field, FieldType } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useFormStore } from "@/store/formStore";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { cn } from "@/lib/ui/utils";

interface FormElementRendererProps {
  element: Field;
  isDesigner?: boolean;
}

export default function FormElementRenderer({
  element,
  isDesigner = false,
}: FormElementRendererProps) {
  const { selectedFieldId, updateField, selectField } = useFormStore();
  const isSelected = selectedFieldId === element.id;
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const isEditingRef = useRef(false);


  const renderEditableLabel = (_label: string, required: boolean = false) => {
    const handleLabelBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      isEditingRef.current = false;
      const newContent = e.currentTarget.textContent || "";
      if (newContent !== element.label) {
        updateField(element.id, { label: newContent });
      }
    };

    const handleLabelFocus = (_e: React.FocusEvent<HTMLDivElement>) => {
      if (isDesigner) {
        selectField(element.id);
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
      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.NUMBER:
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

      case FieldType.TEXTAREA:
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

      case FieldType.DROPDOWN:
        return (
          <div className="space-y-2">
            {renderEditableLabel(element.label, element.required)}
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDesigner}
            >
              <option value="">Select an option</option>
              {element.options?.map((opt: any) => (
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

      case FieldType.CHECKBOX:
        return (
          <div className="space-y-3">
            {renderEditableLabel(element.label, element.required)}
            <div className="space-y-2">
              {element.options?.map((opt: any) => (
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

      case FieldType.RADIO:
        return (
          <div className="space-y-3">
            {renderEditableLabel(element.label, element.required)}
            <div className="space-y-2">
              {element.options?.map((opt: any) => (
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

      case FieldType.DATE:
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

       



       
      case FieldType.RATE:
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

      case FieldType.HEADER:
        const handleHeadingBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
          isEditingRef.current = false;
          const newContent = e.currentTarget.textContent || "";
          headingContentRef.current = newContent;
          if (newContent !== element.label) {
            updateField(element.id, { label: newContent });
          }
        };

        const handleHeadingFocus = (_e: React.FocusEvent<HTMLHeadingElement>) => {
          if (isDesigner) {
            selectField(element.id);
          }
          isEditingRef.current = true;
        };

        const handleHeadingKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
          
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          
          e.stopPropagation();
        };



        const handleHeadingMouseDown = (e: React.MouseEvent<HTMLHeadingElement>) => {
          
          e.stopPropagation();
          
        };

        const handleHeadingInput = (e: React.FormEvent<HTMLHeadingElement>) => {
          
          e.stopPropagation();
          
          isEditingRef.current = true;
        };

        const handleHeadingBeforeInput = (_e: React.FormEvent<HTMLHeadingElement>) => {
          
          isEditingRef.current = true;
        };

        
        const headingContentRef = useRef<string>(element.label || "Heading");
        const headingInitializedRef = useRef(false);
        
        
        useEffect(() => {
          if (!isSelected) {
            headingInitializedRef.current = false;
          }
        }, [isSelected]);
        
        


        
        useEffect(() => {
          if (headingRef.current && isDesigner && isSelected && !isEditingRef.current) {
             const element = headingRef.current;
             
             
             element.focus();
             
             
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

             
             const checkFocus = setTimeout(() => {
                if (document.activeElement !== element) {
                   element.focus();
                   setCursorToEnd();
                }
             }, 50);

             return () => clearTimeout(checkFocus);
          }
        }, [isDesigner, isSelected]);

        
        
        
        const [headingMarkup] = useState(() => {
          const content = element.label || "Heading";
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
             const currentContent = element.label || "Heading";
             if (headingRef.current.textContent !== currentContent) {
                headingRef.current.textContent = currentContent;
             }
          }
        }, [element.label]);

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

      case FieldType.PARAGRAPH:
        const handleParagraphBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
          isEditingRef.current = false;
          const newContent = e.currentTarget.textContent || "";
          paragraphContentRef.current = newContent;
          if (newContent !== element.label) {
            updateField(element.id, { label: newContent });
          }
        };

        const handleParagraphFocus = (_e: React.FocusEvent<HTMLParagraphElement>) => {
          if (isDesigner) {
            selectField(element.id);
          }
          isEditingRef.current = true;
        };

        const handleParagraphKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
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

        const handleParagraphBeforeInput = (_e: React.FormEvent<HTMLParagraphElement>) => {
          // Mark as editing to prevent React from interfering
          isEditingRef.current = true;
        };

        // Store content in ref to track what we set vs what React might try to set
        const paragraphContentRef = useRef<string>(element.label || "Paragraph");
        const paragraphInitializedRef = useRef(false);
        
        // Reset initialization flag when selection changes
        useEffect(() => {
          if (!isSelected) {
            paragraphInitializedRef.current = false;
          }
        }, [isSelected]);
        
        // Set content via ref callback - this runs synchronously during render


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
          const content = element.label || "Paragraph";
          return {
            __html: content
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;")
          };
        });

        
        useEffect(() => {
          if (paragraphRef.current && document.activeElement !== paragraphRef.current) {
             const currentContent = element.label || "Paragraph";
             if (paragraphRef.current.textContent !== currentContent) {
                paragraphRef.current.textContent = currentContent;
             }
          }
        }, [element.label]);

        
        useEffect(() => {
          if (paragraphRef.current && isDesigner && isSelected) {
             const element = paragraphRef.current;
             if (document.activeElement !== element) {
                element.focus({ preventScroll: true });
                
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

