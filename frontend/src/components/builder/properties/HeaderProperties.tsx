"use client";

import { useState } from "react";
import { Field } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface HeaderPropertiesProps {
  element: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

import { useTranslation } from "react-i18next";

export default function HeaderProperties({ element, onUpdate }: HeaderPropertiesProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [headingTab, setHeadingTab] = useState<"general" | "image">("general");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        onUpdate({ headingImage: imageUrl } as Partial<Field>);
        toast({
          title: "Image uploaded",
          description: "Heading image has been set.",
          variant: "default",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onUpdate({ headingImage: undefined } as Partial<Field>);
    toast({
      title: "Image removed",
      description: "Heading image has been removed.",
      variant: "default",
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg">
      <Tabs value={headingTab} onValueChange={(v) => setHeadingTab(v as "general" | "image")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent text-white h-auto p-0 border-b border-gray-700">
          <TabsTrigger 
            value="general" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=inactive]:text-gray-400 py-3 px-4"
          >
            {t('builder.properties.general', 'GENERAL')}
          </TabsTrigger>
          <TabsTrigger 
            value="image"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=inactive]:text-gray-400 py-3 px-4"
          >
            {t('builder.properties.heading_image', 'HEADING IMAGE')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-0 p-4 space-y-4 bg-gray-800">
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium">{t('builder.properties.content', 'Content')}</Label>
            <Textarea
              value={element.content || ""}
              onChange={(e) => onUpdate({ content: e.target.value })}
              rows={4}
              className="bg-gray-700 text-white border-gray-600 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="mt-0 p-4 space-y-4 bg-gray-800">
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium">{t('builder.properties.heading_image', 'Heading Image')}</Label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
              <input
                type="file"
                id="heading-image-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="heading-image-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-300 font-medium">{t('builder.properties.choose_file', 'Choose a file')}</span>
              </label>
            </div>
            {(element as any).headingImage && (
              <div className="mt-4 space-y-2">
                <img
                  src={(element as any).headingImage}
                  alt="Heading preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-600"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="w-full bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                >
                  {t('builder.properties.remove_image', 'Remove Image')}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
