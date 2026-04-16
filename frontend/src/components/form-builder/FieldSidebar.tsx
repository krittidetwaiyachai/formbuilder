import React, { useState } from "react";
import { ChevronRight, ChevronLeft, Layers } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { fieldCategories } from "./sidebar/config";
import { SidebarCategory } from "./sidebar/SidebarCategory";
import { TemplatePopup } from "./sidebar/TemplatePopup";
const checkTouch = () => {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(hover: none) and (pointer: coarse)").matches);
};
const useIsTouchDevice = () => {
  const [isTouch] = React.useState(checkTouch);
  return isTouch;
};
interface FieldSidebarProps {
  onFieldSelected?: () => void;
  className?: string;
  variant?: "list" | "grid";
  mode?: "desktop" | "mobile";
}
export default function FieldSidebar({
  onFieldSelected,
  className,
  variant,
  mode = "desktop"
}: FieldSidebarProps) {
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const isTouch = useIsTouchDevice();
  useSmoothScroll("field-sidebar-scroll-container", { enabled: !isTouch });
  const visualVariant = variant || (className ? "grid" : "list");
  const isMobileMode = mode === "mobile";
  const handleFieldSelect = () => {
    onFieldSelected?.();
  };
  return (
    <div
      className={
      className ||
      `bg-white border-r border-gray-200 flex flex-col h-full shadow-sm relative z-20 transition-all duration-300 ease-in-out ${isCollapsed ? "w-16" : "w-[300px]"}`
      }>
      {!className &&
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 shadow-md rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:scale-110 transition-all z-50 flex items-center justify-center w-8 h-8"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
          {isCollapsed ?
        <ChevronRight className="h-5 w-5" /> :
        <ChevronLeft className="h-5 w-5" />
        }
        </button>
      }
      <div
        className={`border-b ${isMobileMode ? "border-gray-100 bg-gradient-to-b from-white to-gray-50/80 px-5 py-4" : "border-gray-200 bg-white p-4"} flex items-center ${isCollapsed ? "justify-center" : "justify-between"} relative`}>
        {!isCollapsed &&
        <div className={isMobileMode ? "space-y-1" : ""}>
            <h2 className="font-semibold text-gray-800 whitespace-nowrap overflow-hidden">
              {t("builder.fields")}
            </h2>
            {isMobileMode &&
          <p className="text-xs text-gray-500">
                {t("builder.add_field")}
              </p>
          }
          </div>
        }
      </div>
      <div
        className={`border-b border-gray-100 ${isMobileMode ? "bg-white px-5 py-4" : `bg-gray-50/50 ${isCollapsed ? "p-2" : "px-4 py-4"}`}`}>
        {isCollapsed ?
        <button
          onClick={() => setIsTemplateOpen(!isTemplateOpen)}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-black text-white hover:bg-zinc-800 transition-colors group relative overflow-hidden"
          title="Field Bundles">
            <div className="absolute inset-0 bg-white/10 rounded-lg blur-sm group-hover:bg-white/20 transition-colors animate-pulse" />
            <div className="relative z-10 p-1">
              <Layers className="h-5 w-5 animate-wiggle" />
            </div>
          </button> :
        <button
          onClick={() => setIsTemplateOpen(!isTemplateOpen)}
          className={`relative w-full group isolate ${isMobileMode ? "" : ""}`}>
            {isMobileMode ?
          <div className="relative w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0a0a0a_0%,#171717_55%,#222222_100%)] px-4 py-4 flex items-center justify-between border border-black/5 shadow-[0_14px_28px_rgba(0,0,0,0.12)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_38%)] pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold tracking-tight text-white">
                      {t("builder.field_bundles")}
                    </div>
                    <div className="text-[11px] text-white/60">
                      {t("builder.bundles_subtitle")}
                    </div>
                  </div>
                </div>
                <ChevronRight className="relative z-10 h-5 w-5 text-white/70" />
              </div> :
          <>
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl group-hover:bg-white/40 transition-colors duration-500 animate-pulse" />
                <div className="absolute -inset-[2px] rounded-xl overflow-hidden pb-px">
                  <div className="absolute top-[50%] left-[50%] w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(transparent_0deg,transparent_270deg,white_360deg)] opacity-100 shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-spin-slow" />
                </div>
                <div className="relative w-full bg-black rounded-[10px] px-4 py-3 flex items-center justify-between z-10 border border-transparent group-hover:bg-zinc-950 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:3px_3px] opacity-30 pointer-events-none" />
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
                  <div className="flex items-center gap-3 z-20">
                    <div className="relative group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300">
                      <Layers className="relative w-5 h-5 text-white animate-wiggle" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-bold text-white tracking-wide">
                        {t("builder.field_bundles")}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase group-hover:text-white transition-colors">
                        {t("builder.bundles_subtitle")}
                      </span>
                    </div>
                  </div>
                  <div className="relative z-20">
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300 shadow-sm" />
                  </div>
                </div>
              </>
          }
          </button>
        }
        <AnimatePresence>
          {isTemplateOpen &&
          <TemplatePopup onClose={() => setIsTemplateOpen(false)} />
          }
        </AnimatePresence>
      </div>
      <div
        id="field-sidebar-scroll-container"
        className={`flex-1 overflow-y-auto ${isCollapsed ? "p-2" : isMobileMode ? "px-5 py-5" : "p-4"} space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent`}>
        <div className={visualVariant === "list" ? "space-y-6" : isMobileMode ? "space-y-7 pb-12" : "space-y-8 pb-10"}>
          {fieldCategories.map((category) =>
          <SidebarCategory
            key={category.name}
            category={category}
            isCollapsed={isCollapsed}
            onFieldAdd={handleFieldSelect}
            variant={visualVariant}
            isTouch={isTouch} />
          )}
        </div>
      </div>
    </div>);
}
