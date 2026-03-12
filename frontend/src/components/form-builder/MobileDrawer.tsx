import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";
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
}
export default function MobileDrawer({
  isOpen,
  setIsOpen,
  drawerContent,
  openDrawer,
  closeDrawer,
  currentPage
}: MobileDrawerProps) {
  const { t } = useTranslation();
  const {
    activeSidebarTab,
    setActiveSidebarTab,
    undo,
    redo,
    historyIndex,
    history
  } = useFormStore();
  return (
    <>      {drawerContent &&
      <div className="md:hidden fixed inset-0 z-[9999] flex">          <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={closeDrawer} />
          <div
          className={`relative w-full max-w-[90%] md:max-w-[400px] h-full bg-white shadow-2xl animate-in ${drawerContent === "fields" ? "slide-in-from-left mr-auto md:rounded-r-2xl" : "slide-in-from-right ml-auto md:rounded-l-2xl"} duration-300 flex flex-col overflow-hidden`}>
            {drawerContent !== "fields" &&
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">                <div className="flex items-center gap-2">                  {drawerContent === "properties" &&
              <>                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">                        <Settings className="w-4 h-4" />                      </div>                      <span className="font-semibold text-gray-900">                        {t("builder.properties.title")}                      </span>                    </>
              }                  {drawerContent === "settings" &&
              <>                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">                        <Settings className="w-4 h-4" />                      </div>                      <span className="font-semibold text-gray-900">                        {t("builder.settings")}                      </span>                    </>
              }                </div>                <button
              onClick={closeDrawer}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors">
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
                    <path d="M18 6 6 18" />                    <path d="m6 6 12 12" />                  </svg>                </button>              </div>
          }            {drawerContent === "fields" &&
          <button
            onClick={closeDrawer}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm">
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
                  <path d="M18 6 6 18" />                  <path d="m6 6 12 12" />                </svg>              </button>
          }            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white">              {drawerContent === "fields" &&
            <FieldSidebar
              onFieldSelected={closeDrawer}
              className="w-full h-full flex flex-col shadow-none border-none" />
            }              {(drawerContent === "properties" ||
            drawerContent === "settings") &&
            <PropertiesPanel currentPage={currentPage} />
            }            </div>          </div>        </div>
      }      <div className="md:hidden absolute bottom-40 right-10 z-[90]">        <div className="absolute inset-0 flex items-center justify-center">          <button
            onClick={() => openDrawer("settings")}
            className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out ${
            isOpen ?
            "-translate-y-[90px] translate-x-0 opacity-100 scale-100" :
            "translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none"}`
            }
            title={t("builder.settings")}>
            {isOpen &&
            <span className="speed-dial-label" style={{ marginTop: "-50px" }}>                {t("builder.settings")}              </span>
            }            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />              <circle cx="12" cy="12" r="3" />            </svg>          </button>          {activeSidebarTab === "logic" ?
          <button
            onClick={() => {
              setActiveSidebarTab("builder");
              setIsOpen(false);
            }}
            className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-75 ${
            isOpen ?
            "-translate-y-[75px] -translate-x-[45px] opacity-100 scale-100" :
            "translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none"}`
            }
            title={t("builder.back_to_canvas")}>
              {isOpen &&
            <span
              className="speed-dial-label"
              style={{ marginTop: "-14px" }}>
                  {t("builder.back_to_canvas")}                </span>
            }              <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" />                <path d="M19 12H5" />              </svg>            </button> :
          <button
            onClick={() => {
              setActiveSidebarTab("logic");
              setIsOpen(false);
            }}
            className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-75 ${
            isOpen ?
            "-translate-y-[75px] -translate-x-[45px] opacity-100 scale-100" :
            "translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none"}`
            }
            title={t("builder.tabs.logic")}>
              {isOpen &&
            <span
              className="speed-dial-label"
              style={{ marginTop: "-14px" }}>
                  {t("builder.tabs.logic")}                </span>
            }              <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
                <path d="M6 3v12" />                <path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />                <path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />                <path d="M15 6a9 9 0 0 0-9 9" />                <path d="M18 15v6" />                <path d="M21 18h-6" />              </svg>            </button>
          }          <button
            onClick={() => openDrawer("properties")}
            className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-100 ${
            isOpen ?
            "-translate-y-[45px] -translate-x-[75px] opacity-100 scale-100" :
            "translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none"}`
            }
            title={t("builder.properties.title")}>
            {isOpen &&
            <span className="speed-dial-label" style={{ marginTop: "0px" }}>                {t("builder.properties.title")}              </span>
            }            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />              <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />            </svg>          </button>          <button
            onClick={() => openDrawer("fields")}
            className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-150 ${
            isOpen ?
            "translate-y-0 -translate-x-[90px] opacity-100 scale-100" :
            "translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none"}`
            }
            title={t("builder.add_field")}>
            {isOpen &&
            <span className="speed-dial-label">{t("builder.add_field")}</span>
            }            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="12" x2="12" y1="5" y2="19" />              <line x1="5" x2="19" y1="12" y2="12" />            </svg>          </button>          <button
            onClick={() => {
              undo();
              setIsOpen(false);
            }}
            disabled={historyIndex <= 0}
            className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-75 disabled:opacity-30 disabled:cursor-not-allowed ${
            isOpen ?
            "translate-y-[45px] -translate-x-[75px] opacity-100 scale-100" :
            "translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none"}`
            }
            title={t("builder_header.undo")}>
            {isOpen &&
            <span className="speed-dial-label">                {t("builder_header.undo")}              </span>
            }            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M3 7v6h6" />              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />            </svg>          </button>          <button
            onClick={() => {
              redo();
              setIsOpen(false);
            }}
            disabled={historyIndex >= history.length - 1}
            className={`absolute w-10 h-10 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out delay-100 disabled:opacity-30 disabled:cursor-not-allowed ${
            isOpen ?
            "translate-y-[75px] -translate-x-[45px] opacity-100 scale-100" :
            "translate-y-0 translate-x-0 opacity-0 scale-50 pointer-events-none"}`
            }
            title={t("builder_header.redo")}>
            {isOpen &&
            <span className="speed-dial-label" style={{ marginTop: "25px" }}>                {t("builder_header.redo")}              </span>
            }            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M21 7v6h-6" />              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />            </svg>          </button>        </div>        <div className="relative w-8 h-8 flex items-center justify-center z-50">          <LiquidFab onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />        </div>      </div>      {isOpen &&
      <div
        className="md:hidden fixed inset-0 z-[89] bg-black/30 backdrop-blur-[2px] animate-in fade-in"
        onClick={() => setIsOpen(false)} />
      }    </>);
}