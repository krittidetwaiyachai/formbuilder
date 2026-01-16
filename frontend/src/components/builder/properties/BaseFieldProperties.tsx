"use client";

import { Field } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BaseFieldPropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

export default function BaseFieldProperties({ element, onUpdate }: BaseFieldPropertiesProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Label</Label>
        <Input
          value={element.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Placeholder</Label>
        <Input
          value={element.placeholder || ""}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Helper Text</Label>
        <Input
          value={element.helperText || ""}
          onChange={(e) => onUpdate({ helperText: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="required"
          checked={element.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="required" className="cursor-pointer">
          Required
        </Label>
      </div>
    </>
  );
}
