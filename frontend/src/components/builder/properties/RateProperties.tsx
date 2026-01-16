"use client";

import { Field } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RatePropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

export default function RateProperties({ element, onUpdate }: RatePropertiesProps) {
  return (
    <div className="space-y-2">
      <Label>Max Rating</Label>
      <Input
        type="number"
        value={element.max || 5}
        onChange={(e) => onUpdate({ max: parseInt(e.target.value) || 5 })}
      />
    </div>
  );
}
