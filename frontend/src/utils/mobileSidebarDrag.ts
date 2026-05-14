import { FieldType } from "@/types";
export const MOBILE_SIDEBAR_DRAG_START = "formbuilder:mobile-sidebar-drag-start";
export const MOBILE_SIDEBAR_DRAG_MOVE = "formbuilder:mobile-sidebar-drag-move";
export const MOBILE_SIDEBAR_DRAG_END = "formbuilder:mobile-sidebar-drag-end";
export interface MobileSidebarDragDetail {
  fieldType: FieldType;
  x: number;
  y: number;
}
export const dispatchMobileSidebarDragEvent = (
eventName: string,
detail: MobileSidebarDragDetail) =>
{
  window.dispatchEvent(new CustomEvent<MobileSidebarDragDetail>(eventName, { detail }));
};