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

      <div className="rounded-lg border p-4 shadow-sm bg-slate-50 dark:bg-slate-900 mb-4 border-blue-200">
        <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <Label className="text-base font-medium">เก็บข้อมูลส่วนบุคคล (PDPA)</Label>
                <div className="text-[0.8rem] text-muted-foreground">
                    ข้อมูลในช่องนี้จะถูกเข้ารหัสก่อนบันทึก
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={element.isPII || false} 
                    onChange={(e) => onUpdate({ isPII: e.target.checked })}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-offset-background rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
        </div>
      </div>

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
