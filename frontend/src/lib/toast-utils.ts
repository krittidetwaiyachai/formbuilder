
import type { ToastData } from "@/components/ui/toaster";
import i18n from '@/i18n';

type ToastFunction = (data: Omit<ToastData, "id">) => void;

let toastFunction: ToastFunction | null = null;
let lastToastTime = 0;
const TOAST_COOLDOWN = 5000;

export const setGlobalToast = (fn: ToastFunction) => {
    toastFunction = fn;
};

export const globalToast = (data: Omit<ToastData, "id">) => {
    const now = Date.now();


    if (data.title === "error.rate_limit.title") {
        if (now - lastToastTime < TOAST_COOLDOWN) {
            return;
        }
        lastToastTime = now;
    }

    if (toastFunction) {

        const translatedData = {
            ...data,
            title: i18n.exists(data.title || '') ? i18n.t(data.title || '') : data.title,
            description: i18n.exists(data.description || '') ? i18n.t(data.description || '') : data.description,
        };
        toastFunction(translatedData);
    } else {
        console.warn("Global toast function incorrect or not initialized", data);
    }
};
