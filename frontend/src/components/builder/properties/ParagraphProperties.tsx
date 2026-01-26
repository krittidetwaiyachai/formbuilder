"use client";

import { Field } from "@/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ParagraphPropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

import { useTranslation } from "react-i18next";

export default function ParagraphProperties({ element, onUpdate }: ParagraphPropertiesProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label>{t('builder.properties.content', 'Content')}</Label>
      <Textarea
        value={element.content || ""}
        onChange={(e) => onUpdate({ content: e.target.value })}
        rows={4}
      />
    </div>
  );
}
