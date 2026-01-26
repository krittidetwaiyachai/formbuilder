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

import { useTranslation } from "react-i18next";

export default function OptionsProperties({ element, onUpdate }: OptionsPropertiesProps) {
  const { t } = useTranslation();
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
        <Label>{t('builder.properties.options', 'Options')}</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          className="h-8"
        >
          <Plus className="h-3 w-3 mr-1" />
          {t('builder.properties.add', 'Add')}
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
      <div className="space-y-2 mt-4 pt-4 border-t">
        <Label>{t('builder.properties.answer_explanation', 'Answer Explanation')}</Label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={element.explanation || ''}
          onChange={(e) => onUpdate({ explanation: e.target.value })}
          placeholder={t('builder.properties.answer_explanation_placeholder', 'Explain the correct answer...')}
        />
        <p className="text-[0.8rem] text-muted-foreground">
          {t('builder.properties.answer_explanation_desc', 'This explanation will be shown to respondents after they submit (if enabled).')}
        </p>
      </div>
    </div>
  );
}
