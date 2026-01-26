"use client";

import { Field } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BaseFieldPropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

import { useTranslation } from "react-i18next";

export default function BaseFieldProperties({ element, onUpdate }: BaseFieldPropertiesProps) {
  const { t } = useTranslation();
  return (
    <>

      <div className="rounded-lg border p-4 shadow-sm bg-slate-50 dark:bg-slate-900 mb-4 border-blue-200">
        <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <Label className="text-base font-medium">{t('builder.properties.pdpa_title', 'Collect Personal Data (PDPA)')}</Label>
                <div className="text-[0.8rem] text-muted-foreground">
                    {t('builder.properties.pdpa_desc', 'Data in this field will be encrypted before saving')}
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
        <Label>{t('builder.properties.field_label', 'Label')}</Label>
        <Input
          value={element.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('builder.properties.placeholder', 'Placeholder')}</Label>
        <Input
          value={element.placeholder || ""}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('builder.properties.helper_text', 'Helper Text')}</Label>
        <Input
          value={element.helperText || ""}
          onChange={(e) => onUpdate({ helperText: e.target.value })}
        />
      </div>


      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">{t('builder.properties.media', 'Media (Image & Video)')}</h3>
        
        <div className="space-y-2">
            <Label>{t('builder.properties.image_url', 'Image URL')}</Label>
            <Input 
                value={element.imageUrl || ""} 
                onChange={(e) => onUpdate({ imageUrl: e.target.value })} 
                placeholder="https://example.com/image.jpg"
            />
        </div>

        {element.imageUrl && (
            <div className="space-y-2">
                <Label>{t('builder.properties.image_width', 'Image Size (Width)')}</Label>
                <Input 
                    value={element.imageWidth || ""} 
                    onChange={(e) => onUpdate({ imageWidth: e.target.value })} 
                    placeholder="e.g. 100%, 500px"
                />
                <p className="text-xs text-muted-foreground">{t('builder.properties.image_width_desc', 'Limit the display size of the image.')}</p>
            </div>
        )}

        <div className="space-y-2">
            <Label>{t('builder.properties.video_url', 'YouTube Video URL')}</Label>
             <Input 
                value={element.videoUrl || ""} 
                onChange={(e) => onUpdate({ videoUrl: e.target.value })} 
                placeholder="https://youtube.com/watch?v=..."
            />
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input
          type="checkbox"
          id="required"
          checked={element.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="required" className="cursor-pointer">
          {t('builder.properties.required', 'Required')}
        </Label>
      </div>


    </>
  );
}
