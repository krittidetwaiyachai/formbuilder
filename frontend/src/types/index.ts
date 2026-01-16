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
  GROUP = 'GROUP',
  MATRIX = 'MATRIX',
  TABLE = 'TABLE',
  FILE = 'FILE',
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
  photoUrl?: string;
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
  shrink?: boolean;
  correctAnswer?: string;
  score?: number;
  groupId?: string;
  helperText?: string;
  rows?: number;
  accept?: string;
  max?: number;
  min?: number;
  content?: string;
  headingImage?: string;
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

export interface LogicCondition {
  id: string;
  fieldId: string;
  operator: string;
  value: string;
}

export interface LogicAction {
  id: string;
  type: 'show' | 'hide';
  fieldId: string;
}

export interface LogicRule {
  id: string;
  name: string;
  logicType: 'and' | 'or';
  conditions: LogicCondition[];
  actions: LogicAction[];
}

export interface Form {
  id: string;
  folderId?: string;
  title: string;
  description?: string;
  status: FormStatus;
  isQuiz: boolean;
  quizSettings?: {
    totalScore?: number;
    releaseScoreMode?: 'immediately' | 'manual';
    showScore?: boolean;
    showAnswer?: boolean;
    showDetail?: boolean;
    allowViewMissedQuestions?: boolean;
    showExplanation?: boolean;
    shuffleQuestions?: boolean;
    requireSignIn?: boolean;
    timeLimit?: number; // Time limit in minutes
    startTime?: string; // ISO date string for when quiz opens
    endTime?: string; // ISO date string for when quiz closes
  };
  createdById: string;
  createdAt: string;
  updatedAt: string;
  responseCount?: number;
  viewCount?: number;
  fields?: Field[];
  conditions?: FieldCondition[];
  logicRules?: LogicRule[];
  createdBy?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
  };
  logoUrl?: string;
  collaborators?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
  }[];
  _count?: {
    responses: number;
  };
  welcomeSettings?: WelcomeScreenSettings;
  thankYouSettings?: ThankYouScreenSettings;
  pageSettings?: PageSettings[];
  settings?: FormSettings;
}

export interface FormSettings {
  submitButtonText?: string;
  successMessage?: string;
  allowMultipleSubmissions?: boolean;
  showProgressBar?: boolean;
  collectEmail?: boolean;
  footerText?: string;
  showQuestionNumber?: boolean;
  responseLimit?: number;
  formLayout?: 'classic' | 'card';
  backgroundImage?: string;
  backgroundType?: 'color' | 'image' | 'gradient';
  backgroundColor?: string;
  primaryColor?: string;
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  textColor?: string;
  fontFamily?: string;
  notificationEmails?: string[];
  requireLogin?: boolean;
  showPageNumbers?: boolean;
  redirectUrl?: string;
  emailNotifications?: boolean;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  backgroundType: 'color' | 'image' | 'gradient';
  textColor: string;
  buttonStyle: 'filled' | 'outlined' | 'ghost';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  fontFamily: string;
  backgroundImage?: string;
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
  backgroundImage?: string;
  iconColor?: 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'red' | 'yellow' | 'gray' | 'white';
}

export interface ThankYouScreenSettings {
  title: string;
  message: string;
  buttonText: string;
  redirectUrl?: string;
  autoRedirect?: boolean;
  redirectDelay?: number;
  layout?: 'simple' | 'split-left' | 'split-right' | 'cover';
  isActive?: boolean;
  backgroundImage?: string;
  footerText?: string;
  showFooter?: boolean;
  iconColor?: 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'red' | 'yellow' | 'gray' | 'white';
  backgroundColor?: string;
  showButton?: boolean;
  buttonLink?: string;
  showSocialShare?: boolean;
  showConfetti?: boolean;
}

export interface Bundle {
  id: string;
  name: string;
  description?: string;
  isPII: boolean;
  sensitivityLevel: SensitivityLevel;
  version: number;
  isActive: boolean;
  fields?: BundleField[];
}

export interface BundleField {
  id: string;
  bundleId: string;
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

