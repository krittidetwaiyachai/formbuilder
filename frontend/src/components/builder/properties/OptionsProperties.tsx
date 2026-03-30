"use client";
import type { Field } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
interface OptionItem {
  id: string;
  label: string;
  value: string;
}
interface OptionsPropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}
const getItems = (options: Field["options"]): OptionItem[] => {
  if (!options) return [];
  if ("items" in options && Array.isArray(options.items)) {
    return options.items as OptionItem[];
  }
  return [];
};
export default function OptionsProperties({
  element,
  onUpdate
}: OptionsPropertiesProps) {
  const { t } = useTranslation();
  const items = getItems(element.options);
  const handleAddOption = () => {
    const newOption: OptionItem = {
      id: `opt-${Date.now()}`,
      label: `Option ${items.length + 1}`,
      value: `option-${items.length + 1}`
    };
    onUpdate({
      options: {
        ...element.options,
        items: [...items, newOption]
      } as Field["options"]
    });
  };
  const handleRemoveOption = (optionId: string) => {
    onUpdate({
      options: {
        ...element.options,
        items: items.filter((opt) => opt.id !== optionId)
      } as Field["options"]
    });
  };
  const handleUpdateOption = (
  optionId: string,
  updates: {label?: string;value?: string;}) =>
  {
    onUpdate({
      options: {
        ...element.options,
        items: items.map((opt) =>
        opt.id === optionId ? { ...opt, ...updates } : opt
        )
      } as Field["options"]
    });
  };
  return (
    <div className="space-y-2">      <div className="flex items-center justify-between">        <Label>{t("builder.properties.options", "Options")}</Label>        <Button
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          className="h-8">
          <Plus className="h-3 w-3 mr-1" />          {t("builder.properties.add", "Add")}        </Button>      </div>      <div className="space-y-2">        {items.map((option) =>
        <div key={option.id} className="flex gap-2">          <Input
            value={option.label}
            onChange={(e) =>
            handleUpdateOption(option.id, { label: e.target.value })
            }
            placeholder="Label" />
            <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-destructive"
            onClick={() => handleRemoveOption(option.id)}>
              <Trash2 className="h-4 w-4" />          </Button>        </div>
        )}      </div>      <div className="space-y-2 mt-4 pt-4 border-t">        <Label>          {t("builder.properties.answer_explanation", "Answer Explanation")}        </Label>        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={element.explanation || ""}
          onChange={(e) => onUpdate({ explanation: e.target.value })}
          placeholder={t(
            "builder.properties.answer_explanation_placeholder",
            "Explain the correct answer..."
          )} />
        <p className="text-[0.8rem] text-muted-foreground">          {t(
            "builder.properties.answer_explanation_desc",
            "This explanation will be shown to respondents after they submit (if enabled)."
          )}        </p>      </div>    </div>);
}