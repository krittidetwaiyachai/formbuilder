import { mockForms, mockActivityLogs, mockSubmissions } from "./mock-data";
import { Form, FormResponse } from "@/types";
import { ActivityLog, ActiveEditor } from "@/types/collaboration";

export const forms: Form[] = [...mockForms] as any[];
export const activityLogs: ActivityLog[] = [...mockActivityLogs];
export const submissions: FormResponse[] = [...mockSubmissions] as any[];
export const activeEditors: ActiveEditor[] = [];

export const dataStore = {
  forms,
  activityLogs,
  submissions,
  activeEditors
};
