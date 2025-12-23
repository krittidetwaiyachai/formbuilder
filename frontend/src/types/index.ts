export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export enum FieldType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  DROPDOWN = 'DROPDOWN',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  DATE = 'DATE',
  TIME = 'TIME',
  RATE = 'RATE',
  HEADER = 'HEADER',
  FULLNAME = 'FULLNAME',
  ADDRESS = 'ADDRESS',
  PARAGRAPH = 'PARAGRAPH',
  SUBMIT = 'SUBMIT',
  DIVIDER = 'DIVIDER',
  SECTION_COLLAPSE = 'SECTION_COLLAPSE',
  PAGE_BREAK = 'PAGE_BREAK',
}

export enum FormStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum SensitivityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: {
    id: string;
    name: RoleType;
    description?: string;
    permissions: any;
  };
}

export interface Field {
  id: string;
  formId: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: any;
  order: number;
  options?: any;
  correctAnswer?: string;
  score?: number;
}

export interface FieldCondition {
  id: string;
  formId: string;
  sourceFieldId: string;
  targetFieldId: string;
  operator: string;
  value: string;
  action: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  isQuiz: boolean;
  quizSettings?: {
    showScore?: boolean;
    showAnswer?: boolean;
    showDetail?: boolean;
  };
  createdById: string;
  createdAt: string;
  updatedAt: string;
  responseCount?: number;
  viewCount?: number;
  fields?: Field[];
  conditions?: FieldCondition[];
  createdBy?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  _count?: {
    responses: number;
  };
  welcomeSettings?: WelcomeScreenSettings;
  thankYouSettings?: ThankYouScreenSettings;
  pageSettings?: PageSettings[];
}

export interface PageSettings {
  id: string; // Unique ID for the page (could be UUID or simple generated ID)
  title: string;
  // We can add more specific page settings here later (e.g., hidden, logic)
}

export interface WelcomeScreenSettings {
  title: string;
  description: string;
  buttonText: string;
  showStartButton: boolean;
  layout?: 'simple' | 'split-left' | 'split-right' | 'cover';
  isActive?: boolean;
}

export interface ThankYouScreenSettings {
  title: string;
  message: string;
  buttonText: string;
  redirectUrl?: string; // Optional URL to redirect
  autoRedirect?: boolean;
  layout?: 'simple' | 'split-left' | 'split-right' | 'cover';
  isActive?: boolean;
}

export interface Preset {
  id: string;
  name: string;
  description?: string;
  isPII: boolean;
  sensitivityLevel: SensitivityLevel;
  version: number;
  isActive: boolean;
  fields?: PresetField[];
}

export interface PresetField {
  id: string;
  presetId: string;
  formId?: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: any;
  order: number;
  options?: any;
}

export interface FormResponse {
  id: string;
  formId: string;
  userId?: string;
  submittedAt: string;
  score?: number;
  totalScore?: number;
  answers?: ResponseAnswer[];
  form?: {
    id: string;
    title: string;
    isQuiz: boolean;
    quizSettings?: any;
  };
}

export interface ResponseAnswer {
  id: string;
  responseId: string;
  fieldId: string;
  value: string;
  isCorrect?: boolean;
  field?: Field;
}

