export * from './enums';
export * from './field-validation';
export * from './typed-fields';
import { FieldType, RoleType, FormStatus } from './enums';
import { FieldWidthType, LabelAlignmentType } from './field-schema';
import type { FieldValidation } from './field-validation';
import type { FieldOptions } from './typed-fields';

import type { RateOptions } from '@/components/form-builder/fields/rate/schema';
import type { AddressOptions } from '@/components/form-builder/fields/address/schema';
import type { CheckboxOption } from '@/components/form-builder/fields/checkbox/schema';
import type { DateOptions } from '@/components/form-builder/fields/date/schema';
import type { DropdownValidation } from '@/components/form-builder/fields/dropdown/schema';
import type { EmailOptions } from '@/components/form-builder/fields/email/schema';
import type { FullNameOptions } from '@/components/form-builder/fields/full-name/schema';
import type { HeaderOptions } from '@/components/form-builder/fields/header/schema';
import type { LongTextOptions } from '@/components/form-builder/fields/long-text/schema';
import type { NumberOptions } from '@/components/form-builder/fields/number/schema';
import type { ParagraphOptions } from '@/components/form-builder/fields/paragraph/schema';
import type { PhoneOptions } from '@/components/form-builder/fields/phone/schema';
import type { RadioValidation } from '@/components/form-builder/fields/radio/schema';
import type { ShortTextOptions } from '@/components/form-builder/fields/short-text/schema';
import type { SubmitOptions } from '@/components/form-builder/fields/submit/schema';
import type { TimeOptions } from '@/components/form-builder/fields/time/schema';



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
    permissions: Record<string, boolean>;
  };
}

export interface Field {
  id: string;
  formId: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation;
  order: number;
  options?: FieldOptions;
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
  isPII?: boolean;
  explanation?: string;
  imageUrl?: string;
  imageWidth?: string;
  videoUrl?: string;
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
    timeLimit?: number;
    startTime?: string;
    endTime?: string;
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
  shuffleQuestions?: boolean;
  themeName?: string;
  buttonStyle?: 'filled' | 'outlined' | 'ghost';
}

export type FormSettingsProperties = FormSettings;

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  backgroundType: 'color' | 'image' | 'gradient';
  textColor: string;
  buttonStyle: 'filled' | 'outlined' | 'ghost';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  fontFamily: string;
  backgroundImage?: string;
  themeName?: string;
}

export interface PageSettings {
  id: string;
  title: string;

}

export interface WelcomeScreenSettings {
  title: string;
  description: string;
  buttonText: string;
  showStartButton: boolean;
  layout?: 'simple' | 'split-left' | 'split-right' | 'cover';
  isActive?: boolean;
  backgroundImage?: string;
  icon?: 'check' | 'thumbsUp' | 'heart' | 'star' | 'trophy' | 'party' | 'rocket' | 'sparkles';
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
  icon?: 'check' | 'thumbsUp' | 'heart' | 'star' | 'trophy' | 'party' | 'rocket' | 'sparkles';
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

  version: number;
  isActive: boolean;
  options?: {
    icon?: string;
    color?: string;
    bg?: string;
    [key: string]: unknown;
  };
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
  validation?: FieldValidation;
  order: number;
  options?: FieldOptions;
}

export interface FormResponse {
  id: string;
  formId: string;
  userId?: string;
  respondentEmail?: string;
  submittedAt: string;
  score?: number;
  totalScore?: number;
  answers?: ResponseAnswer[];
  form?: {
    id: string;
    title: string;
    isQuiz: boolean;
    quizSettings?: Form['quizSettings'];
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

