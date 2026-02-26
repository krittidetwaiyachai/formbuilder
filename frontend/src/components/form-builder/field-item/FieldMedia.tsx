import React, { useState } from "react";
import { FieldType } from "@/types";
import type { Field } from "@/types";
import { Image, Video, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FieldMediaProps {
  field: Field;
  isSelected: boolean;
  isOverlay: boolean;
  isDragging: boolean;
  updateField: (id: string, updates: Partial<Field>) => void;
  deleteField: (id: string) => void;
}

export const FieldMedia: React.FC<FieldMediaProps> = ({
  field,
  isSelected,
  isOverlay,
  isDragging,
  updateField,
  deleteField,
}) => {
  const { t } = useTranslation();
  const [mediaInputMode, setMediaInputMode] = useState<
    "image" | "video" | null
  >(null);

  return (
    <>
      {isSelected && !isOverlay && !isDragging && (
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex items-center justify-end gap-1 pb-2 border-b border-gray-100">
            {field.type !== FieldType.GROUP && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaInputMode((prev) =>
                      prev === "image" ? null : "image",
                    );
                  }}
                  className={`p-2 rounded-full transition-colors ${mediaInputMode === "image" || field.imageUrl ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                  title={t("builder.media.insert_image")}
                >
                  <Image className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMediaInputMode((prev) =>
                      prev === "video" ? null : "video",
                    );
                  }}
                  className={`p-2 rounded-full transition-colors ${mediaInputMode === "video" || field.videoUrl ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                  title={t("builder.media.insert_video")}
                >
                  <Video className="h-4 w-4" />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteField(field.id);
              }}
              className="md:hidden p-2 rounded-full transition-colors text-gray-400 hover:bg-red-50 hover:text-red-600"
              title={t("common.delete_field")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {(mediaInputMode === "image" || mediaInputMode === "video") && (
            <div className="flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
              <input
                autoFocus
                type="text"
                placeholder={
                  mediaInputMode === "image"
                    ? t("builder.media.paste_image_url")
                    : t("builder.media.paste_youtube_url")
                }
                className="flex-1 text-sm border-b border-blue-500 focus:outline-none py-1 bg-transparent"
                defaultValue={
                  mediaInputMode === "image" ? field.imageUrl : field.videoUrl
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = e.currentTarget.value;
                    if (mediaInputMode === "image") {
                      updateField(field.id, { imageUrl: val });
                      if (val && !field.imageWidth)
                        updateField(field.id, { imageWidth: "100%" });
                    } else {
                      updateField(field.id, { videoUrl: val });
                    }
                    setMediaInputMode(null);
                  } else if (e.key === "Escape") {
                    setMediaInputMode(null);
                  }
                }}
                onBlur={(e) => {
                  const val = e.currentTarget.value;
                  if (mediaInputMode === "image") {
                    if (val !== field.imageUrl) {
                      updateField(field.id, { imageUrl: val });
                      if (val && !field.imageWidth)
                        updateField(field.id, { imageWidth: "100%" });
                    }
                  } else {
                    if (val !== field.videoUrl)
                      updateField(field.id, { videoUrl: val });
                  }
                  setMediaInputMode(null);
                }}
              />
              <button
                onClick={() => setMediaInputMode(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                {t("builder.media.cancel")}
              </button>
            </div>
          )}
        </div>
      )}

      {!isOverlay && !isDragging && (field.imageUrl || field.videoUrl) && (
        <div className="flex flex-col items-center gap-3 my-4">
          {field.imageUrl && (
            <div className="relative group/media">
              <img
                src={field.imageUrl}
                alt="Preview"
                className="rounded-lg object-contain bg-gray-50 max-h-64"
                style={{ maxWidth: field.imageWidth || "100%" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateField(field.id, { imageUrl: "", imageWidth: "" });
                }}
                className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover/media:opacity-100 transition-opacity"
                title={t("builder.media.remove_image")}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}

          {field.videoUrl &&
            (() => {
              const regExp =
                /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
              const match = field.videoUrl?.match(regExp);
              const videoId = match && match[2].length === 11 ? match[2] : null;

              if (videoId) {
                return (
                  <div className="relative group/media w-full max-w-md overflow-hidden rounded-xl bg-black/5 aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full rounded-xl"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateField(field.id, { videoUrl: "" });
                      }}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover/media:opacity-100 transition-opacity z-10"
                      title={t("builder.media.remove_video")}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              }
              return null;
            })()}
        </div>
      )}
    </>
  );
};
