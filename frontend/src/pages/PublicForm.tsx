import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import type { Form } from "@/types";
import { FileQuestion } from "lucide-react";
import PublicFormRenderer from "@/components/public-form/PublicFormRenderer";
import Loader from "@/components/common/Loader";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export default function PublicForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useSmoothScroll(null, { enabled: !loading });

  useEffect(() => {
    if (form?.settings?.backgroundColor) {
      const bgColor = form.settings.backgroundColor;
      document.documentElement.style.backgroundColor = bgColor;
      document.body.style.backgroundColor = bgColor;
    }

    return () => {
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
    };
  }, [form?.settings?.backgroundColor]);

  useEffect(() => {
    if (id) {
      void loadForm();
    }
  }, [id]);

  const generateFingerprint = (): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("fingerprint", 2, 2);
    }

    const canvasData = canvas.toDataURL();
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvasData.slice(0, 50)
    ].join("|");

    let hash = 0;

    for (let i = 0; i < data.length; i += 1) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }

    return Math.abs(hash).toString(36);
  };

  const loadForm = async () => {
    try {
      const fingerprint = generateFingerprint();
      const ua = encodeURIComponent(navigator.userAgent);
      const response = await api.get(
        `/forms/${id}/public?fingerprint=${fingerprint}&ua=${ua}`
      );
      setForm(response.data.form);
    } catch (error) {
      console.error("Failed to load form:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader className="mx-auto mb-4" />
          <p className="font-medium text-gray-500">{t("public.loading")}</p>
        </motion.div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <FileQuestion className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            {t("public.form_not_found_title")}
          </h2>
          <p className="text-gray-600">{t("public.form_not_found_desc")}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-0 transition-colors duration-500"
        style={{
          background:
            form.settings?.backgroundType === "gradient"
              ? form.settings.backgroundColor
              : undefined,
          backgroundColor:
            form.settings?.backgroundType !== "gradient"
              ? form.settings?.backgroundColor || "#ffffff"
              : undefined,
          backgroundImage:
            form.settings?.backgroundType === "image" &&
            form.settings?.backgroundImage
              ? `url(${form.settings.backgroundImage})`
              : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      <div
        id="public-form-scroll-container"
        className="relative z-10 min-h-screen w-full overflow-x-hidden overflow-y-auto"
        style={{ fontFamily: form.settings?.fontFamily || "inherit" }}
      >
        <PublicFormRenderer
          form={form}
          loading={loading}
          verificationRedirect={{
            bindingId: searchParams.get("bindingId"),
            token: searchParams.get("token")
          }}
        />
      </div>
    </>
  );
}
