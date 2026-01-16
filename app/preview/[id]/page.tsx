"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DeviceFrame from "@/components/form-preview/DeviceFrame";
import FormElementRenderer from "@/components/builder/FormElementRenderer";
import { useBuilderStore } from "@/hooks/useBuilderStore";
import { Monitor, Tablet, Smartphone, ArrowLeft } from "lucide-react";
import { mockForms } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

const getBackgroundStyle = (theme?: any) => {
  if (!theme) return {};
  
  if (theme.backgroundType === "color") {
    return { backgroundColor: theme.backgroundColor };
  } else if (theme.backgroundType === "image" && theme.backgroundImage) {
    return {
      backgroundImage: `url(${theme.backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  } else if (theme.backgroundType === "gradient") {
    return {
      background: `linear-gradient(135deg, ${theme.backgroundColor} 0%, ${theme.primaryColor} 100%)`,
    };
  }
  return {};
};

const getBorderRadius = (theme?: any) => {
  if (!theme) return "rounded-lg";
  const radiusMap: Record<string, string> = {
    none: "rounded-none",
    small: "rounded-sm",
    medium: "rounded-lg",
    large: "rounded-xl",
  };
  return radiusMap[theme.borderRadius] || "rounded-lg";
};

export default function PreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const { currentForm } = useBuilderStore();
  const elements = currentForm?.fields || [];
  
  const theme: {
    primaryColor: string;
    backgroundColor: string;
    backgroundType: 'color' | 'image' | 'gradient';
    textColor: string;
    buttonStyle: 'filled' | 'outlined' | 'ghost';
    borderRadius: string;
    fontFamily: string;
    backgroundImage?: string;
  } | undefined = currentForm?.settings ? {
    primaryColor: currentForm.settings.primaryColor || '#0f172a',
    backgroundColor: currentForm.settings.backgroundColor || '#ffffff',
    backgroundType: currentForm.settings.backgroundType || 'color',
    textColor: currentForm.settings.textColor || '#0f172a',
    buttonStyle: 'filled',
    borderRadius: currentForm.settings.borderRadius || 'medium',
    fontFamily: currentForm.settings.fontFamily || 'Inter',
    backgroundImage: currentForm.settings.backgroundImage,
  } : undefined;
  
  // In a real app, you'd fetch the form schema from an API
  // For now, we'll use the store or mock data
  const form = mockForms.find((f) => f.id === params.id);

  // If no elements in store, use mock elements for preview
  const previewElements = elements.length > 0 ? elements : [
    {
      id: "1",
      formId: params.id,
      order: 0,
      type: "heading" as const,
      label: "",
      required: false,
      content: "Welcome to Our Form",
    },
    {
      id: "2",
      formId: params.id,
      order: 1,
      type: "text" as const,
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      helperText: "Please enter your first and last name",
    },
    {
      id: "3",
      formId: params.id,
      order: 2,
      type: "email" as const,
      label: "Email Address",
      placeholder: "your.email@example.com",
      required: true,
    },
    {
      id: "4",
      formId: params.id,
      order: 3,
      type: "textarea" as const,
      label: "Message",
      placeholder: "Enter your message here...",
      required: false,
      rows: 5,
    },
    {
      id: "5",
      formId: params.id,
      order: 4,
      type: "select" as const,
      label: "Country",
      required: true,
      options: [
        { id: "opt-1", label: "United States", value: "us" },
        { id: "opt-2", label: "Canada", value: "ca" },
        { id: "opt-3", label: "United Kingdom", value: "uk" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Tooltip content="Back to Builder">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/builder/${params.id}`)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Tooltip>
              <div>
                <h1 className="text-xl font-semibold">
                  {form?.title || "Form Preview"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Preview your form on different devices
                </p>
              </div>
            </div>
            <Tabs
              value={device}
              onValueChange={(value) =>
                setDevice(value as "desktop" | "tablet" | "mobile")
              }
            >
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="desktop" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline">Desktop</span>
                </TabsTrigger>
                <TabsTrigger value="tablet" className="flex items-center gap-2">
                  <Tablet className="h-4 w-4" />
                  <span className="hidden sm:inline">Tablet</span>
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden sm:inline">Mobile</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <DeviceFrame device={device}>
        <form 
          className="space-y-6"
          style={{
            ...getBackgroundStyle(theme),
            color: theme?.textColor || "#1F2937",
            fontFamily: theme?.fontFamily || "Inter",
            padding: "1rem",
            borderRadius: theme?.borderRadius === "none" ? "0" : 
                         theme?.borderRadius === "small" ? "0.125rem" :
                         theme?.borderRadius === "large" ? "0.75rem" : "0.5rem",
          }}
        >
          {previewElements.map((element) => (
            <FormElementRenderer key={element.id} element={element as any} />
          ))}
          <div className="pt-4">
            <button
              type="submit"
              className={`
                w-full py-3 px-6 rounded-md font-medium transition-colors
                ${theme?.buttonStyle === "outlined" 
                  ? "border-2 bg-transparent hover:bg-opacity-10" 
                  : theme?.buttonStyle === "ghost"
                  ? "bg-transparent hover:bg-opacity-10"
                  : "hover:opacity-90"
                }
              `}
              style={{
                backgroundColor: theme?.buttonStyle === "filled" ? theme?.primaryColor : "transparent",
                color: theme?.buttonStyle === "filled" ? "#FFFFFF" : theme?.primaryColor,
                borderColor: theme?.buttonStyle === "outlined" ? theme?.primaryColor : "transparent",
                borderRadius: theme?.borderRadius === "none" ? "0" : 
                             theme?.borderRadius === "small" ? "0.125rem" :
                             theme?.borderRadius === "large" ? "0.75rem" : "0.5rem",
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </DeviceFrame>
    </div>
  );
}
