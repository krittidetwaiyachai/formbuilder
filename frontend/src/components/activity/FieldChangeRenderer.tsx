import { Plus, Trash2, Edit3, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { stripHtml } from "@/lib/ui/utils";
import { getFieldTypeName, getPropertyLabel } from "./utils";
import ValueRenderer from "./ValueRenderer";
import type { ValueType } from "./ValueRenderer";
import type { FieldChange, ChangeItem } from "./types";

interface FieldChangeRendererProps {
  addedFields?: FieldChange[];
  deletedFields?: FieldChange[];
  updatedFields?: FieldChange[];
  fieldLabels: Record<string, string>;
  actionFilter: string;
}

export default function FieldChangeRenderer({
  addedFields = [],
  deletedFields = [],
  updatedFields = [],
  fieldLabels,
  actionFilter,
}: FieldChangeRendererProps) {
  const { t, i18n } = useTranslation();

  const isVisible = (section: "added" | "deleted" | "updated") => {
    if (actionFilter === "ALL") return true;
    if (actionFilter === "CREATED" && section === "added") return true;
    if (actionFilter === "DELETED" && section === "deleted") return true;
    if (actionFilter === "UPDATED" && section === "updated") return true;
    return false;
  };

  const isBooleanToggle = (before: unknown, after: unknown) => {
    return typeof before === "boolean" && typeof after === "boolean";
  };

  const isStringToggle = (
    property: string,
    before: unknown,
    after: unknown,
  ) => {
    const prop = property.split(".").pop()?.toLowerCase();
    const isStringValue =
      typeof before === "string" ||
      typeof after === "string" ||
      typeof before === "number" ||
      typeof after === "number";
    const toggleProps = [
      "size",
      "width",
      "height",
      "align",
      "variant",
      "position",
      "shrink",
      "labelalign",
      "labelalignment",
      "textalign",
      "textalignment",
      "alignment",
      "inputalign",
      "inputalignment",
      "columns",
      "theme",
      "layout",
      "direction",
      "orientation",
      "color",
      "background",
      "radius",
      "border",
      "shadow",
      "editormode",
    ];
    return (
      toggleProps.includes(prop || "") &&
      (isStringValue || typeof before === "undefined")
    );
  };

  return (
    <div className="space-y-3">
      {}
      {addedFields.length > 0 && isVisible("added") && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 inline-flex items-center gap-1">
            <Plus className="w-3 h-3" />{" "}
            {t("activity.changes.added_fields", { count: addedFields.length })}
          </div>
          <div className="flex flex-wrap gap-2">
            {addedFields.map((f: FieldChange, i: number) => {
              const groupName = f.groupId ? fieldLabels[f.groupId] : null;
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm"
                >
                  <span className="text-xs font-medium text-gray-700">
                    {typeof f.label === "string"
                      ? stripHtml(f.label)
                      : "Untitled"}
                  </span>
                  {groupName && (
                    <span className="text-[10px] text-gray-500 bg-gray-50 px-1 rounded">
                      {t("activity.changes.in_group", { group: groupName })}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded uppercase tracking-wider">
                    {typeof f.type === "string"
                      ? getFieldTypeName(f.type, t, i18n)
                      : "FIELD"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {}
      {deletedFields.length > 0 && isVisible("deleted") && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 inline-flex items-center gap-1">
            <Trash2 className="w-3 h-3" />{" "}
            {t("activity.changes.deleted_fields", {
              count: deletedFields.length,
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {deletedFields.map((f: FieldChange, i: number) => {
              const groupName = f.groupId ? fieldLabels[f.groupId] : null;
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-red-100 shadow-sm opacity-75"
                >
                  <span className="text-xs font-medium text-gray-700 line-through decoration-red-300">
                    {typeof f.label === "string"
                      ? stripHtml(f.label)
                      : "Untitled"}
                  </span>
                  {groupName && (
                    <span className="text-[10px] text-gray-500 bg-gray-50 px-1 rounded">
                      {t("activity.changes.from_group", { group: groupName })}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded uppercase tracking-wider">
                    {typeof f.type === "string"
                      ? getFieldTypeName(f.type, t, i18n)
                      : "FIELD"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {}
      {updatedFields.length > 0 && isVisible("updated") && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 inline-flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> {t("activity.changes.updated_fields")}
          </div>

          <div className="space-y-4">
            {updatedFields.map((f: FieldChange, i: number) => {
              const groupName = f.groupId ? fieldLabels[f.groupId] : null;
              return (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm hover:border-indigo-100 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50">
                    <span className="font-semibold text-sm text-gray-900">
                      {typeof f.label === "string" ||
                      typeof f.label === "number"
                        ? stripHtml(String(f.label))
                        : "Untitled"}
                    </span>
                    {groupName && (
                      <span className="text-[10px] text-gray-500 bg-gray-50 px-1 rounded">
                        {t("activity.changes.in_group", { group: groupName })}
                      </span>
                    )}
                    {f.type && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 tracking-wide">
                        {getFieldTypeName(f.type, t, i18n)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {(f.changes || []).map((c: ChangeItem, idx: number) => {
                      const propName = getPropertyLabel(
                        c.property || "",
                        t,
                        i18n,
                      );

                      let beforeValue = c.before;

                      if (c.property === "stateInputType" && !beforeValue)
                        beforeValue = "text";
                      if (c.property === "rows" && !beforeValue)
                        beforeValue = 4;
                      if (c.property === "customWidth" && !beforeValue)
                        beforeValue = 300;
                      if (
                        (c.property === "validation.separator" ||
                          c.property === "separator") &&
                        !beforeValue
                      )
                        beforeValue = "/";
                      if (
                        (c.property === "validation.dateFormat" ||
                          c.property === "dateFormat") &&
                        !beforeValue
                      )
                        beforeValue = "MM-DD-YYYY";
                      if (
                        (c.property === "validation.timeFormat" ||
                          c.property === "timeFormat") &&
                        !beforeValue
                      )
                        beforeValue = "AM/PM";
                      if (
                        (c.property === "validation.minimumAge" ||
                          c.property === "minimumAge") &&
                        !beforeValue
                      )
                        beforeValue = 18;
                      if (
                        [
                          "validation.allowPast",
                          "allowPast",
                          "validation.allowFuture",
                          "allowFuture",
                        ].includes(c.property || "") &&
                        beforeValue === undefined
                      )
                        beforeValue = true;
                      if (
                        (c.property === "validation.limitTime" ||
                          c.property === "limitTime") &&
                        !beforeValue
                      )
                        beforeValue = "BOTH";
                      if (c.property === "icon" && !beforeValue)
                        beforeValue = "star";
                      if (c.property === "maxRating" && !beforeValue)
                        beforeValue = 5;
                      if (
                        (c.property === "validation.maxLength" ||
                          c.property === "maxLength") &&
                        !beforeValue
                      )
                        beforeValue = 100;
                      if (
                        (c.property === "validation.imagePosition" ||
                          c.property === "imagePosition") &&
                        !beforeValue
                      )
                        beforeValue = "CENTER";

                      if (c.property === "groupId") {
                        const groupNameBefore = beforeValue
                          ? fieldLabels[String(beforeValue)]
                          : "Canvas";
                        const groupNameAfter = c.after
                          ? fieldLabels[String(c.after)]
                          : "Canvas";

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-xs"
                          >
                            <span className="text-gray-500 font-medium whitespace-nowrap">
                              {t("activity.changes.location")}
                            </span>
                            <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200 whitespace-nowrap">
                              {beforeValue ? (
                                <span>
                                  {t("activity.changes.from_group", {
                                    group: groupNameBefore,
                                  })}
                                </span>
                              ) : (
                                "Canvas"
                              )}
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-300" />
                            <div className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 whitespace-nowrap font-medium">
                              {c.after ? (
                                <span>
                                  {t("activity.changes.in_group", {
                                    group: groupNameAfter,
                                  })}
                                </span>
                              ) : (
                                "Canvas"
                              )}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <span className="text-gray-500 font-medium whitespace-nowrap">
                            {propName}
                          </span>
                          {isBooleanToggle(beforeValue, c.after) ? (
                            <>
                              <div
                                className={`px-2 py-1 rounded border whitespace-nowrap ${beforeValue ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-100 text-gray-500"}`}
                              >
                                {beforeValue
                                  ? t("activity.values.enable")
                                  : t("activity.values.disable")}
                              </div>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                              <div
                                className={`px-2 py-1 rounded border whitespace-nowrap font-medium ${c.after ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-100 text-gray-500"}`}
                              >
                                {c.after
                                  ? t("activity.values.enable")
                                  : t("activity.values.disable")}
                              </div>
                            </>
                          ) : isStringToggle(
                              c.property || "",
                              beforeValue,
                              c.after,
                            ) ? (
                            <>
                              <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200 whitespace-nowrap">
                                {typeof beforeValue === "string" ||
                                typeof beforeValue === "number"
                                  ? beforeValue
                                  : (c.property || "")
                                        .toLowerCase()
                                        .includes("editormode")
                                    ? t("activity.values.plain_text")
                                    : t("activity.values.auto")}
                              </div>
                              <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                              <div className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-medium">
                                {typeof c.after === "string" ||
                                typeof c.after === "number"
                                  ? c.after
                                  : (c.property || "")
                                        .toLowerCase()
                                        .includes("editormode")
                                    ? t("activity.values.plain_text")
                                    : t("activity.values.auto")}
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 line-through opacity-75 break-words min-w-0"
                                title={String(beforeValue)}
                              >
                                <ValueRenderer
                                  value={beforeValue as ValueType}
                                />
                              </div>
                              <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                              <div
                                className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 font-medium break-words min-w-0"
                                title={String(c.after)}
                              >
                                <ValueRenderer value={c.after as ValueType} />
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
