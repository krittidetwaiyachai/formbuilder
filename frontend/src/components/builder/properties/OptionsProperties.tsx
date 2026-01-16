"use client";

import { Field } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface OptionsPropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

export default function OptionsProperties({ element, onUpdate }: OptionsPropertiesProps) {
  const handleAddOption = () => {
    const newOption = {
      id: `opt-${Date.now()}`,
      label: `Option ${(element.options?.length || 0) + 1}`,
      value: `option-${(element.options?.length || 0) + 1}`,
    };
    onUpdate({
      options: [...(element.options || []), newOption],
    });
  };

  const handleRemoveOption = (optionId: string) => {
    onUpdate({
      options: element.options?.filter((opt: any) => opt.id !== optionId),
    });
  };

  const handleUpdateOption = (optionId: string, updates: { label?: string; value?: string }) => {
    onUpdate({
      options: element.options?.map((opt: any) =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      ),
    });
  };

  return (
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
        {element.options?.map((option: any) => (
          <div key={option.id} className="flex gap-2">
            <Input
              value={option.label}
              onChange={(e) => handleUpdateOption(option.id, { label: e.target.value })}
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
  );
}
