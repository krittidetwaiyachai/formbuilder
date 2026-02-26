import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFormStore } from "@/store/formStore";
import DeviceFrame from "@/components/form-preview/DeviceFrame";
import { Monitor, Tablet, Smartphone, RefreshCw } from "lucide-react";
import PublicFormRenderer from "@/components/public-form/PublicFormRenderer";
import api from "@/lib/api";
import type { Form } from "@/types";

import { useTranslation } from "react-i18next";

type DeviceType = "desktop" | "tablet" | "mobile";

export default function FormPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { currentForm } = useFormStore();
  const [device, setDevice] = useState<DeviceType>("desktop");

  const [loading, setLoading] = useState(false);
  const [fetchedForm, setFetchedForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeForm =
    currentForm && currentForm.id === id ? currentForm : fetchedForm;

  useEffect(() => {
    if (id && (!currentForm || currentForm.id !== id)) {
      const fetchForm = async () => {
        try {

          setLoading(true);
          setError(null);

          const response = await api.get(`/forms/${id}`);
          setFetchedForm(response.data.form || response.data);
        } catch (err) {
          console.error("Error fetching form for preview:", err);
          setError("Failed to load form");
        } finally {
          setLoading(false);
        }
      };

      fetchForm();
    }
  }, [id, currentForm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <RefreshCw className="animate-spin w-6 h-6" />
          <p>{t("public.loading")}</p>
        </div>
      </div>
    );
  }

  if (!activeForm) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-2">
            {t("public.form_not_found_title")}
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 select-none">
      {}
      <div className="bg-white/40 backdrop-blur-md border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                device === "desktop"
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("public.preview.desktop", "Desktop")}
              </span>
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                device === "tablet"
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Tablet className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("public.preview.tablet", "Tablet")}
              </span>
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                device === "mobile"
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("public.preview.mobile", "Mobile")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        <DeviceFrame device={device}>
          <div
            className="min-h-full w-full"
            style={{
              background: activeForm.settings?.backgroundColor || "#ffffff",
            }}
          >
            <PublicFormRenderer
              form={activeForm}
              isPreview={true}
              viewMode={device}
            />
          </div>
        </DeviceFrame>
      </div>
    </div>
  );
}
