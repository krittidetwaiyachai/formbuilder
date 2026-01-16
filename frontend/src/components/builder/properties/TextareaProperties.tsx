"use client";

import { Field } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextareaPropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

export default function TextareaProperties({ element, onUpdate }: TextareaPropertiesProps) {
  return (
    <div className="space-y-2">
      <Label>Rows</Label>
      <Input
        type="number"
        value={element.rows || 4}
        onChange={(e) => onUpdate({ rows: parseInt(e.target.value) || 4 })}
      />
    </div>
  );
}
