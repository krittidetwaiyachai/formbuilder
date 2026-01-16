"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { FieldType as FormElementType } from "@/types";
import { useFormStore } from "@/store/formStore";
import {
  Type,
  Mail,
  Hash,
  FileText,
  List,
  CheckSquare,
  Circle,
  Calendar,
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
  const { addField } = useFormStore();
  
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
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const needsOptions = (type: FormElementType): boolean => {
    return [FormElementType.DROPDOWN, FormElementType.RADIO, FormElementType.CHECKBOX].includes(type);
  };

  const getDefaultLabel = (type: FormElementType): string => {
    const labels: Record<FormElementType, string> = {
      [FormElementType.TEXT]: "Text Input",
      [FormElementType.EMAIL]: "Email",
      [FormElementType.PHONE]: "Phone",
      [FormElementType.NUMBER]: "Number",
      [FormElementType.TEXTAREA]: "Textarea",
      [FormElementType.DROPDOWN]: "Select",
      [FormElementType.CHECKBOX]: "Checkbox",
      [FormElementType.RADIO]: "Radio",
      [FormElementType.DATE]: "Date",
      [FormElementType.FILE]: "File Upload",
      [FormElementType.RATE]: "Rating",
      [FormElementType.HEADER]: "Heading",
      [FormElementType.PARAGRAPH]: "Paragraph",
      // Add missing keys if necessary or ensure all are covered
      [FormElementType.SUBMIT]: "Submit",
      [FormElementType.FULLNAME]: "Full Name",
      [FormElementType.ADDRESS]: "Address",
      [FormElementType.DIVIDER]: "Divider",
      [FormElementType.SECTION_COLLAPSE]: "Section",
      [FormElementType.PAGE_BREAK]: "Page Break",
      [FormElementType.GROUP]: "Group",
      [FormElementType.MATRIX]: "Matrix",
      [FormElementType.TABLE]: "Table",
      [FormElementType.TIME]: "Time",
    };
    return labels[type] || "Field";
  };

  const createNewElement = () => {
    return {
      id: `element-${Date.now()}`,
      type: type,
      label: getDefaultLabel(type),
      required: false,
      order: 0, // Default order, will be updated by store
      formId: "", // Default formId
      ...(needsOptions(type) && {
        options: [
          { id: "opt-1", label: "Option 1", value: "option-1" },
          { id: "opt-2", label: "Option 2", value: "option-2" },
        ],
      }),
      ...(type === FormElementType.RATE && { max: 5 }),
      ...(type === FormElementType.TEXTAREA && { rows: 4 }),
    };
  };

  const handleDoubleClick = () => {
    // Note: ID generation is handled by the store if undefined
    const { id, ...fieldData } = createNewElement();
    addField(fieldData);
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
  { type: FormElementType.TEXT, label: "Text Input", icon: <Type className="h-5 w-5" /> },
  { type: FormElementType.EMAIL, label: "Email", icon: <Mail className="h-5 w-5" /> },
  { type: FormElementType.NUMBER, label: "Number", icon: <Hash className="h-5 w-5" /> },
  {
    type: FormElementType.TEXTAREA,
    label: "Textarea",
    icon: <FileText className="h-5 w-5" />,
  },
  { type: FormElementType.DROPDOWN, label: "Select", icon: <List className="h-5 w-5" /> },
  {
    type: FormElementType.CHECKBOX,
    label: "Checkbox",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  { type: FormElementType.RADIO, label: "Radio", icon: <Circle className="h-5 w-5" /> },
  { type: FormElementType.DATE, label: "Date", icon: <Calendar className="h-5 w-5" /> },
  // { type: FormElementType.FILE, label: "File Upload", icon: <Upload className="h-5 w-5" /> }, // File upload missing in FieldType enum based on previous reads, checking...
  { type: FormElementType.RATE, label: "Rating", icon: <Star className="h-5 w-5" /> },
  { type: FormElementType.HEADER, label: "Heading", icon: <Heading className="h-5 w-5" /> },
  {
    type: FormElementType.PARAGRAPH,
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

