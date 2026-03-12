import { FieldType, FormStatus } from "@/types";
import type { Field, Form, FormResponse } from "@/types";
import type { ActivityLog } from "@/types/collaboration";
export const MOCK_FORM_ELEMENTS: Field[] = [
{
  id: "1",
  formId: "form1",
  type: FieldType.TEXT,
  label: "Short Text",
  required: false,
  order: 0,
  options: {}
},
{
  id: "2",
  formId: "form1",
  type: FieldType.CHECKBOX,
  label: "Interests",
  required: false,
  order: 1,
  options: {
    items: [
    { label: "Coding", value: "coding" },
    { label: "Design", value: "design" }]
  }
}];
export const MOCK_USER_FORMS: Form[] = [
{
  id: "f1",
  title: "Customer Satisfaction Survey",
  status: FormStatus.PUBLISHED,
  responseCount: 150,
  updatedAt: new Date().toISOString(),
  viewCount: 450,
  isQuiz: false,
  createdById: "u1",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  description: "Gather feedback from customers about our services"
},
{
  id: "f2",
  title: "Event Registration",
  status: FormStatus.DRAFT,
  responseCount: 0,
  updatedAt: new Date().toISOString(),
  viewCount: 0,
  isQuiz: false,
  createdById: "u1",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  description: "Registration form for the upcoming annual conference"
}];
export const mockUsers = [
{ id: "u1", name: "Alice Johnson", color: "#EF4444", avatar: "https://i.pravatar.cc/150?u=a" },
{ id: "u2", name: "Bob Smith", color: "#3B82F6", avatar: "https://i.pravatar.cc/150?u=b" },
{ id: "u3", name: "Charlie Brown", color: "#10B981" }];
export const mockActiveEditors = [
{ id: "u2", name: "Bob Smith", avatar: "https://i.pravatar.cc/150?u=b", color: "#3B82F6" },
{ id: "u3", name: "Charlie Brown", color: "#10B981" }];
export const MOCK_ANALYTICS = {
  views: 1250,
  starts: 850,
  completions: 600,
  completionRate: 70.5,
  avgTime: "2m 15s",
  deviceBreakdown: {
    desktop: 55,
    mobile: 35,
    tablet: 10
  }
};
export const MOCK_SUBMISSIONS: FormResponse[] = [
{
  id: "sub1",
  formId: "f1",
  submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  answers: [
  { id: "a1", responseId: "sub1", fieldId: "1", value: "alice@example.com" },
  { id: "a2", responseId: "sub1", fieldId: "2", value: "5" },
  { id: "a3", responseId: "sub1", fieldId: "3", value: "Great experience!" }]
},
{
  id: "sub2",
  formId: "f1",
  submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  answers: []
}];
export const mockForms = MOCK_USER_FORMS;
export const mockSubmissions = MOCK_SUBMISSIONS;
export const mockActivityLogs: ActivityLog[] = [
{
  id: "log1",
  userId: "u1",
  userName: "Alice Johnson",
  action: "created",
  target: "element",
  targetName: "Email Field",
  description: "Added a new email field",
  timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  formId: "f1"
},
{
  id: "log2",
  userId: "u2",
  userName: "Bob Smith",
  action: "updated",
  target: "settings",
  description: "Updated form theme",
  timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  formId: "f1"
}];