"use client";

import { Field } from "@/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ParagraphPropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

export default function ParagraphProperties({ element, onUpdate }: ParagraphPropertiesProps) {
  return (
    <div className="space-y-2">
      <Label>Content</Label>
      <Textarea
        value={element.content || ""}
        onChange={(e) => onUpdate({ content: e.target.value })}
        rows={4}
      />
    </div>
  );
}
