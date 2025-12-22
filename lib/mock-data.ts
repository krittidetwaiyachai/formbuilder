import { FormElement, FormSchema, FormSubmission } from "@/types/form";
import { User, ActivityLog, ActiveEditor } from "@/types/collaboration";

// Mock form elements for FormPreview
export const MOCK_FORM_ELEMENTS: FormElement[] = [
  {
    id: "1",
    type: "heading",
    label: "",
    required: false,
    content: "Customer Feedback Survey",
  },
  {
    id: "2",
    type: "paragraph",
    label: "",
    required: false,
    content: "We value your feedback. Please take a few minutes to share your thoughts with us.",
  },
  {
    id: "3",
    type: "text",
    label: "Full Name",
    placeholder: "Enter your full name",
    required: true,
    helperText: "Please enter your first and last name",
  },
  {
    id: "4",
    type: "email",
    label: "Email Address",
    placeholder: "your.email@example.com",
    required: true,
    helperText: "We'll never share your email with anyone else",
  },
  {
    id: "5",
    type: "select",
    label: "How did you hear about us?",
    required: true,
    options: [
      { id: "opt-1", label: "Social Media", value: "social" },
      { id: "opt-2", label: "Search Engine", value: "search" },
      { id: "opt-3", label: "Friend/Colleague", value: "friend" },
      { id: "opt-4", label: "Advertisement", value: "ad" },
      { id: "opt-5", label: "Other", value: "other" },
    ],
  },
  {
    id: "6",
    type: "radio",
    label: "Overall Satisfaction",
    required: true,
    options: [
      { id: "opt-1", label: "Very Satisfied", value: "5" },
      { id: "opt-2", label: "Satisfied", value: "4" },
      { id: "opt-3", label: "Neutral", value: "3" },
      { id: "opt-4", label: "Dissatisfied", value: "2" },
      { id: "opt-5", label: "Very Dissatisfied", value: "1" },
    ],
  },
  {
    id: "7",
    type: "checkbox",
    label: "What features would you like to see? (Select all that apply)",
    required: false,
    options: [
      { id: "opt-1", label: "Mobile App", value: "mobile" },
      { id: "opt-2", label: "Better Support", value: "support" },
      { id: "opt-3", label: "More Integrations", value: "integrations" },
      { id: "opt-4", label: "Lower Pricing", value: "pricing" },
    ],
  },
  {
    id: "8",
    type: "textarea",
    label: "Additional Comments",
    placeholder: "Share any additional thoughts or suggestions...",
    required: false,
    rows: 5,
    helperText: "Optional: Tell us more about your experience",
  },
  {
    id: "9",
    type: "rating",
    label: "Rate your experience",
    required: true,
    max: 5,
  },
];

