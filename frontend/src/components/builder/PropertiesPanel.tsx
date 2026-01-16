"use client";

import { useFormStore } from "@/store/formStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Copy, Image as ImageIcon } from "lucide-react";
import { FieldType as FormElementType, Field } from "@/types";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function PropertiesPanel() {
  const { toast } = useToast();
  const { selectedFieldId, currentForm, updateField, deleteField, duplicateField } =
    useFormStore();
  const elements = currentForm?.fields || [];
  const [headingTab, setHeadingTab] = useState<"general" | "image">("general");

  const selectedElement = elements.find((el: Field) => el.id === selectedFieldId);

  if (!selectedElement) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground text-center py-8">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<typeof selectedElement>) => {
    updateField(selectedElement.id, updates);
  };

  const handleAddOption = () => {
    const newOption = {
      id: `opt-${Date.now()}`,
      label: `Option ${(selectedElement.options?.length || 0) + 1}`,
      value: `option-${(selectedElement.options?.length || 0) + 1}`,
    };
    handleUpdate({
      options: [...(selectedElement.options || []), newOption],
    });
  };

  const handleRemoveOption = (optionId: string) => {
    handleUpdate({
      options: selectedElement.options?.filter((opt: any) => opt.id !== optionId),
    });
  };

  const handleUpdateOption = (optionId: string, updates: { label?: string; value?: string }) => {
    handleUpdate({
      options: selectedElement.options?.map((opt: any) =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      ),
    });
  };

  const needsOptions: FormElementType[] = [FormElementType.DROPDOWN, FormElementType.RADIO, FormElementType.CHECKBOX];

  const handleDelete = () => {
    // This will be handled by the parent component's delete dialog
    // For now, we'll use a simple confirmation
    if (confirm("Are you sure you want to delete this element?")) {
      deleteField(selectedElement.id);
      toast({
        title: "Element deleted",
        description: "The element has been removed from your form.",
        variant: "default",
      });
    }
  };

  const handleDuplicate = () => {
    duplicateField(selectedElement.id);
    toast({
      title: "Element duplicated",
      description: "The element has been duplicated.",
      variant: "default",
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Element Properties</h2>
        <div className="flex gap-1">
          <Tooltip content="Duplicate (Ctrl+D)">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDuplicate}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Delete (Delete key)">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
        {selectedElement.type !== FormElementType.HEADER &&
          selectedElement.type !== FormElementType.PARAGRAPH && (
            <>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={selectedElement.label}
                  onChange={(e) => handleUpdate({ label: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Placeholder</Label>
                <Input
                  value={selectedElement.placeholder || ""}
                  onChange={(e) =>
                    handleUpdate({ placeholder: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Helper Text</Label>
                <Input
                  value={selectedElement.helperText || ""}
                  onChange={(e) =>
                    handleUpdate({ helperText: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedElement.required}
                  onChange={(e) =>
                    handleUpdate({ required: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="required" className="cursor-pointer">
                  Required
                </Label>
              </div>
            </>
          )}

        {selectedElement.type === FormElementType.PARAGRAPH && (
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={selectedElement.content || ""}
              onChange={(e) => handleUpdate({ content: e.target.value })}
              rows={4}
            />
          </div>
        )}

        {selectedElement.type === FormElementType.HEADER && (
          <div className="bg-gray-800 rounded-lg">
            <Tabs value={headingTab} onValueChange={(v) => setHeadingTab(v as "general" | "image")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-transparent text-white h-auto p-0 border-b border-gray-700">
                <TabsTrigger 
                  value="general" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=inactive]:text-gray-400 py-3 px-4"
                >
                  GENERAL
                </TabsTrigger>
                <TabsTrigger 
                  value="image"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=inactive]:text-gray-400 py-3 px-4"
                >
                  HEADING IMAGE
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="mt-0 p-4 space-y-4 bg-gray-800">
                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Content</Label>
                  <Textarea
                    value={selectedElement.content || ""}
                    onChange={(e) => handleUpdate({ content: e.target.value })}
                    rows={4}
                    className="bg-gray-700 text-white border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="image" className="mt-0 p-4 space-y-4 bg-gray-800">
                <div className="space-y-2">
                  <Label className="text-white text-sm font-medium">Heading Image</Label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                    <input
                      type="file"
                      id="heading-image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const imageUrl = reader.result as string;
                            handleUpdate({ headingImage: imageUrl });
                            toast({
                              title: "Image uploaded",
                              description: "Heading image has been set.",
                              variant: "default",
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="heading-image-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-300 font-medium">Choose a file</span>
                    </label>
                  </div>
                  {(selectedElement as any).headingImage && (
                    <div className="mt-4 space-y-2">
                      <img
                        src={(selectedElement as any).headingImage}
                        alt="Heading preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-600"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleUpdate({ headingImage: undefined });
                          toast({
                            title: "Image removed",
                            description: "Heading image has been removed.",
                            variant: "default",
                          });
                        }}
                        className="w-full bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                      >
                        Remove Image
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {selectedElement.type === FormElementType.TEXTAREA && (
          <div className="space-y-2">
            <Label>Rows</Label>
            <Input
              type="number"
              value={selectedElement.rows || 4}
              onChange={(e) =>
                handleUpdate({ rows: parseInt(e.target.value) || 4 })
              }
            />
          </div>
        )}

        {selectedElement.type === FormElementType.NUMBER && (
          <>
            <div className="space-y-2">
              <Label>Min</Label>
              <Input
                type="number"
                value={selectedElement.min || ""}
                onChange={(e) =>
                  handleUpdate({ min: parseInt(e.target.value) || undefined })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Max</Label>
              <Input
                type="number"
                value={selectedElement.max || ""}
                onChange={(e) =>
                  handleUpdate({ max: parseInt(e.target.value) || undefined })
                }
              />
            </div>
          </>
        )}

        {selectedElement.type === FormElementType.RATE && (
          <div className="space-y-2">
            <Label>Max Rating</Label>
            <Input
              type="number"
              value={selectedElement.max || 5}
              onChange={(e) =>
                handleUpdate({ max: parseInt(e.target.value) || 5 })
              }
            />
          </div>
        )}

        {/* {selectedElement.type === FormElementType.FILE && ( // FILE type not yet in enum
          <div className="space-y-2">
            <Label>Accept</Label>
            <Input
              value={selectedElement.accept || ""}
              onChange={(e) => handleUpdate({ accept: e.target.value })}
              placeholder="e.g., image/*, .pdf"
            />
          </div>
        )} */}

        {needsOptions.includes(selectedElement.type) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {selectedElement.options?.map((option: any) => (
                <div key={option.id} className="flex gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) =>
                      handleUpdateOption(option.id, { label: e.target.value })
                    }
                    placeholder="Label"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-destructive"
                    onClick={() => handleRemoveOption(option.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

