"use client";

import { Field } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumberPropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

export default function NumberProperties({ element, onUpdate }: NumberPropertiesProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Min</Label>
        <Input
          type="number"
          value={element.min || ""}
          onChange={(e) => onUpdate({ min: parseInt(e.target.value) || undefined })}
        />
      </div>
      <div className="space-y-2">
        <Label>Max</Label>
        <Input
          type="number"
          value={element.max || ""}
          onChange={(e) => onUpdate({ max: parseInt(e.target.value) || undefined })}
        />
      </div>
    </>
  );
}
