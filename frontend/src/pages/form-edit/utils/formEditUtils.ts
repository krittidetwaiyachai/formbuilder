import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { FieldType } from "@/types";
import type { Field } from "@/types";
import { allFields } from "@/components/form-builder/sidebar/config";
import { generateUUID } from "@/utils/uuid";
export const checkTouchDevice = () => {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(hover: none) and (pointer: coarse)").matches);
};
export const getFieldLabelForType = (type: FieldType) => {
  const config = allFields.find((field) => field.type === type);
  if (config) {
    return config.label;
  }
  switch (type) {
    case FieldType.TEXT:
      return "Short Text";
    case FieldType.TEXTAREA:
      return "Long Text";
    case FieldType.NUMBER:
      return "Number";
    case FieldType.EMAIL:
      return "Email";
    case FieldType.PHONE:
      return "Phone";
    case FieldType.DATE:
      return "Date";
    case FieldType.TIME:
      return "Time";
    case FieldType.RADIO:
      return "Single Choice";
    case FieldType.CHECKBOX:
      return "Multiple Choice";
    case FieldType.DROPDOWN:
      return "Dropdown";
    case FieldType.HEADER:
      return "Heading";
    case FieldType.PARAGRAPH:
      return "Text Block";
    case FieldType.DIVIDER:
      return "Separator";
    case FieldType.PAGE_BREAK:
      return "Page Break";
    case FieldType.RATE:
      return "Star Rating";
    case FieldType.ADDRESS:
      return "Address";
    case FieldType.FULLNAME:
      return "Full Name";
    case FieldType.FILE:
      return "File Upload";
    case FieldType.MATRIX:
      return "Matrix Logic";
    case FieldType.TABLE:
      return "Input Table";
    case FieldType.GROUP:
      return "Field Group";
    default:
      return "Field";
  }
};
export const stripHtml = (value?: string) =>
(value || "").
replace(/<[^>]*>/g, " ").
replace(/\s+/g, " ").
trim();
export const getTopLevelCanvasSlots = (canvas: HTMLElement) =>
Array.from(
  canvas.querySelectorAll<HTMLElement>('[data-top-level-field-slot="true"]')
);
export const getStableTopLevelDropIndexAtPoint = (
canvas: HTMLElement,
y: number,
currentIndex: number | null) =>
{
  const canvasRect = canvas.getBoundingClientRect();
  const fieldElements = getTopLevelCanvasSlots(canvas);
  if (fieldElements.length === 0) {
    return 0;
  }
  const midpoints = fieldElements.map((element) => {
    const rect = element.getBoundingClientRect();
    return rect.top + rect.height / 2;
  });
  let nextIndex = fieldElements.length;
  for (let index = 0; index < midpoints.length; index++) {
    if (y < midpoints[index]) {
      nextIndex = index;
      break;
    }
  }
  if (
  currentIndex === null ||
  currentIndex < 0 ||
  currentIndex > fieldElements.length)
  {
    return nextIndex;
  }
  const upperBoundary = currentIndex === 0 ? canvasRect.top : midpoints[currentIndex - 1];
  const lowerBoundary =
  currentIndex === fieldElements.length ? canvasRect.bottom : midpoints[currentIndex];
  const activeSpan = Math.max(40, lowerBoundary - upperBoundary);
  const hysteresis = Math.min(26, activeSpan * 0.18);
  if (y >= upperBoundary - hysteresis && y <= lowerBoundary + hysteresis) {
    return currentIndex;
  }
  return nextIndex;
};
export const createFieldFromType = (formId: string, type: FieldType): Field => {
  const config = allFields.find((field) => field.type === type);
  const baseOptions = config?.options ? { ...config.options } : {};
  const field: Field = {
    id: generateUUID(),
    formId,
    type,
    label: getFieldLabelForType(type),
    required: false,
    order: 0,
    validation: config?.validation,
    options: type === FieldType.GROUP ? { ...baseOptions, collapsible: true } : baseOptions
  };
  if (
  type === FieldType.RADIO ||
  type === FieldType.CHECKBOX ||
  type === FieldType.DROPDOWN)
  {
    field.options = {
      ...baseOptions,
      subLabel: "",
      options: [
      { id: generateUUID(), label: "Option 1", value: "Option 1" },
      { id: generateUUID(), label: "Option 2", value: "Option 2" },
      { id: generateUUID(), label: "Option 3", value: "Option 3" }]
    };
  } else if (
  type === FieldType.TEXT ||
  type === FieldType.TEXTAREA ||
  type === FieldType.NUMBER ||
  type === FieldType.EMAIL ||
  type === FieldType.PHONE ||
  type === FieldType.DATE ||
  type === FieldType.TIME ||
  type === FieldType.RATE ||
  type === FieldType.FULLNAME ||
  type === FieldType.ADDRESS)
  {
    field.options = {
      ...baseOptions,
      subLabel: ""
    };
  }
  return field;
};
export const findGlobalIndex = (
fields: Field[],
pageIndex: number,
visualIndex: number) =>
{
  let startIndex = 0;
  if (pageIndex > 0) {
    let foundBreaks = 0;
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].type === FieldType.PAGE_BREAK) {
        foundBreaks++;
        if (foundBreaks === pageIndex) {
          startIndex = i + 1;
          break;
        }
      }
    }
  }
  let currentVisualIndex = 0;
  let i = startIndex;
  while (i < fields.length) {
    const field = fields[i];
    if (field.type === FieldType.PAGE_BREAK) {
      if (currentVisualIndex === visualIndex) return i;
      currentVisualIndex++;
      if (currentVisualIndex === visualIndex) return i + 1;
      break;
    }
    if (!field.groupId || field.type === FieldType.GROUP) {
      if (currentVisualIndex === visualIndex) {
        return i;
      }
      currentVisualIndex++;
      if (field.type === FieldType.GROUP) {
        let j = i + 1;
        while (j < fields.length && fields[j].groupId === field.id) {
          j++;
        }
        i = j - 1;
      }
    }
    i++;
  }
  return i;
};
export const getTopLevelFieldBlock = (fields: Field[], fieldId: string) => {
  const startIndex = fields.findIndex((field) => field.id === fieldId);
  if (startIndex === -1) {
    return null;
  }
  const rootField = fields[startIndex];
  if (rootField.groupId && rootField.type !== FieldType.GROUP) {
    return null;
  }
  let endIndex = startIndex + 1;
  if (rootField.type === FieldType.GROUP) {
    while (endIndex < fields.length && fields[endIndex].groupId === rootField.id) {
      endIndex++;
    }
  }
  return {
    startIndex,
    endIndex,
    block: fields.slice(startIndex, endIndex)
  };
};
export const reorderTopLevelFieldBlock = (
fields: Field[],
pageIndex: number,
fieldId: string,
visualIndex: number) =>
{
  const blockRange = getTopLevelFieldBlock(fields, fieldId);
  if (!blockRange) {
    return null;
  }
  const fieldsWithoutBlock = [
  ...fields.slice(0, blockRange.startIndex),
  ...fields.slice(blockRange.endIndex)];
  const insertIndex = findGlobalIndex(fieldsWithoutBlock, pageIndex, visualIndex);
  const nextFields = [...fieldsWithoutBlock];
  nextFields.splice(insertIndex, 0, ...blockRange.block);
  return nextFields.map((field, index) => ({
    ...field,
    order: index
  }));
};
export interface MobileCanvasDragState {
  fieldId: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  sourceIndex: number;
}
export const triggerDroppedFieldAnimation = (
fieldId: string,
cleanupRef: MutableRefObject<number | null>,
setDroppedFieldId: Dispatch<SetStateAction<string | null>>) =>
{
  setDroppedFieldId(fieldId);
  if (cleanupRef.current !== null) {
    window.clearTimeout(cleanupRef.current);
  }
  cleanupRef.current = window.setTimeout(() => {
    setDroppedFieldId(null);
    cleanupRef.current = null;
  }, 220);
};