"use client";

import { useState } from "react";
import * as React from "react";
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, MouseSensor, TouchSensor, useSensor, useSensors, DragStartEvent, DragOverlay } from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { useBuilderStore } from "@/hooks/useBuilderStore";
import ElementsSidebar from "@/components/builder/ElementsSidebar";
import Canvas from "@/components/builder/Canvas";
import PropertiesPanel from "@/components/builder/PropertiesPanel";
import DesignerElementCard from "@/components/builder/DesignerElementCard";
import FormThemePanel from "@/components/builder/FormThemePanel";
import FormSettingsPanel from "@/components/builder/FormSettingsPanel";
import ActiveEditors from "@/components/builder/ActiveEditors";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Save, Eye, Send, Settings, Palette, ArrowLeft, Copy, Undo2, Redo2, Type, Mail, Hash, FileText, List, CheckSquare, Circle, Calendar, Upload, Star, Heading, AlignLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { mockActiveEditors } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toaster";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    elements, 
    removeElement,
    duplicateElement,
    undo,
    redo,
    historyIndex,
    history,
    theme, 
    settings, 
    setTheme, 
    setSettings,
    addElement,
    addElementAt,
    reorderElements,
  } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<"properties" | "theme" | "settings">("properties");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [elementToDelete, setElementToDelete] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    
    // Extract type from sidebar drag
    if (id.startsWith('sidebar-')) {
      const type = id.replace('sidebar-', '');
      setDraggedType(type);
    } else {
      // Canvas element drag - find the element
      const draggedElement = elements.find(el => el.id === id);
      if (draggedElement) {
        setDraggedType(draggedElement.type);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedType(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Drag from sidebar to canvas
    if (activeData?.source === "sidebar") {
      // Check if dropped on canvas or on an element in canvas
      let insertIndex = elements.length;
      
      if (over.id === "canvas") {
        // Dropped directly on canvas
        insertIndex = elements.length;
      } else {
        // Dropped on an element - find its index
        const overIndex = elements.findIndex((el) => el.id === over.id);
        if (overIndex !== -1) {
          insertIndex = overIndex;
        }
      }

      const elementType = activeData.type;
      
      const needsOptions = (type: string): boolean => {
        return ["select", "radio", "checkbox"].includes(type);
      };

      const getDefaultLabel = (type: string): string => {
        const labels: Record<string, string> = {
          text: "Text Input",
          email: "Email",
          number: "Number",
          textarea: "Textarea",
          select: "Select",
          checkbox: "Checkbox",
          radio: "Radio",
          date: "Date",
          file: "File Upload",
          rating: "Rating",
          heading: "Heading",
          paragraph: "Paragraph",
        };
        return labels[type] || "Field";
      };

      const newElement = {
        id: `element-${Date.now()}`,
        type: elementType,
        label: getDefaultLabel(elementType),
        required: false,
        ...(needsOptions(elementType) && {
          options: [
            { id: "opt-1", label: "Option 1", value: "option-1" },
            { id: "opt-2", label: "Option 2", value: "option-2" },
          ],
        }),
        ...(elementType === "rating" && { max: 5 }),
        ...(elementType === "textarea" && { rows: 4 }),
      };

      if (insertIndex >= elements.length) {
        addElement(newElement);
      } else {
        addElementAt(newElement, insertIndex);
      }
    }
    // Reorder elements in canvas
    else if (activeData?.source === "canvas" && overData?.source === "canvas") {
      const oldIndex = elements.findIndex((el) => el.id === active.id);
      const newIndex = elements.findIndex((el) => el.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderElements(oldIndex, newIndex);
      }
    }
  };


  const handleSave = () => {
    // In a real app, this would save to a backend
    console.log("Saving form:", { id: params.id, elements });
    toast({
      title: "Form saved",
      description: "Your form has been saved successfully.",
      variant: "success",
    });
  };

  const handlePreview = () => {
    router.push(`/preview/${params.id}`);
  };

  const handlePublish = () => {
    // In a real app, this would publish the form
    console.log("Publishing form:", params.id);
    toast({
      title: "Form published",
      description: "Your form is now live and ready to collect responses.",
      variant: "success",
    });
  };

  const handleDeleteElement = (id: string) => {
    setElementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (elementToDelete) {
      removeElement(elementToDelete);
      toast({
        title: "Element deleted",
        description: "The element has been removed from your form.",
        variant: "default",
      });
      setDeleteDialogOpen(false);
      setElementToDelete(null);
    }
  };

  const handleUndo = () => {
    undo();
    toast({
      title: "Undone",
      description: "Last action has been undone.",
      variant: "default",
    });
  };

  const handleRedo = () => {
    redo();
    toast({
      title: "Redone",
      description: "Action has been redone.",
      variant: "default",
    });
  };

  const handleDuplicate = (id: string) => {
    duplicateElement(id);
    toast({
      title: "Element duplicated",
      description: "The element has been duplicated.",
      variant: "default",
    });
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (historyIndex > 0) {
          handleUndo();
        }
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") || 
          ((e.ctrlKey || e.metaKey) && e.key === "y")) {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          handleRedo();
        }
      }
      // Delete key to remove selected element
      if (e.key === "Delete" || e.key === "Backspace") {
        const state = useBuilderStore.getState();
        const selected = elements.find((el) => el.id === state.selectedElementId);
        if (selected && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault();
          handleDeleteElement(selected.id);
        }
      }
      // Ctrl/Cmd + D to duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        const state = useBuilderStore.getState();
        const selected = state.selectedElementId;
        if (selected) {
          handleDuplicate(selected);
        }
      }
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history.length, elements]);

  const activeEditors = mockActiveEditors[params.id] || [];

  return (
    <div 
      className="flex flex-col h-screen"
      style={{
        overflowX: 'hidden',
        overscrollBehaviorX: 'none',
      }}
    >
        {/* Header */}
        <div className="border-b bg-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Tooltip content="Back to Dashboard">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Tooltip>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Form Builder</h1>
              <p className="text-sm text-gray-500 mt-0.5">Form ID: {params.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <Tooltip content="Undo (Ctrl+Z)">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Redo (Ctrl+Shift+Z)">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </Tooltip>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Tooltip content="Save form (Ctrl+S)">
              <Button variant="outline" onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </Tooltip>
            <Tooltip content="Preview form">
              <Button variant="outline" onClick={handlePreview} size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Tooltip>
            <Tooltip content="Publish form">
              <Button onClick={handlePublish} size="sm">
                <Send className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Active Editors */}
        {activeEditors.length > 0 && (
          <ActiveEditors editors={activeEditors} />
        )}

        {/* Main Content */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          autoScroll={false}
          modifiers={[restrictToVerticalAxis]}
        >
          <div 
            className="flex flex-1 overflow-hidden"
            style={{
              overscrollBehaviorX: 'none',
            }}
          >
            <ElementsSidebar />
            <Canvas activeId={activeId} />
            <div className="w-80 border-l overflow-y-auto">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "properties" | "theme" | "settings")}>
              <div className="sticky top-0 bg-white border-b z-10">
                <TabsList className="w-full grid grid-cols-3 rounded-none h-12">
                  <TabsTrigger value="properties" className="text-xs">
                    Properties
                  </TabsTrigger>
                  <TabsTrigger value="theme" className="text-xs">
                    <Palette className="h-3.5 w-3.5 mr-1" />
                    Theme
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs">
                    <Settings className="h-3.5 w-3.5 mr-1" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="properties" className="m-0">
                <PropertiesPanel />
              </TabsContent>
              
              <TabsContent value="theme" className="m-0 p-4">
                {theme && (
                  <FormThemePanel
                    theme={theme}
                    onThemeChange={setTheme}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="settings" className="m-0 p-4">
                {settings && (
                  <FormSettingsPanel
                    settings={settings}
                    onSettingsChange={setSettings}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
          </div>
          
          <DragOverlay>
            {activeId && draggedType ? (
              activeId.startsWith('sidebar-') ? (
                // Sidebar drag overlay
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-white shadow-lg opacity-90 cursor-grabbing">
                  {draggedType === "text" && <Type className="h-5 w-5" />}
                  {draggedType === "email" && <Mail className="h-5 w-5" />}
                  {draggedType === "number" && <Hash className="h-5 w-5" />}
                  {draggedType === "textarea" && <FileText className="h-5 w-5" />}
                  {draggedType === "select" && <List className="h-5 w-5" />}
                  {draggedType === "checkbox" && <CheckSquare className="h-5 w-5" />}
                  {draggedType === "radio" && <Circle className="h-5 w-5" />}
                  {draggedType === "date" && <Calendar className="h-5 w-5" />}
                  {draggedType === "file" && <Upload className="h-5 w-5" />}
                  {draggedType === "rating" && <Star className="h-5 w-5" />}
                  {draggedType === "heading" && <Heading className="h-5 w-5" />}
                  {draggedType === "paragraph" && <AlignLeft className="h-5 w-5" />}
                  <span className="text-sm font-medium">
                    {draggedType === "text" && "Text Input"}
                    {draggedType === "email" && "Email"}
                    {draggedType === "number" && "Number"}
                    {draggedType === "textarea" && "Textarea"}
                    {draggedType === "select" && "Select"}
                    {draggedType === "checkbox" && "Checkbox"}
                    {draggedType === "radio" && "Radio"}
                    {draggedType === "date" && "Date"}
                    {draggedType === "file" && "File Upload"}
                    {draggedType === "rating" && "Rating"}
                    {draggedType === "heading" && "Heading"}
                    {draggedType === "paragraph" && "Paragraph"}
                  </span>
                </div>
              ) : (
                // Canvas element drag overlay - show the actual element card
                (() => {
                  const draggedElement = elements.find(el => el.id === activeId);
                  if (!draggedElement) return null;
                  return (
                    <div className="opacity-90 cursor-grabbing" style={{ transform: 'none' }}>
                      <DesignerElementCard
                        element={draggedElement}
                        isSelected={false}
                      />
                    </div>
                  );
                })()
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Element</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this element? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
