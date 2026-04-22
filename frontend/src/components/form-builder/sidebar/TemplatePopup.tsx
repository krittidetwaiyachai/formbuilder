import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "@/lib/api";
import { useFormStore } from "@/store/formStore";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Layers,
  MapPin,
  Briefcase,
  CalendarCheck,
  MessageSquare,
  Share2,
  GraduationCap,
  Star,
  Lock,
  User } from
"lucide-react";
import { FieldType } from "@/types";
import type { Field } from "@/types";
import Loader from "@/components/common/Loader";
const IconMap: Record<string, React.ElementType> = {
  User,
  MapPin,
  Briefcase,
  CalendarCheck,
  MessageSquare,
  Share2,
  GraduationCap,
  Star,
  Lock
};
interface BundleField {
  label?: string;
  type: FieldType;
  [key: string]: unknown;
}
interface Bundle {
  id: string;
  name: string;
  description?: string;
  fields: BundleField[];
  options?: {
    icon?: string;
    color?: string;
    bg?: string;
  };
}
export const TemplatePopup = ({ onClose }: {onClose: () => void;}) => {
  if (typeof document === "undefined") return null;
  const { t } = useTranslation();
  const { addBundle } = useFormStore();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await api.get("/bundles", {
          params: { isActive: true }
        });
        setBundles(response.data);
      } catch (error) {
        console.error("Failed to fetch bundles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);
  const handleAddBundle = (bundle: Bundle) => {
    const mappedBundle = {
      title: bundle.name,
      fields: bundle.fields as Array<
        Pick<Field, "type" | "label"> & Partial<Field>>
    };
    addBundle(mappedBundle);
    onClose();
  };
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">          <div>            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">              {t("builder.bundles.title")}            </h3>            <p className="text-sm text-gray-400 mt-1">              {t("builder.bundles.choose_template")}            </p>          </div>          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">            <span className="text-xl leading-none">&times;</span>          </button>        </div>        <div className="p-6 overflow-y-auto flex-1">          {loading ?
          <div className="flex justify-center items-center h-48">            <Loader size={32} />          </div> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">            {bundles.map((bundle) => {
              const IconComponent =
              bundle.options?.icon && IconMap[bundle.options.icon] ?
              IconMap[bundle.options.icon] :
              Layers;
              const bundleColor = bundle.options?.color || "text-gray-600";
              const bundleBg = bundle.options?.bg || "bg-gray-50";
              return (
                <button
                  key={bundle.id}
                  onClick={() => handleAddBundle(bundle)}
                  className="group relative p-5 text-left bg-white border border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition-all duration-200">                  <h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">                    {bundle.name}                  </h4>                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed group-hover:hidden">                    {bundle.description}                  </p>                  <div className="hidden group-hover:block mt-2">                    <div className="flex flex-wrap gap-1">                      {bundle.fields?.slice(0, 4).map((f, i) =>
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-medium">                        {f.label ? f.label.replace(/<[^>]*>/g, "") : ""}                      </span>
                      )}                      {bundle.fields?.length > 4 &&
                      <span className="px-1.5 py-0.5 text-[9px] text-gray-400">                        {t("builder.bundles.more_count", {
                          count: bundle.fields.length - 4
                        })}                      </span>
                      }                    </div>                  </div>                  <div className="mt-3 flex items-center gap-2 group-hover:hidden">                    <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-500">                      {t("builder.group.fields_count", {
                        count: bundle.fields?.length || 0
                      })}                    </span>                  </div>                  <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">                      <Plus
                        className="w-3.5 h-3.5 text-white"
                        strokeWidth={3} />                    </div>                  </div>                  <div
                    className={`absolute top-5 right-5 w-8 h-8 rounded-lg ${bundleBg} flex items-center justify-center group-hover:opacity-0 transition-opacity`}>                    <IconComponent className={`w-4 h-4 ${bundleColor}`} />                  </div>                </button>);
            })}          </div>
          }        </div>        <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50">          <p className="text-xs text-gray-400 text-center">            {t("builder.bundles.click_to_add")}          </p>        </div>      </div>    </div>,
    document.body
  );
};