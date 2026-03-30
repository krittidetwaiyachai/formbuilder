import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  X,
  Edit2,
  Undo2,
  Redo2,
  Eye,
  Share2,
  Copy,
  ExternalLink,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FormStatus } from "@/types";
import type { Form } from "@/types";
import { useFormStore } from "@/store/formStore";
import { useAuthStore } from "@/store/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import CollaboratorListModal from "@/components/dashboard/CollaboratorListModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/custom-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";
import UserAvatar from "@/components/common/UserAvatar";

interface FormBuilderHeaderProps {
  currentForm: Form | null;
  saving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  message: { type: "success" | "error"; text: string } | null;
  handleSave: (isAutoSave: boolean) => Promise<void>;
  updateForm: (updates: Partial<Form>) => void;
}

function fallbackCopyTextToClipboard(text: string, onSuccess?: () => void) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful) {
      onSuccess?.();
    } else {
      console.error("Fallback: unable to copy");
    }
  } catch (err) {
    console.error("Fallback: oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

const QR_DISPLAY_SIZE = 200;
const QR_DISPLAY_PADDING = 10;
const QR_IMAGE_PADDING = 10;

export default function FormBuilderHeader({
  currentForm,
  saving,
  hasUnsavedChanges,
  lastSaved,
  handleSave,
  updateForm
}: FormBuilderHeaderProps) {
  const navigate = useNavigate();
  const { undo, redo, historyIndex, history } = useFormStore();
  const { user: currentUser } = useAuthStore();
  const { t } = useTranslation();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isQrCopied, setIsQrCopied] = useState(false);
  const titleEditRef = React.useRef<HTMLDivElement>(null);
  const qrCodeWrapperRef = React.useRef<HTMLDivElement>(null);
  const shareUrl = currentForm
    ? `${window.location.origin}/forms/${currentForm.id}/view`
    : "";

  const handleCopyShareUrl = () => {
    if (!shareUrl) {
      return;
    }

    const handleSuccess = () => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(handleSuccess)
        .catch(() => {
          fallbackCopyTextToClipboard(shareUrl, handleSuccess);
        });
    } else {
      fallbackCopyTextToClipboard(shareUrl, handleSuccess);
    }
  };

  const handleCopyQrImage = async () => {
    const svg = qrCodeWrapperRef.current?.querySelector("svg");

    if (
      !svg ||
      !navigator.clipboard ||
      typeof ClipboardItem === "undefined"
    ) {
      return;
    }

    const exportSvg = svg.cloneNode(true) as SVGSVGElement;
    exportSvg.style.width = `${QR_DISPLAY_SIZE}px`;
    exportSvg.style.height = `${QR_DISPLAY_SIZE}px`;
    exportSvg.style.maxWidth = "none";
    exportSvg.style.padding = "0";
    exportSvg.style.display = "block";
    exportSvg.setAttribute("width", String(QR_DISPLAY_SIZE));
    exportSvg.setAttribute("height", String(QR_DISPLAY_SIZE));

    const serializedSvg = new XMLSerializer().serializeToString(exportSvg);
    const svgMarkup = serializedSvg.includes("xmlns=")
      ? serializedSvg
      : serializedSvg.replace(
          "<svg",
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
    const svgBlob = new Blob([svgMarkup], {
      type: "image/svg+xml;charset=utf-8"
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = svgUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = QR_DISPLAY_SIZE + QR_IMAGE_PADDING * 2;
      canvas.height = QR_DISPLAY_SIZE + QR_IMAGE_PADDING * 2;
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        QR_IMAGE_PADDING,
        QR_IMAGE_PADDING,
        QR_DISPLAY_SIZE,
        QR_DISPLAY_SIZE
      );

      const pngBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!pngBlob) {
        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": pngBlob
        })
      ]);

      setIsQrCopied(true);
      setTimeout(() => setIsQrCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy QR image", error);
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  };

  useEffect(() => {
    if (!isEditingTitle) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        titleEditRef.current &&
        !titleEditRef.current.contains(event.target as Node)
      ) {
        handleTitleCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditingTitle]);

  useEffect(() => {
    if (currentForm) {
      setTitleValue(currentForm.title);
    }
  }, [currentForm?.title]);

  const formattedLastSaved = lastSaved
    ? lastSaved.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })
    : null;
  const showSavingState = saving || hasUnsavedChanges;

  const handleTitleEdit = () => {
    if (!currentForm) return;
    setTitleValue(currentForm.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      updateForm({ title: titleValue.trim() });
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setTitleValue(currentForm?.title || "");
    setIsEditingTitle(false);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isEditingTitle ? (
              <div
                ref={titleEditRef}
                className="flex items-center gap-2 w-full max-w-[300px]"
              >
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSave();
                    if (e.key === "Escape") handleTitleCancel();
                    if ((e.ctrlKey || e.metaKey) && e.key === "a") {
                      e.stopPropagation();
                    }
                  }}
                  className="text-lg md:text-xl font-bold text-black border-b-2 border-black px-1 py-0.5 w-full bg-transparent focus:outline-none rounded-none"
                  autoFocus
                />
                <button onClick={handleTitleSave} className="text-green-600 p-1">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={handleTitleCancel} className="text-red-500 p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 min-w-0 group cursor-pointer"
                onClick={handleTitleEdit}
              >
                <h1 className="text-lg md:text-xl font-bold text-black truncate">
                  {currentForm?.title || t("builder.header.untitled_form")}
                </h1>
                <Edit2 className="h-3.5 w-3.5 text-gray-400 group-hover:text-black opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center px-1 py-1 min-w-[44px] md:min-w-[230px]">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                showSavingState ? "bg-amber-50 text-amber-500" : "bg-green-50 text-green-600"
              }`}
            >
              {showSavingState ? (
                <div className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </div>
            <span className="hidden md:inline text-xs text-gray-500 ml-2 whitespace-nowrap transition-colors duration-300">
              {showSavingState ? (
                t("builder_header.saving")
              ) : (
                <span>
                  {t("builder_header.all_saved")}
                  {formattedLastSaved && ` ${formattedLastSaved}`}
                </span>
              )}
            </span>
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />

          <div className="hidden md:flex items-center gap-2 group">
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 transition-colors"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 transition-colors"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>
            <div className="h-6 w-px bg-gray-200 mx-1" />

            {currentUser &&
              (() => {
                const collaborators = currentForm?.collaborators || [];
                const allUsers = [currentUser, ...collaborators];
                const visibleUsers = allUsers.slice(0, 3);

                return (
                  <div className="flex items-center">
                    <div
                      className="flex -space-x-3 overflow-hidden items-center cursor-pointer"
                      onClick={() => setIsCollaboratorModalOpen(true)}
                      title={t("builder.header.manage_access")}
                    >
                      {visibleUsers.map((user, index) => (
                        <div
                          key={user?.id || index}
                          className="relative transition-transform hover:scale-110 hover:z-20"
                          style={{ zIndex: index }}
                        >
                          <UserAvatar
                            user={user}
                            className="h-8 w-8 ring-2 ring-white shadow-sm"
                            title={user?.email || "User"}
                          />
                        </div>
                      ))}
                      <div className="relative z-10 flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white shadow-sm text-gray-500 hover:bg-gray-200 transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>

          <div className="flex items-center gap-2">
            {currentForm && (
              <Select
                value={currentForm.status}
                onValueChange={(value: FormStatus) => updateForm({ status: value })}
              >
                <SelectTrigger className="h-9 w-[110px] md:w-[130px] bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FormStatus.DRAFT}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span>{t("common.status.draft")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={FormStatus.PUBLISHED}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>{t("common.status.published")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={FormStatus.ARCHIVED}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      <span>{t("common.status.archived")}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            <button
              onClick={() => window.open(`/forms/${currentForm?.id}/preview`, "_blank")}
              className="h-9 w-9 md:w-auto md:px-4 md:py-2 flex items-center justify-center gap-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all bg-white text-gray-700 font-medium"
              title={t("builder_header.preview")}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden md:inline">{t("builder_header.preview")}</span>
            </button>

            <button
              onClick={() => {
                handleSave(true);
                setIsShareOpen(true);
              }}
              className="h-9 w-9 md:w-auto md:px-4 md:py-2 flex items-center justify-center gap-2 rounded-lg bg-black hover:bg-zinc-800 text-white font-medium shadow-sm transition-all"
              title={t("builder_header.share")}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden md:inline">{t("builder_header.share")}</span>
            </button>
          </div>
        </div>

        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
          <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[560px] rounded-[28px] border border-zinc-200 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:p-7">
            <button
              className="absolute right-4 top-4 rounded-md p-1 text-zinc-500 opacity-80 ring-offset-background transition-all hover:bg-zinc-100 hover:text-zinc-900 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              onClick={() => setIsShareOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t("builder.header.close")}</span>
            </button>
            <DialogHeader className="space-y-2 pr-10 text-left">
              <DialogTitle className="text-[30px] font-semibold tracking-tight text-zinc-950 max-sm:text-[24px]">
                {t("builder_header.share_title")}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-zinc-600">
                {t("builder_header.share_description")}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 space-y-5">
              <div className="space-y-3">
                <div className="text-sm font-medium text-zinc-500">
                {t("builder_header.share_public_link")}
                </div>
                <Input
                  readOnly
                  value={shareUrl}
                  className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 px-4 text-[15px] text-zinc-700"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl border-zinc-200 px-4 text-zinc-700 hover:bg-zinc-50"
                    onClick={() => window.open(shareUrl, "_blank")}
                    title={t("builder.header.open_new_tab")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span>{t("builder.header.open_new_tab")}</span>
                  </Button>
                  <div className="relative">
                    <div
                      className={`absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg transition-all duration-200 pointer-events-none whitespace-nowrap ${
                        isCopied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                      }`}
                    >
                      {t("common.copied")}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className={`h-11 w-full rounded-xl px-4 transition-colors ${
                        isCopied
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                          : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      }`}
                      onClick={handleCopyShareUrl}
                    >
                      {isCopied ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      <span>{t("builder.header.copy")}</span>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="border-t border-zinc-100 pt-5">
                <div className="mb-4 text-center text-sm font-medium text-zinc-500">
                  {t("builder_header.share_qr_access")}
                </div>
                <div className="flex justify-center py-1">
                  <div
                    ref={qrCodeWrapperRef}
                    className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-4"
                  >
                    <QRCode
                      value={shareUrl}
                      size={QR_DISPLAY_SIZE}
                      bgColor="#FFFFFF"
                      style={{
                        display: "block",
                        height: "auto",
                        width: "min(200px, calc(100vw - 8rem))",
                        background: "#FFFFFF",
                        padding: `${QR_DISPLAY_PADDING}px`,
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-center">
                  <div className="relative w-full sm:w-auto">
                    <div
                      className={`absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg transition-all duration-200 pointer-events-none whitespace-nowrap ${
                        isQrCopied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                      }`}
                    >
                      {t("common.copied")}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className={`h-11 w-full gap-2 rounded-xl border-zinc-200 px-4 sm:w-auto ${
                        isQrCopied
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                          : "text-zinc-700 hover:bg-zinc-50"
                      }`}
                      onClick={handleCopyQrImage}
                    >
                      {isQrCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{t("builder.header.copy_qr_image")}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {currentForm && (
          <CollaboratorListModal
            isOpen={isCollaboratorModalOpen}
            onClose={() => setIsCollaboratorModalOpen(false)}
            formId={currentForm.id}
            formTitle={currentForm.title}
            collaborators={[
              ...(currentForm.createdBy ? [currentForm.createdBy] : []),
              ...(currentForm.collaborators || [])
            ]}
            onUpdate={() => {}}
          />
        )}
      </div>
    </div>
  );
}
