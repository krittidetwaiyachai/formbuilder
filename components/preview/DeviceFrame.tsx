"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Smartphone, Tablet } from "lucide-react";

interface DeviceFrameProps {
  device: "desktop" | "tablet" | "mobile";
  children: ReactNode;
}

export default function DeviceFrame({ device, children }: DeviceFrameProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  const deviceConfig = {
    desktop: {
      width: "100%",
      maxWidth: "1200px",
      padding: "p-8",
    },
    tablet: {
      portrait: {
        width: "768px",
        height: "1024px",
        maxWidth: "768px",
        padding: "p-6",
      },
      landscape: {
        width: "1024px",
        height: "768px",
        maxWidth: "1024px",
        padding: "p-6",
      },
    },
    mobile: {
      portrait: {
        width: "375px",
        height: "667px",
        maxWidth: "375px",
        padding: "p-4",
      },
      landscape: {
        width: "667px",
        height: "375px",
        maxWidth: "667px",
        padding: "p-4",
      },
    },
  };

  const getConfig = () => {
    if (device === "desktop") {
      return deviceConfig.desktop;
    }
    return deviceConfig[device][orientation];
  };

  const config = getConfig();

  const toggleOrientation = () => {
    setOrientation(prev => prev === "portrait" ? "landscape" : "portrait");
  };

  const showControls = device === "tablet" || device === "mobile";

  const isMobileOrTablet = device === "tablet" || device === "mobile";
  const deviceConfigValue = isMobileOrTablet ? (config as any) : config;

  return (
    <div className="flex justify-center items-start bg-gray-200 p-4 sm:p-8 min-h-screen relative">
      <div
        className={cn(
          "bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300",
          "w-full",
          isMobileOrTablet && "overflow-y-auto relative"
        )}
        style={{ 
          width: device === "desktop" ? config.width : deviceConfigValue.width,
          maxWidth: device === "desktop" ? config.maxWidth : deviceConfigValue.maxWidth,
          ...(isMobileOrTablet && {
            height: deviceConfigValue.height,
            maxHeight: deviceConfigValue.height,
          }),
        }}
      >
        {/* Floating rotate button for tablet and mobile */}
        {showControls && (
          <Button
            variant="outline"
            size="icon"
            onClick={toggleOrientation}
            className={cn(
              "absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm shadow-lg",
              "hover:bg-white transition-all duration-200",
              "h-10 w-10"
            )}
            title={`Switch to ${orientation === "portrait" ? "landscape" : "portrait"} mode`}
          >
            <div className="relative">
              {device === "mobile" ? (
                <Smartphone 
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    orientation === "landscape" && "rotate-90"
                  )} 
                />
              ) : (
                <Tablet 
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    orientation === "landscape" && "rotate-90"
                  )} 
                />
              )}
            </div>
          </Button>
        )}
        <div className={device === "desktop" ? config.padding : deviceConfigValue.padding}>{children}</div>
      </div>
    </div>
  );
}

