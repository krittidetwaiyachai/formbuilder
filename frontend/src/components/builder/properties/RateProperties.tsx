"use client";

import { Field } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RatePropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

import { useTranslation } from "react-i18next";

export default function RateProperties({ element, onUpdate }: RatePropertiesProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label>{t('builder.properties.max_rating', 'Max Rating')}</Label>
      <Input
        type="number"
        value={element.max || 5}
        onChange={(e) => onUpdate({ max: parseInt(e.target.value) || 5 })}
      />
    </div>
  );
}
