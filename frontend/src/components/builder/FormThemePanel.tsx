"use client";

import { useState } from "react";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Palette, Image, Type, Layout, Sparkles } from "lucide-react";
import { FormTheme } from "@/types/form";

interface FormThemePanelProps {
  theme: FormTheme;
  onThemeChange: (theme: FormTheme) => void;
}

const defaultTheme: FormTheme = {
  primaryColor: "#3B82F6",
  backgroundColor: "#FFFFFF",
  backgroundType: "color",
  textColor: "#1F2937",
  buttonStyle: "filled",
  borderRadius: "medium",
  fontFamily: "Inter",
};

export default function FormThemePanel({ theme, onThemeChange }: FormThemePanelProps) {
  const [localTheme, setLocalTheme] = useState<FormTheme>(theme || defaultTheme);

  // Sync with prop changes
  React.useEffect(() => {
    if (theme) {
      setLocalTheme(theme);
    }
  }, [theme]);

  const handleChange = (updates: Partial<FormTheme>) => {
    const newTheme = { ...localTheme, ...updates };
    setLocalTheme(newTheme);
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
      setLocalTheme(preset);
      onThemeChange(preset);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Form Theme
        </CardTitle>
        <CardDescription>Customize the appearance of your form</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Themes */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Preset Themes
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(presetThemes).map(([name, theme]) => (
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
        {/* Primary Color */}
        <div className="space-y-2">
          <Label>Primary Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={localTheme.primaryColor}
              onChange={(e) => handleChange({ primaryColor: e.target.value })}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={localTheme.primaryColor}
              onChange={(e) => handleChange({ primaryColor: e.target.value })}
              placeholder="#3B82F6"
            />
          </div>
        </div>

        {/* Background Type */}
        <div className="space-y-2">
          <Label>Background Type</Label>
          <Select
            value={localTheme.backgroundType}
            onChange={(e) => handleChange({ backgroundType: e.target.value as "color" | "image" | "gradient" })}
          >
            <option value="color">Solid Color</option>
            <option value="gradient">Gradient</option>
            <option value="image">Image</option>
          </Select>
        </div>

        {/* Background Color/Image */}
        {localTheme.backgroundType === "color" && (
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={localTheme.backgroundColor}
                onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={localTheme.backgroundColor}
                onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        )}

        {localTheme.backgroundType === "image" && (
          <div className="space-y-2">
            <Label>Background Image URL</Label>
            <Input
              type="url"
              value={localTheme.backgroundImage || ""}
              onChange={(e) => handleChange({ backgroundImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL to an image or use a pattern
            </p>
          </div>
        )}

        {localTheme.backgroundType === "gradient" && (
          <div className="space-y-2">
            <Label>Gradient Colors</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">From</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localTheme.backgroundColor}
                    onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={localTheme.backgroundColor}
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
                    value={localTheme.primaryColor}
                    onChange={(e) => handleChange({ primaryColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={localTheme.primaryColor}
                    onChange={(e) => handleChange({ primaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Text Color */}
        <div className="space-y-2">
          <Label>Text Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={localTheme.textColor}
              onChange={(e) => handleChange({ textColor: e.target.value })}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={localTheme.textColor}
              onChange={(e) => handleChange({ textColor: e.target.value })}
              placeholder="#1F2937"
            />
          </div>
        </div>

        {/* Button Style */}
        <div className="space-y-2">
          <Label>Button Style</Label>
          <Select
            value={localTheme.buttonStyle}
            onChange={(e) => handleChange({ buttonStyle: e.target.value as "filled" | "outlined" | "ghost" })}
          >
            <option value="filled">Filled</option>
            <option value="outlined">Outlined</option>
            <option value="ghost">Ghost</option>
          </Select>
        </div>

        {/* Border Radius */}
        <div className="space-y-2">
          <Label>Border Radius</Label>
          <Select
            value={localTheme.borderRadius}
            onChange={(e) => handleChange({ borderRadius: e.target.value as "none" | "small" | "medium" | "large" })}
          >
            <option value="none">None</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </Select>
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label>Font Family</Label>
          <Select
            value={localTheme.fontFamily}
            onChange={(e) => handleChange({ fontFamily: e.target.value })}
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Poppins">Poppins</option>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

