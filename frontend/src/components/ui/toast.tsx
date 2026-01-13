"use client";

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/ui/utils";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = "default", duration = 3000, onClose }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [progress, setProgress] = React.useState(100);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      // Start progress animation
      const progressTimer = setTimeout(() => {
        setProgress(0);
      }, 100);

      return () => {
        clearTimeout(timer);
        clearTimeout(progressTimer);
      };
    }, [duration, onClose]);

    const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    };

    const icons = {
      success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      error: <AlertCircle className="h-5 w-5 text-red-600" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      info: <Info className="h-5 w-5 text-blue-600" />,
      default: null,
    };

    const styles = {
      success: "bg-green-50 border-green-200 text-green-900",
      error: "bg-red-50 border-red-200 text-red-900",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
      info: "bg-blue-50 border-blue-200 text-blue-900",
      default: "bg-white border-gray-200 text-gray-900",
    };

    const progressStyles = {
      success: "bg-green-600",
      error: "bg-red-600",
      warning: "bg-yellow-600",
      info: "bg-blue-600",
      default: "bg-gray-900",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col gap-0 rounded-lg border shadow-lg min-w-[300px] max-w-[400px] transition-all duration-300 overflow-hidden",
          styles[variant],
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
        )}
      >
        <div className="flex items-start gap-3 p-4">
          {icons[variant] && <div className="flex-shrink-0">{icons[variant]}</div>}
          <div className="flex-1">
            {title && <div className="font-semibold text-sm mb-1">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="h-1 w-full bg-black/5 mt-auto">
          <div 
            className={cn("h-full transition-all ease-linear", progressStyles[variant])}
            style={{ 
              width: `${progress}%`, 
              transitionDuration: `${duration}ms` 
            }}
          />
        </div>
      </div>
    );
  }
);
Toast.displayName = "Toast";

export { Toast };

