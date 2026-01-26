"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Palette, Sparkles } from "lucide-react";
import { FormTheme } from "@/types";

interface FormThemePanelProps {
  theme: FormTheme;
  onThemeChange: (theme: FormTheme) => void;
}

const defaultTheme: FormTheme = {
  primaryColor: "#000000",
  backgroundColor: "#FFFFFF",
  backgroundType: "color",
  textColor: "#000000",
  buttonStyle: "filled",
  borderRadius: "medium",
  fontFamily: "Inter",
};

import { useTranslation } from "react-i18next";

export default function FormThemePanel({ theme, onThemeChange }: FormThemePanelProps) {
  const { t } = useTranslation();
  const handleChange = (updates: Partial<FormTheme>) => {
    console.log('Theme update:', updates);
    const newTheme = { ...theme, ...updates };
    console.log('New theme:', newTheme);
    onThemeChange(newTheme);
  };

  const presetThemes: Record<string, FormTheme> = {
    default: {
      primaryColor: "#3B82F6",
      backgroundColor: "#FFFFFF",
      backgroundType: "color",
      textColor: "#1F2937",
      buttonStyle: "filled",
      borderRadius: "medium",
      fontFamily: "Inter",
    },
    modern: {
      primaryColor: "#8B5CF6",
      backgroundColor: "#F9FAFB",
      backgroundType: "color",
      textColor: "#111827",
      buttonStyle: "filled",
      borderRadius: "large",
      fontFamily: "Poppins",
    },
    elegant: {
      primaryColor: "#059669",
      backgroundColor: "#FFFFFF",
      backgroundType: "color",
      textColor: "#0F172A",
      buttonStyle: "outlined",
      borderRadius: "small",
      fontFamily: "Montserrat",
    },
    vibrant: {
      primaryColor: "#F59E0B",
      backgroundColor: "#FEF3C7",
      backgroundType: "gradient",
      textColor: "#1F2937",
      buttonStyle: "filled",
      borderRadius: "large",
      fontFamily: "Roboto",
    },
    dark: {
      primaryColor: "#10B981",
      backgroundColor: "#1F2937",
      backgroundType: "color",
      textColor: "#F9FAFB",
      buttonStyle: "filled",
      borderRadius: "medium",
      fontFamily: "Inter",
    },
  };

  const applyPreset = (presetName: string) => {
    const preset = presetThemes[presetName];
    if (preset) {
      onThemeChange(preset);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5" />
          {t('builder.theme.title', 'Form Theme')}
        </CardTitle>
        <CardDescription>{t('builder.theme.description', 'Customize the appearance of your form')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        { }
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t('builder.theme.presets', 'Preset Themes')}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(presetThemes).map(([name]) => (
              <Button
                key={name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(name)}
                className="capitalize"
              >
                {name}
              </Button>
            ))}
          </div>
        </div>

        <div className="border-t pt-4" />
        { }
        <div className="space-y-2">
          <Label>{t('builder.theme.primary_color', 'Primary Color')}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => handleChange({ primaryColor: e.target.value })}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={theme.primaryColor}
              onChange={(e) => handleChange({ primaryColor: e.target.value })}
              placeholder="#3B82F6"
            />
          </div>
        </div>

        { }
        <div className="space-y-2">
          <Label>{t('builder.theme.background_type', 'Background Type')}</Label>
          <Select
            key={`bg-type-${theme.backgroundType}`}
            value={theme.backgroundType}
            onValueChange={(value) => handleChange({ backgroundType: value as "color" | "image" | "gradient" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="color">{t('builder.theme.type_color', 'Solid Color')}</SelectItem>
              <SelectItem value="gradient">{t('builder.theme.type_gradient', 'Gradient')}</SelectItem>
              <SelectItem value="image">{t('builder.theme.type_image', 'Image')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        { }
        {theme.backgroundType === "color" && (
          <div className="space-y-2">
            <Label>{t('builder.theme.bg_color', 'Background Color')}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={theme.backgroundColor}
                onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        )}

        {theme.backgroundType === "image" && (
          <div className="space-y-2">
            <Label>{t('builder.theme.bg_image', 'Background Image URL')}</Label>
            <Input
              type="url"
              value={theme.backgroundImage || ""}
              onChange={(e) => handleChange({ backgroundImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL to an image or use a pattern
            </p>
          </div>
        )}

        {theme.backgroundType === "gradient" && (
          <div className="space-y-2">
            <Label>{t('builder.theme.bg_gradient', 'Gradient Colors')}</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">From</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label className="text-xs">To</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => handleChange({ primaryColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => handleChange({ primaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        { }
        <div className="space-y-2">
          <Label>{t('builder.theme.text_color', 'Text Color')}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={theme.textColor}
              onChange={(e) => handleChange({ textColor: e.target.value })}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={theme.textColor}
              onChange={(e) => handleChange({ textColor: e.target.value })}
              placeholder="#1F2937"
            />
          </div>
        </div>

        { }
        <div className="space-y-2">
          <Label>{t('builder.theme.btn_style', 'Button Style')}</Label>
          <Select
            key={`btn-style-${theme.buttonStyle}`}
            value={theme.buttonStyle}
            onValueChange={(value) => handleChange({ buttonStyle: value as "filled" | "outlined" | "ghost" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="filled">{t('builder.theme.btn_filled', 'Filled')}</SelectItem>
              <SelectItem value="outlined">{t('builder.theme.btn_outlined', 'Outlined')}</SelectItem>
              <SelectItem value="ghost">{t('builder.theme.btn_ghost', 'Ghost')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        { }
        <div className="space-y-2">
          <Label>{t('builder.theme.border_radius', 'Border Radius')}</Label>
          <Select
            key={`border-${theme.borderRadius}`}
            value={theme.borderRadius}
            onValueChange={(value) => handleChange({ borderRadius: value as "none" | "small" | "medium" | "large" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('builder.theme.radius_none', 'None')}</SelectItem>
              <SelectItem value="small">{t('builder.theme.radius_small', 'Small')}</SelectItem>
              <SelectItem value="medium">{t('builder.theme.radius_medium', 'Medium')}</SelectItem>
              <SelectItem value="large">{t('builder.theme.radius_large', 'Large')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        { }
        <div className="space-y-2">
          <Label>{t('builder.theme.font_family', 'Font Family')}</Label>
          <Select
            key={`font-${theme.fontFamily}`}
            value={theme.fontFamily}
            onValueChange={(value) => handleChange({ fontFamily: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Roboto">Roboto</SelectItem>
              <SelectItem value="Open Sans">Open Sans</SelectItem>
              <SelectItem value="Lato">Lato</SelectItem>
              <SelectItem value="Montserrat">Montserrat</SelectItem>
              <SelectItem value="Poppins">Poppins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

