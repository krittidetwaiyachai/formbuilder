import type { ComponentProps } from "react";
import { useBundleEditorStore } from "@/store/bundleEditorStore";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FieldType } from "@/types";
import type { Field } from "@/types";

import { DateProperties } from "@/components/field-properties/advanced/DateProperties";
import { FullNameProperties } from "@/components/field-properties/text/FullNameProperties";
import { EmailProperties } from "@/components/field-properties/text/EmailProperties";
import { AddressProperties } from "@/components/field-properties/advanced/AddressProperties";
import { PhoneProperties } from "@/components/field-properties/text/PhoneProperties";
import { ShortTextProperties } from "@/components/field-properties/text/ShortTextProperties";
import { LongTextProperties } from "@/components/field-properties/text/LongTextProperties";
import { ParagraphProperties } from "@/components/field-properties/text/ParagraphProperties";
import { DropdownProperties } from "@/components/field-properties/choice/DropdownProperties";
import { RadioProperties } from "@/components/field-properties/choice/RadioProperties";
import { CheckboxProperties } from "@/components/field-properties/choice/CheckboxProperties";
import { NumberProperties } from "@/components/field-properties/text/NumberProperties";
import { TimeProperties } from "@/components/field-properties/advanced/TimeProperties";
import { SubmitProperties } from "@/components/field-properties/advanced/SubmitProperties";
import { HeaderProperties } from "@/components/field-properties/advanced/HeaderProperties";
import { RateProperties } from "@/components/field-properties/advanced/RateProperties";
import { MatrixProperties } from "@/components/field-properties/advanced/MatrixProperties";
import { TableProperties } from "@/components/field-properties/advanced/TableProperties";

const COLOR_OPTIONS = [
  { label: "Gray", value: "gray", bg: "bg-gray-100", text: "text-gray-600" },
  { label: "Blue", value: "blue", bg: "bg-blue-100", text: "text-blue-600" },
  {
    label: "Purple",
    value: "purple",
    bg: "bg-purple-100",
    text: "text-purple-600",
  },
  {
    label: "Amber",
    value: "amber",
    bg: "bg-amber-100",
    text: "text-amber-600",
  },
  {
    label: "Emerald",
    value: "emerald",
    bg: "bg-emerald-100",
    text: "text-emerald-600",
  },
  { label: "Pink", value: "pink", bg: "bg-pink-100", text: "text-pink-600" },
  { label: "Rose", value: "rose", bg: "bg-rose-100", text: "text-rose-600" },
];

const ICON_OPTIONS = [
  { label: "Layer", value: "Layers" },
  { label: "User", value: "User" },
  { label: "Work", value: "Briefcase" },
  { label: "Event", value: "CalendarCheck" },
  { label: "Message", value: "MessageSquare" },
  { label: "Share", value: "Share2" },
  { label: "Education", value: "GraduationCap" },
  { label: "Star", value: "Star" },
  { label: "Secure", value: "Lock" },
  { label: "Home", value: "Home" },
  { label: "Heart", value: "Heart" },
  { label: "Shopping", value: "ShoppingCart" },
  { label: "Mail", value: "Mail" },
  { label: "Phone", value: "Phone" },
  { label: "Location", value: "MapPin" },
  { label: "File", value: "FileText" },
  { label: "Folder", value: "Folder" },
  { label: "Settings", value: "SettingsIcon" },
  { label: "Search", value: "Search" },
  { label: "Camera", value: "Camera" },
  { label: "Music", value: "Music" },
  { label: "Video", value: "Video" },
  { label: "Globe", value: "Globe" },
  { label: "Zap", value: "Zap" },
  { label: "Award", value: "Award" },
  { label: "Target", value: "Target" },
  { label: "Code", value: "Code" },
  { label: "Rocket", value: "Rocket" },
  { label: "Coffee", value: "Coffee" },
  { label: "Gift", value: "Gift" },
  { label: "Truck", value: "Truck" },
  { label: "Headphones", value: "Headphones" },
  { label: "Gamepad", value: "Gamepad2" },
  { label: "Lightbulb", value: "Lightbulb" },
  { label: "Clipboard", value: "ClipboardList" },
  { label: "Bell", value: "Bell" },
  { label: "Bookmark", value: "Bookmark" },
  { label: "Calendar", value: "Calendar" },
  { label: "Clock", value: "Clock" },
  { label: "Cloud", value: "Cloud" },
  { label: "Compass", value: "Compass" },
  { label: "Crown", value: "Crown" },
  { label: "Database", value: "Database" },
  { label: "Diamond", value: "Diamond" },
  { label: "Download", value: "Download" },
  { label: "Edit", value: "Edit" },
  { label: "Eye", value: "Eye" },
  { label: "Flag", value: "Flag" },
  { label: "Flame", value: "Flame" },
  { label: "Image", value: "Image" },
  { label: "Inbox", value: "Inbox" },
  { label: "Key", value: "Key" },
  { label: "Link", value: "Link" },
  { label: "Mic", value: "Mic" },
  { label: "Monitor", value: "Monitor" },
  { label: "Package", value: "Package" },
  { label: "Palette", value: "Palette" },
  { label: "Paperclip", value: "Paperclip" },
  { label: "Pencil", value: "Pencil" },
  { label: "Percent", value: "Percent" },
  { label: "Plane", value: "Plane" },
  { label: "Play", value: "Play" },
  { label: "Plug", value: "Plug" },
  { label: "Printer", value: "Printer" },
  { label: "QRCode", value: "QrCode" },
  { label: "Shield", value: "Shield" },
  { label: "Sparkles", value: "Sparkles" },
  { label: "Sun", value: "Sun" },
  { label: "Tag", value: "Tag" },
  { label: "ThumbsUp", value: "ThumbsUp" },
  { label: "Timer", value: "Timer" },
  { label: "Trash", value: "Trash2" },
  { label: "Trophy", value: "Trophy" },
  { label: "Umbrella", value: "Umbrella" },
  { label: "Upload", value: "Upload" },
  { label: "Users", value: "Users" },
  { label: "Wallet", value: "Wallet" },
  { label: "Watch", value: "Watch" },
  { label: "Wifi", value: "Wifi" },
  { label: "Wrench", value: "Wrench" },
];

