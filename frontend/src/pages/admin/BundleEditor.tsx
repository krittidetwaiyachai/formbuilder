import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { ArrowLeft, Check, Edit2, Redo2, Undo2, X } from "lucide-react";
import { FieldType } from "@/types";
import { generateUUID } from "@/utils/uuid";
import { useBundleEditorStore } from "@/store/bundleEditorStore";
import { useBundleSave } from "@/hooks/useBundleSave";
import BundleFieldsSidebar from "@/components/admin/BundleFieldsSidebar";
import BundleEditorCanvas from "@/components/admin/BundleEditorCanvas";
import BundleFieldProperties from "@/components/admin/BundleFieldProperties";
import { SmoothScrollProvider } from "@/contexts/SmoothScrollContext";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom-select";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function BundleEditor() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const titleEditRef = useRef<HTMLDivElement>(null);

  const {
    bundle,
    setBundle,
    addField,
    reset,
    undo,
    redo,
    history,
    updateBundleMeta,
    setSelectedFieldId,
  } = useBundleEditorStore();

  const { saving, hasUnsavedChanges, message, lastSaved } = useBundleSave();

  const formattedLastSaved = useMemo(() => {
    if (!lastSaved) {
      return null;
    }
    return lastSaved.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, [lastSaved]);

  const status = useMemo(() => {
    if (saving) {
      return "saving";
    }
    if (message?.type === "error") {
      return "error";
    }
    if (hasUnsavedChanges) {
      return "unsaved";
    }
    return "saved";
  }, [hasUnsavedChanges, message?.type, saving]);

  useEffect(() => {
    if (!isEditingTitle) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (titleEditRef.current && !titleEditRef.current.contains(event.target as Node)) {
        handleTitleCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditingTitle]);

  useEffect(() => {
    if (bundle) {
      setTitleValue(bundle.name);
    }
  }, [bundle?.name, bundle]);

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      updateBundleMeta({ name: titleValue.trim() });
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setTitleValue(bundle?.name || "");
    setIsEditingTitle(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [redo, undo]);

  useEffect(() => {
    const loadBundle = async () => {
      if (id === "new") {
        setBundle({
          id: "",
          name: t("admin.editor.untitled"),
          description: "",
          isPII: false,
          isActive: true,
          fields: [],
        });
        return;
      }

      if (!id) {
        return;
      }

      try {
        const response = await api.get(`/bundles/${id}`);
        const { sensitivityLevel: _removed, ...cleanData } = response.data;
        setBundle({
          ...cleanData,
          fields: response.data.fields || [],
        });
      } catch (error) {
        console.error("Failed to load bundle:", error);
        navigate("/admin/bundles");
      }
    };

    void loadBundle();
    return () => reset();
  }, [id, navigate, reset, setBundle, t]);

  const getLabelForType = (type: FieldType): string => {
    switch (type) {
      case FieldType.TEXT:
        return t("admin.editor.field.short_text");
      case FieldType.TEXTAREA:
        return t("admin.editor.field.long_text");
      case FieldType.NUMBER:
        return t("admin.editor.field.number");
      case FieldType.EMAIL:
        return t("admin.editor.field.email");
      case FieldType.PHONE:
        return t("admin.editor.field.phone");
      case FieldType.DATE:
        return t("admin.editor.field.date");
      case FieldType.TIME:
        return t("admin.editor.field.time");
      case FieldType.RADIO:
        return t("admin.editor.field.single_choice");
      case FieldType.CHECKBOX:
        return t("admin.editor.field.multiple_choice");
      case FieldType.DROPDOWN:
        return t("admin.editor.field.dropdown");
      case FieldType.HEADER:
        return t("admin.editor.field.header");
      case FieldType.PARAGRAPH:
        return t("admin.editor.field.paragraph");
      case FieldType.DIVIDER:
        return t("admin.editor.field.separator");
      case FieldType.PAGE_BREAK:
        return t("builder.fields.page_break");
      case FieldType.RATE:
        return t("admin.editor.field.rating");
      case FieldType.ADDRESS:
        return t("admin.editor.field.address");
      case FieldType.FULLNAME:
        return t("admin.editor.field.fullname");
      case FieldType.GROUP:
        return t("builder.fields.group");
      case FieldType.MATRIX:
        return t("admin.editor.field.matrix");
      case FieldType.TABLE:
        return t("admin.editor.field.table");
      default:
        return "Field";
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) {
      return;
    }
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const isFromSidebar = source.droppableId === "BUNDLE-SIDEBAR";
    const isToCanvas = destination.droppableId === "BUNDLE-CANVAS";
    const isFromCanvas = source.droppableId === "BUNDLE-CANVAS";

    if (isFromSidebar && isToCanvas) {
      const type = draggableId.replace("sidebar-", "") as FieldType;
      const needsOptions = [FieldType.DROPDOWN, FieldType.RADIO, FieldType.CHECKBOX].includes(type);
      const newField = {
        id: generateUUID(),
        type,
        label: getLabelForType(type),
        required: false,
        order: destination.index,
        ...(needsOptions && {
          options: {
            items: [
              { id: "opt-1", label: "Option 1", value: "option-1" },
              { id: "opt-2", label: "Option 2", value: "option-2" },
              { id: "opt-3", label: "Option 3", value: "option-3" },
            ],
          },
        }),
      };
      addField(newField, destination.index);
      return;
    }

    if (isFromCanvas && isToCanvas) {
      useBundleEditorStore.getState().reorderFields(source.index, destination.index);
    }
  };

  if (!bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-1 min-h-0 bg-gray-50 overflow-hidden relative">
          <div className="flex h-full">
            <BundleFieldsSidebar />
          </div>

          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="bg-white border-b border-gray-200">
              <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-black rounded-full transition-colors"
                    onClick={() => navigate("/admin/bundles")}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isEditingTitle ? (
                      <div ref={titleEditRef} className="flex items-center gap-2 w-full max-w-[300px]">
                        <input
                          type="text"
                          value={titleValue}
                          onChange={(event) => setTitleValue(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleTitleSave();
                            }
                            if (event.key === "Escape") {
                              handleTitleCancel();
                            }
                            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
                              event.stopPropagation();
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
                        onClick={() => setIsEditingTitle(true)}
                      >
                        <h1 className="text-lg md:text-xl font-bold text-black truncate">
                          {bundle?.name || t("admin.editor.untitled")}
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
                        status === "saving"
                          ? "bg-amber-50 text-amber-500"
                          : status === "error"
                          ? "bg-red-50 text-red-600"
                          : status === "unsaved"
                          ? "bg-zinc-100 text-zinc-500"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {status === "saving" || status === "unsaved" ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
                      ) : status === "error" ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    <span className="hidden md:inline text-xs text-gray-500 ml-2 whitespace-nowrap transition-colors duration-300">
                      {status === "saving" ? (
                        t("builder_header.saving")
                      ) : status === "error" ? (
                        t("builder_header.save_failed")
                      ) : status === "unsaved" ? (
                        t("builder_header.not_saved")
                      ) : (
                        <span>
                          {t("builder_header.all_saved")}
                          {formattedLastSaved ? ` ${formattedLastSaved}` : ""}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />

                  <div className="hidden md:flex items-center gap-1">
                    <button
                      onClick={undo}
                      disabled={history.past.length === 0}
                      className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 transition-colors"
                      title={t("admin.editor.undo_shortcut")}
                    >
                      <Undo2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={redo}
                      disabled={history.future.length === 0}
                      className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30 transition-colors"
                      title={t("admin.editor.redo_shortcut")}
                    >
                      <Redo2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="h-6 w-px bg-gray-200 mx-1" />

                  <Select
                    value={bundle?.isActive ? "published" : "draft"}
                    onValueChange={(value) => updateBundleMeta({ isActive: value === "published" })}
                  >
                    <SelectTrigger className="h-9 w-[130px] bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span>{t("admin.editor.status_draft")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="published">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>{t("admin.editor.status_published")}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex-1 flex min-h-0 overflow-hidden bg-white">
              <div className="flex-1 flex flex-col relative min-w-0 min-h-0 bg-white">
                <SmoothScrollProvider targetId="bundle-canvas-scroll-container">
                  <div
                    id="bundle-canvas-scroll-container"
                    className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 pt-0 pb-0 scrollbar-hide"
                    onMouseDown={(event) => {
                      const target = event.target as HTMLElement;
                      if (
                        target.closest("[data-top-level-field-id]") ||
                        target.closest("[data-field-id]") ||
                        target.closest(
                          "input, textarea, select, button, a, [contenteditable='true'], [data-rfd-draggable-id]"
                        )
                      ) {
                        return;
                      }
                      setSelectedFieldId(null);
                    }}
                    onTouchStart={(event) => {
                      const target = event.target as HTMLElement;
                      if (
                        target.closest("[data-top-level-field-id]") ||
                        target.closest("[data-field-id]") ||
                        target.closest(
                          "input, textarea, select, button, a, [contenteditable='true'], [data-rfd-draggable-id]"
                        )
                      ) {
                        return;
                      }
                      setSelectedFieldId(null);
                    }}
                  >
                    <BundleEditorCanvas />
                  </div>
                </SmoothScrollProvider>
              </div>
              <div className="hidden lg:flex">
                <BundleFieldProperties />
              </div>
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
