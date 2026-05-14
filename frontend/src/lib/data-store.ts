import { mockForms, mockActivityLogs, mockSubmissions } from "./mock-data";
import type { Form, FormResponse } from "@/types";
import type { ActivityLog, ActiveEditor } from "@/types/collaboration";
export const forms: Form[] = [...mockForms] as Form[];
export const activityLogs: ActivityLog[] = [...mockActivityLogs];
export const submissions: FormResponse[] = [...mockSubmissions] as FormResponse[];
export const activeEditors: ActiveEditor[] = [];
export const dataStore = {
  forms,
  activityLogs,
  submissions,
  activeEditors
};