// Mock analytics data
export interface AnalyticsData {
  totalViews: number;
  totalSubmissions: number;
  submissionRate: number;
  bounceRate: number;
  dailyVisits: Array<{
    date: string;
    views: number;
    submissions: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
}

export const MOCK_ANALYTICS: AnalyticsData = {
  totalViews: 523,
  totalSubmissions: 142,
  submissionRate: 27.2,
  bounceRate: 32.5,
  dailyVisits: [
    { date: "Jan 15", views: 45, submissions: 12 },
    { date: "Jan 16", views: 52, submissions: 15 },
    { date: "Jan 17", views: 48, submissions: 10 },
    { date: "Jan 18", views: 61, submissions: 18 },
    { date: "Jan 19", views: 55, submissions: 14 },
    { date: "Jan 20", views: 67, submissions: 20 },
    { date: "Jan 21", views: 72, submissions: 22 },
  ],
  deviceBreakdown: [
    { device: "Desktop", count: 64, percentage: 45 },
    { device: "Mobile", count: 43, percentage: 30 },
    { device: "Tablet", count: 35, percentage: 25 },
  ],
};

export const mockForms: FormSchema[] = [
  {
    id: "1",
    title: "Customer Feedback Survey",
    description: "Gather feedback from our customers",
    status: "published",
    elements: [],
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-20T14:30:00Z",
    responseCount: 142,
    viewCount: 523,
  },
  {
    id: "2",
    title: "Event Registration Form",
    description: "Register for our upcoming event",
    status: "draft",
    elements: [],
    createdAt: "2026-01-18T09:00:00Z",
    updatedAt: "2026-01-22T11:15:00Z",
    responseCount: 0,
    viewCount: 0,
  },
  {
    id: "3",
    title: "Product Inquiry Form",
    description: "Get more information about our products",
    status: "published",
    elements: [],
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-01-19T16:45:00Z",
    responseCount: 89,
    viewCount: 312,
  },
  {
    id: "4",
    title: "Job Application Form",
    description: "Apply for open positions",
    status: "published",
    elements: [],
    createdAt: "2026-01-12T12:00:00Z",
    updatedAt: "2026-01-21T10:20:00Z",
    responseCount: 234,
    viewCount: 891,
  },
  {
    id: "5",
    title: "Contact Us Form",
    description: "Get in touch with our team",
    status: "published",
    elements: [],
    createdAt: "2026-01-08T14:00:00Z",
    updatedAt: "2026-01-18T09:30:00Z",
    responseCount: 156,
    viewCount: 445,
  },
  {
    id: "6",
    title: "Newsletter Subscription",
    description: "Subscribe to our newsletter",
    status: "draft",
    elements: [],
    createdAt: "2026-01-20T11:00:00Z",
    updatedAt: "2026-01-23T15:20:00Z",
    responseCount: 0,
    viewCount: 0,
  },
  {
    id: "7",
    title: "Customer Satisfaction Survey",
    description: "Rate your experience with us",
    status: "published",
    elements: [],
    createdAt: "2026-01-05T08:00:00Z",
    updatedAt: "2026-01-17T13:45:00Z",
    responseCount: 298,
    viewCount: 1023,
  },
  {
    id: "8",
    title: "Workshop Registration",
    description: "Sign up for our upcoming workshop",
    status: "published",
    elements: [],
    createdAt: "2026-01-14T10:00:00Z",
    updatedAt: "2026-01-20T16:00:00Z",
    responseCount: 67,
    viewCount: 234,
  },
  {
    id: "9",
    title: "Feedback Form Template",
    description: "Template for collecting feedback",
    status: "draft",
    elements: [],
    createdAt: "2026-01-22T09:00:00Z",
    updatedAt: "2026-01-23T10:00:00Z",
    responseCount: 0,
    viewCount: 0,
  },
  {
    id: "10",
    title: "Product Demo Request",
    description: "Request a product demonstration",
    status: "published",
    elements: [],
    createdAt: "2026-01-11T12:00:00Z",
    updatedAt: "2026-01-19T14:30:00Z",
    responseCount: 123,
    viewCount: 567,
  },
  {
    id: "11",
    title: "Support Ticket Form",
    description: "Submit a support ticket",
    status: "published",
    elements: [],
    createdAt: "2026-01-09T08:00:00Z",
    updatedAt: "2026-01-18T11:20:00Z",
    responseCount: 89,
    viewCount: 345,
  },
  {
    id: "12",
    title: "Beta Testing Application",
    description: "Apply to be a beta tester",
    status: "draft",
    elements: [],
    createdAt: "2026-01-21T10:00:00Z",
    updatedAt: "2026-01-23T12:00:00Z",
    responseCount: 0,
    viewCount: 0,
  },
];

export const mockSubmissions: FormSubmission[] = [
  {
    id: "sub1",
    formId: "1",
    data: { name: "John Doe", email: "john@example.com", rating: 5 },
    submittedAt: "2026-01-20T10:30:00Z",
    device: "desktop",
  },
  {
    id: "sub2",
    formId: "1",
    data: { name: "Jane Smith", email: "jane@example.com", rating: 4 },
    submittedAt: "2026-01-20T09:15:00Z",
    device: "mobile",
  },
  {
    id: "sub3",
    formId: "1",
    data: { name: "Bob Johnson", email: "bob@example.com", rating: 5 },
    submittedAt: "2026-01-19T16:45:00Z",
    device: "tablet",
  },
  {
    id: "sub4",
    formId: "1",
    data: { name: "Alice Williams", email: "alice@example.com", rating: 3 },
    submittedAt: "2026-01-19T14:20:00Z",
    device: "desktop",
  },
  {
    id: "sub5",
    formId: "1",
    data: { name: "Charlie Brown", email: "charlie@example.com", rating: 5 },
    submittedAt: "2026-01-18T11:10:00Z",
    device: "mobile",
  },
];

// Mock users
export const mockUsers: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    color: "#3B82F6",
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    color: "#10B981",
  },
  {
    id: "user3",
    name: "Bob Johnson",
    email: "bob@example.com",
    color: "#F59E0B",
  },
  {
    id: "user4",
    name: "Alice Williams",
    email: "alice@example.com",
    color: "#EF4444",
  },
];

// Mock active editors (users currently editing)
export const mockActiveEditors: Record<string, ActiveEditor[]> = {
  "1": [
    {
      userId: "user1",
      userName: "John Doe",
      userColor: "#3B82F6",
      isActive: true,
      lastSeen: new Date().toISOString(),
    },
    {
      userId: "user2",
      userName: "Jane Smith",
      userColor: "#10B981",
      isActive: true,
      lastSeen: new Date().toISOString(),
    },
  ],
  "2": [
    {
      userId: "user3",
      userName: "Bob Johnson",
      userColor: "#F59E0B",
      isActive: true,
      lastSeen: new Date().toISOString(),
    },
  ],
};

// Mock activity logs
export const mockActivityLogs: ActivityLog[] = [
  {
    id: "act1",
    formId: "1",
    userId: "user1",
    userName: "John Doe",
    action: "created",
    target: "form",
    description: "Created the form",
    timestamp: "2026-01-15T10:00:00Z",
  },
  {
    id: "act2",
    formId: "1",
    userId: "user1",
    userName: "John Doe",
    action: "updated",
    target: "element",
    targetId: "elem1",
    targetName: "Full Name",
    description: "Updated element 'Full Name'",
    timestamp: "2026-01-15T10:30:00Z",
  },
  {
    id: "act3",
    formId: "1",
    userId: "user2",
    userName: "Jane Smith",
    action: "updated",
    target: "element",
    targetId: "elem2",
    targetName: "Email Address",
    description: "Updated element 'Email Address'",
    timestamp: "2026-01-15T11:00:00Z",
  },
  {
    id: "act4",
    formId: "1",
    userId: "user1",
    userName: "John Doe",
    action: "published",
    target: "form",
    description: "Published the form",
    timestamp: "2026-01-20T14:30:00Z",
  },
  {
    id: "act5",
    formId: "1",
    userId: "user2",
    userName: "Jane Smith",
    action: "viewed",
    target: "form",
    description: "Viewed the form",
    timestamp: "2026-01-21T09:15:00Z",
  },
  {
    id: "act6",
    formId: "2",
    userId: "user3",
    userName: "Bob Johnson",
    action: "created",
    target: "form",
    description: "Created the form",
    timestamp: "2026-01-18T09:00:00Z",
  },
];

// Export aliases for demo components
export const MOCK_USER_FORMS = mockForms;
export const MOCK_SUBMISSIONS = mockSubmissions;