import {
  Layers,
  User,
  Briefcase,
  CalendarCheck,
  MessageSquare,
  Share2,
  GraduationCap,
  Star,
  Lock,
  Home,
  Heart,
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  FileText,
  Folder,
  Settings as SettingsIcon,
  Search,
  Camera,
  Music,
  Video,
  Globe,
  Zap,
  Award,
  Target,
  Code,
  Rocket,
  Coffee,
  Gift,
  Truck,
  Headphones,
  Gamepad2,
  Lightbulb,
  ClipboardList,
  Bell,
  Bookmark,
  Calendar,
  Clock,
  Cloud,
  Compass,
  Crown,
  Database,
  Diamond,
  Download,
  Edit,
  Eye,
  Flag,
  Flame,
  Image,
  Inbox,
  Key,
  Link,
  Mic,
  Monitor,
  Package,
  Palette,
  Paperclip,
  Pencil,
  Percent,
  Plane,
  Play,
  Plug,
  Printer,
  QrCode,
  Shield,
  Sparkles,
  Sun,
  Tag,
  ThumbsUp,
  Timer,
  Trash2,
  Trophy,
  Umbrella,
  Upload,
  Users,
  Wallet,
  Watch,
  Wifi,
  Wrench,
} from "lucide-react";

const IconMap: Record<string, React.ElementType> = {
  Layers,
  User,
  Briefcase,
  CalendarCheck,
  MessageSquare,
  Share2,
  GraduationCap,
  Star,
  Lock,
  Home,
  Heart,
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  FileText,
  Folder,
  SettingsIcon,
  Search,
  Camera,
  Music,
  Video,
  Globe,
  Zap,
  Award,
  Target,
  Code,
  Rocket,
  Coffee,
  Gift,
  Truck,
  Headphones,
  Gamepad2,
  Lightbulb,
  ClipboardList,
  Bell,
  Bookmark,
  Calendar,
  Clock,
  Cloud,
  Compass,
  Crown,
  Database,
  Diamond,
  Download,
  Edit,
  Eye,
  Flag,
  Flame,
  Image,
  Inbox,
  Key,
  Link,
  Mic,
  Monitor,
  Package,
  Palette,
  Paperclip,
  Pencil,
  Percent,
  Plane,
  Play,
  Plug,
  Printer,
  QrCode,
  Shield,
  Sparkles,
  Sun,
  Tag,
  ThumbsUp,
  Timer,
  Trash2,
  Trophy,
  Umbrella,
  Upload,
  Users,
  Wallet,
  Watch,
  Wifi,
  Wrench,
};

import type { Bundle } from "@/store/bundleEditorStore";

