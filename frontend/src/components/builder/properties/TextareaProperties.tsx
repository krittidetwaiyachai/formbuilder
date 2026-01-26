"use client";

import { Field } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextareaPropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

import { useTranslation } from "react-i18next";

export default function TextareaProperties({ element, onUpdate }: TextareaPropertiesProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label>{t('builder.properties.rows', 'Rows')}</Label>
      <Input
        type="number"
        value={element.rows || 4}
        onChange={(e) => onUpdate({ rows: parseInt(e.target.value) || 4 })}
      />
    </div>
  );
}
