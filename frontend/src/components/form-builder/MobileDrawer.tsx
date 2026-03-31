import { useMemo, useRef, useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Settings, Palette } from "lucide-react";
import { useFormStore } from "@/store/formStore";
import FieldSidebar from "@/components/form-builder/FieldSidebar";
import PropertiesPanel from "@/components/form-builder/PropertiesPanel";
import { LiquidFab } from "@/components/ui/LiquidFab";
interface MobileDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  drawerContent: "fields" | "properties" | "settings" | null;
  openDrawer: (content: "fields" | "properties" | "settings") => void;
  closeDrawer: () => void;
  currentPage: number;
  onOpenTheme: () => void;
}
type ExpansionDirection = "left" | "right" | "up" | "down";
interface ArcOffset {
  x: number;
  y: number;
}
interface FabAction {
  key: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  icon: ReactNode;
}
const EDGE_THRESHOLD = 132;
const ACTION_HIDE_TRANSFORM = "translate(0px, 0px) scale(0.5)";
const RIGHT_ARC_OFFSETS: ArcOffset[] = [
{ x: 0, y: -90 },
{ x: 45, y: -75 },
{ x: 75, y: -45 },
{ x: 90, y: 0 },
{ x: 75, y: 45 },
{ x: 45, y: 75 },
{ x: 0, y: 90 }];
const ACTION_LABEL_Y_ADJUSTMENTS_RIGHT: Partial<Record<string, number>> = {
  settings: 26,
  logic: 8,
  redo: -10,
  theme: -28
};
const ACTION_LABEL_Y_ADJUSTMENTS_LEFT: Partial<Record<string, number>> = {
  settings: -26,
  logic: -8,
  redo: 8,
  theme: 28
};
const ACTION_LABEL_X_ADJUSTMENTS_RIGHT: Partial<Record<string, number>> = {
  settings: -10,
  logic: -2,
  theme: -10
};
const ACTION_LABEL_X_ADJUSTMENTS_LEFT: Partial<Record<string, number>> = {
  settings: 0,
  logic: 0,
  theme: 0
};
const getExpansionDirection = (rect: DOMRect): ExpansionDirection => {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const spaces = {
    left: centerX,
    right: window.innerWidth - centerX,
    top: centerY,
    bottom: window.innerHeight - centerY
  };
  const closestEdge = (Object.entries(spaces) as Array<[keyof typeof spaces, number]>).
  sort((a, b) => a[1] - b[1])[0];
  if (closestEdge[1] < EDGE_THRESHOLD) {
    switch (closestEdge[0]) {
      case "left":
        return "right";
      case "right":
        return "left";
      case "top":
        return "down";
      case "bottom":
      default:
        return "up";
    }
  }
  return centerX < window.innerWidth / 2 ? "right" : "left";
};
const rotateOffset = (
offset: ArcOffset,
direction: ExpansionDirection)
: ArcOffset => {
  switch (direction) {
    case "right":
      return offset;
    case "down":
      return { x: -offset.y, y: offset.x };
    case "left":
      return { x: -offset.x, y: -offset.y };
    case "up":
    default:
      return { x: offset.y, y: -offset.x };
  }
};
export default function MobileDrawer({
  isOpen,
  setIsOpen,
  drawerContent,
  openDrawer,
  closeDrawer,
  currentPage,
  onOpenTheme
}: MobileDrawerProps) {
  const { t } = useTranslation();
  const [dragConstraints, setDragConstraints] = useState({
    top: -500,
    left: -300,
    right: 30,
    bottom: 30
  });
  const [isFabOnLeftSide, setIsFabOnLeftSide] = useState(false);
  const [expansionDirection, setExpansionDirection] =
  useState<ExpansionDirection>("left");
  const [labelOnRight, setLabelOnRight] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const shouldShowScrim = !!drawerContent;
  const updatePosition = () => {
    if (!fabRef.current) {
      return;
    }
    const rect = fabRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    setIsFabOnLeftSide(centerX < window.innerWidth / 2);
    const nextExpansionDirection = getExpansionDirection(rect);
    setExpansionDirection(nextExpansionDirection);
    setLabelOnRight(
      nextExpansionDirection === "right" ||
      (nextExpansionDirection === "up" || nextExpansionDirection === "down") &&
      centerX < window.innerWidth / 2
    );
  };
  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);
  const {
    activeSidebarTab,
    setActiveSidebarTab,
    undo,
    redo,
    historyIndex,
    history
  } = useFormStore();
  const actionOffsets = useMemo(
    () => RIGHT_ARC_OFFSETS.map((offset) => rotateOffset(offset, expansionDirection)),
    [expansionDirection]
  );
  const baseActionLabelStyle = useMemo<CSSProperties>(
    () =>
    labelOnRight ?
    {
      left: "100%",
      right: "auto",
      marginLeft: "10px",
      marginRight: "0",
      top: "50%",
      marginTop: "-12px"
    } :
    {
      right: "100%",
      left: "auto",
      marginRight: "10px",
      marginLeft: "0",
      top: "50%",
      marginTop: "-12px"
    },
    [labelOnRight]
  );
  const activeLabelXAdjustments = isFabOnLeftSide ?
  ACTION_LABEL_X_ADJUSTMENTS_LEFT :
  ACTION_LABEL_X_ADJUSTMENTS_RIGHT;
  const activeLabelYAdjustments = isFabOnLeftSide ?
  ACTION_LABEL_Y_ADJUSTMENTS_LEFT :
  ACTION_LABEL_Y_ADJUSTMENTS_RIGHT;
  const actions: FabAction[] = [
  {
    key: "settings",
    title: t("builder.settings"),
    onClick: () => openDrawer("settings"),
    icon:
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
  },
  activeSidebarTab === "logic" ?
  {
    key: "builder",
    title: t("builder.back_to_canvas"),
    onClick: () => {
      setActiveSidebarTab("builder");
      setIsOpen(false);
    },
    icon:
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
  } :
  {
    key: "logic",
    title: t("builder.tabs.logic"),
    onClick: () => {
      setActiveSidebarTab("logic");
      setIsOpen(false);
    },
    icon:
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
              <path d="M6 3v12" />
              <path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              <path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              <path d="M15 6a9 9 0 0 0-9 9" />
              <path d="M18 15v6" />
              <path d="M21 18h-6" />
            </svg>
  },
  {
    key: "properties",
    title: t("builder.properties.title"),
    onClick: () => openDrawer("properties"),
    icon:
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
          <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
        </svg>
  },
  {
    key: "fields",
    title: t("builder.add_field"),
    onClick: () => openDrawer("fields"),
    icon:
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
          <line x1="12" x2="12" y1="5" y2="19" />
          <line x1="5" x2="19" y1="12" y2="12" />
        </svg>
  },
  {
    key: "undo",
    title: t("builder_header.undo"),
    onClick: () => {
      undo();
      setIsOpen(false);
    },
    disabled: historyIndex <= 0,
    icon:
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
  },
  {
    key: "redo",
    title: t("builder_header.redo"),
    onClick: () => {
      redo();
      setIsOpen(false);
    },
    disabled: historyIndex >= history.length - 1,
    icon:
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
        </svg>
  },
  {
    key: "theme",
    title: t("dashboard.theme.appearance", "Theme"),
    onClick: () => {
      onOpenTheme();
      setIsOpen(false);
    },
    icon: <Palette className="w-5 h-5" />
  }];
  return (
    <>
      {drawerContent &&
      <div className="md:hidden fixed inset-0 z-[9999] flex mobile-drawer-wrapper">
          {shouldShowScrim &&
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in mobile-drawer-scrim"
          onClick={closeDrawer} />
        }
          <div
          className={`mobile-drawer-panel relative w-full max-w-[92%] md:max-w-[400px] h-full bg-white shadow-2xl animate-in transition-opacity ${
          drawerContent === "fields" ?
          "slide-in-from-left mr-auto md:rounded-r-2xl" :
          "slide-in-from-right ml-auto md:rounded-l-2xl"} duration-300 flex flex-col overflow-visible opacity-100`
          }>
            {drawerContent !== "fields" &&
          <div className="flex items-center justify-end border-b border-gray-100 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfa_100%)] px-5 py-3">
                <button
              onClick={closeDrawer}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                </button>
              </div>
          }
            {drawerContent === "fields" &&
          <button
            onClick={closeDrawer}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-gray-100 hover:text-gray-900">
                <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
          }
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {drawerContent === "fields" &&
            <FieldSidebar
              onFieldSelected={closeDrawer}
              className="w-full h-full flex flex-col shadow-none border-none"
              mode="mobile" />
            }
              {(drawerContent === "properties" || drawerContent === "settings") &&
            <div className="flex-1 overflow-y-auto">
                  <PropertiesPanel currentPage={currentPage} variant="mobile" />
                </div>
            }
            </div>
          </div>
        </div>
      }
      <motion.div
        ref={fabRef}
        className="md:hidden absolute bottom-40 right-10 z-[90]"
        drag
        dragMomentum={false}
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        whileDrag={{ scale: 1.05 }}
        onPointerDown={(e) => e.stopPropagation()}
        onDragEnd={updatePosition}>
        <div className="absolute inset-0 flex items-center justify-center">
          {actions.map((action, index) => {
            const offset = actionOffsets[index];
            const transitionDelay = isOpen ? `${index * 35}ms` : "0ms";
            const visibleOpacity = action.disabled ? 0.3 : 1;
            const labelXAdjustment = activeLabelXAdjustments[action.key] ?? 0;
            const actionLabelStyle: CSSProperties = {
              ...baseActionLabelStyle,
              marginLeft: baseActionLabelStyle.marginLeft ?
              `${parseFloat(String(baseActionLabelStyle.marginLeft)) + labelXAdjustment}px` :
              baseActionLabelStyle.marginLeft,
              marginRight: baseActionLabelStyle.marginRight ?
              `${parseFloat(String(baseActionLabelStyle.marginRight)) + labelXAdjustment}px` :
              baseActionLabelStyle.marginRight,
              marginTop: `${
              parseFloat(String(baseActionLabelStyle.marginTop ?? 0)) + (
              activeLabelYAdjustments[action.key] ?? 0)}px`
            };
            return (
              <button
                key={action.key}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out disabled:opacity-30 disabled:cursor-not-allowed ${
                isOpen ? "pointer-events-auto" : "pointer-events-none"}`
                }
                style={{
                  transform: isOpen ?
                  `translate(${offset.x}px, ${offset.y}px) scale(1)` :
                  ACTION_HIDE_TRANSFORM,
                  opacity: isOpen ? visibleOpacity : 0,
                  transitionDelay
                }}
                title={action.title}>
                {isOpen &&
                <span className="speed-dial-label" style={actionLabelStyle}>
                    {action.title}
                  </span>
                }
                {action.icon}
              </button>);
          })}
        </div>
        <div className="relative w-8 h-8 flex items-center justify-center z-50">
          <LiquidFab
            onClick={() => {
              updatePosition();
              setIsOpen(!isOpen);
            }}
            isOpen={isOpen} />
        </div>
      </motion.div>
      {isOpen &&
      <div
        className="md:hidden fixed inset-0 z-[89] bg-black/30 backdrop-blur-[2px] animate-in fade-in"
        onClick={() => setIsOpen(false)} />
      }
    </>);
}