function BundleSettings({
  bundle,
  updateBundleMeta,
}: {
  bundle: Bundle;
  updateBundleMeta: (meta: Partial<Bundle>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Bundle Name
          </label>
          <input
            type="text"
            value={bundle.name}
            onChange={(e) => updateBundleMeta({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Description
          </label>
          <textarea
            value={bundle.description || ""}
            onChange={(e) => updateBundleMeta({ description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white resize-none"
          />
        </div>

        {}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Appearance
          </h4>

          {}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Icon
            </label>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-100 p-2">
              <div className="grid grid-cols-6 gap-1.5">
                {ICON_OPTIONS.map((iconOpt) => {
                  const IconComponent = IconMap[iconOpt.value] || Layers;
                  const isSelected =
                    (bundle.options?.icon || "Layers") === iconOpt.value;
                  return (
                    <button
                      key={iconOpt.value}
                      onClick={() =>
                        updateBundleMeta({
                          options: { ...bundle.options, icon: iconOpt.value },
                        })
                      }
                      className={`
                                                w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
                                                ${
                                                  isSelected
                                                    ? "bg-black text-white shadow-md scale-105"
                                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                                }
                                            `}
                      title={iconOpt.label}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((color) => {
                const isSelected =
                  (bundle.options?.color || "text-gray-600") === color.text;
                return (
                  <button
                    key={color.value}
                    onClick={() =>
                      updateBundleMeta({
                        options: {
                          ...bundle.options,
                          color: color.text,
                          bg: color.bg,
                        },
                      })
                    }
                    className={`
                                             group relative w-full h-9 rounded-md border flex items-center justify-center transition-all
                                             ${isSelected ? "border-black ring-1 ring-black/10" : "border-gray-200 hover:border-gray-300"}
                                         `}
                  >
                    <div
                      className={`w-4 h-4 rounded-full ${color.bg} border border-black/5`}
                    ></div>
                    <span className="ml-2 text-xs text-gray-600 font-medium capitalize">
                      {color.label}
                    </span>
                    {isSelected && (
                      <div className="absolute inset-0 rounded-md ring-2 ring-black pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BundleFieldProperties() {
  const { t } = useTranslation();
  const { bundle, selectedFieldId, updateField, addField, updateBundleMeta } =
    useBundleEditorStore();
  const selectedField = bundle?.fields.find((f) => f.id === selectedFieldId);

  const handleDuplicate = (fieldData: Omit<Field, "id">) => {
    const { order, formId, ...rest } = fieldData;
    addField(rest);
  };

  if (!bundle) return null;

  return (
    <div className="w-[320px] bg-white border-l border-gray-200 flex flex-col h-full z-20 shadow-[-2px_0_15px_-3px_rgba(0,0,0,0.05)]">
      {}
      <div className="border-b border-gray-100 bg-white px-4 py-3 sticky top-0 z-10 shrink-0 h-[57px] flex items-center">
        <div className="flex items-center gap-2 text-gray-800 font-semibold">
          <Settings className="w-4 h-4" />
          <span>
            {selectedField ? t("builder.tabs.properties") : "Bundle Settings"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 content-container">
        {!selectedField ? (
          <BundleSettings bundle={bundle} updateBundleMeta={updateBundleMeta} />
        ) : (
          <div className="space-y-4">
            {}
            {(() => {
              const fieldProps = {
                field: { ...selectedField, formId: "bundle-preview" },
                updateField: updateField,
                duplicatesField: handleDuplicate,
              };

              switch (selectedField.type) {
                case FieldType.FULLNAME:
                  return (
                    <FullNameProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof FullNameProperties
                      >)}
                    />
                  );
                case FieldType.EMAIL:
                  return (
                    <EmailProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof EmailProperties
                      >)}
                    />
                  );
                case FieldType.ADDRESS:
                  return (
                    <AddressProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof AddressProperties
                      >)}
                    />
                  );
                case FieldType.PHONE:
                  return (
                    <PhoneProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof PhoneProperties
                      >)}
                    />
                  );
                case FieldType.DATE:
                  return (
                    <DateProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof DateProperties
                      >)}
                    />
                  );
                case FieldType.HEADER:
                  return (
                    <HeaderProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof HeaderProperties
                      >)}
                    />
                  );
                case FieldType.TEXT:
                  return (
                    <ShortTextProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof ShortTextProperties
                      >)}
                    />
                  );
                case FieldType.TEXTAREA:
                  return (
                    <LongTextProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof LongTextProperties
                      >)}
                    />
                  );
                case FieldType.PARAGRAPH:
                  return (
                    <ParagraphProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof ParagraphProperties
                      >)}
                    />
                  );
                case FieldType.DROPDOWN:
                  return (
                    <DropdownProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof DropdownProperties
                      >)}
                    />
                  );
                case FieldType.RADIO:
                  return (
                    <RadioProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof RadioProperties
                      >)}
                    />
                  );
                case FieldType.CHECKBOX:
                  return (
                    <CheckboxProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof CheckboxProperties
                      >)}
                    />
                  );
                case FieldType.NUMBER:
                  return (
                    <NumberProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof NumberProperties
                      >)}
                    />
                  );
                case FieldType.TIME:
                  return (
                    <TimeProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof TimeProperties
                      >)}
                    />
                  );
                case FieldType.SUBMIT:
                  return (
                    <SubmitProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof SubmitProperties
                      >)}
                    />
                  );
                case FieldType.RATE:
                  return (
                    <RateProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof RateProperties
                      >)}
                    />
                  );
                case FieldType.MATRIX:
                  return (
                    <MatrixProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof MatrixProperties
                      >)}
                    />
                  );
                case FieldType.TABLE:
                  return (
                    <TableProperties
                      {...(fieldProps as unknown as ComponentProps<
                        typeof TableProperties
                      >)}
                    />
                  );
                default:
                  return (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Properties for {selectedField.type} not available.
                    </div>
                  );
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
