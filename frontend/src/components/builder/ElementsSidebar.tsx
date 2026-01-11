"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { FormElementType } from "@/types/form";
import { useBuilderStore } from "@/hooks/useBuilderStore";
import {
  Type,
  Mail,
  Hash,
  FileText,
  List,
  CheckSquare,
  Circle,
  Calendar,
  Upload,
  Star,
  Heading,
  AlignLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ElementButtonProps {
  type: FormElementType;
  label: string;
  icon: React.ReactNode;
}


function ElementButton({ type, label, icon }: ElementButtonProps) {
  const { addElement } = useBuilderStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      source: "sidebar",
      type: type,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const needsOptions = (type: FormElementType): boolean => {
    return ["select", "radio", "checkbox"].includes(type);
  };

  const getDefaultLabel = (type: FormElementType): string => {
    const labels: Record<FormElementType, string> = {
      text: "Text Input",
      email: "Email",
      number: "Number",
      textarea: "Textarea",
      select: "Select",
      checkbox: "Checkbox",
      radio: "Radio",
      date: "Date",
      file: "File Upload",
      rating: "Rating",
      heading: "Heading",
      paragraph: "Paragraph",
    };
    return labels[type] || "Field";
  };

  const createNewElement = () => {
    return {
      id: `element-${Date.now()}`,
      type: type,
      label: getDefaultLabel(type),
      required: false,
      ...(needsOptions(type) && {
        options: [
          { id: "opt-1", label: "Option 1", value: "option-1" },
          { id: "opt-2", label: "Option 2", value: "option-2" },
        ],
      }),
      ...(type === "rating" && { max: 5 }),
      ...(type === "textarea" && { rows: 4 }),
    };
  };

  const handleDoubleClick = () => {
    const newElement = createNewElement();
    addElement(newElement);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-white cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors select-none",
        isDragging && "opacity-50"
      )}
    >
      <span style={{ pointerEvents: 'none' }}>{icon}</span>
      <span className="text-sm font-medium" style={{ pointerEvents: 'none' }}>{label}</span>
    </div>
  );
}

const elementTypes: Array<{
  type: FormElementType;
  label: string;
  icon: React.ReactNode;
}> = [
  { type: "text", label: "Text Input", icon: <Type className="h-5 w-5" /> },
  { type: "email", label: "Email", icon: <Mail className="h-5 w-5" /> },
  { type: "number", label: "Number", icon: <Hash className="h-5 w-5" /> },
  {
    type: "textarea",
    label: "Textarea",
    icon: <FileText className="h-5 w-5" />,
  },
  { type: "select", label: "Select", icon: <List className="h-5 w-5" /> },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  { type: "radio", label: "Radio", icon: <Circle className="h-5 w-5" /> },
  { type: "date", label: "Date", icon: <Calendar className="h-5 w-5" /> },
  { type: "file", label: "File Upload", icon: <Upload className="h-5 w-5" /> },
  { type: "rating", label: "Rating", icon: <Star className="h-5 w-5" /> },
  { type: "heading", label: "Heading", icon: <Heading className="h-5 w-5" /> },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: <AlignLeft className="h-5 w-5" />,
  },
];

export default function ElementsSidebar() {
  return (
    <div className="w-64 border-r overflow-y-auto">
      <div className="p-4 border-b bg-white">
        <h2 className="text-sm font-semibold text-gray-700">
          Form Elements
        </h2>
        <p className="text-xs text-gray-500 mt-1">Drag to add</p>
      </div>
      <div className="p-4 space-y-2">
        {elementTypes.map((item) => (
          <ElementButton
            key={item.type}
            type={item.type}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
}

