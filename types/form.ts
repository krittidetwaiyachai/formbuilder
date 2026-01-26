export type FormElementType = 
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file'
  | 'rating'
  | 'heading'
  | 'paragraph';

export interface FormElementOption {
  id: string;
  label: string;
  value: string;
}

export interface FormElement {
  id: string;
  type: FormElementType;
  label: string;
  placeholder?: string;
  helperText?: string;
  required: boolean;
  options?: FormElementOption[]; 
  min?: number; 
  max?: number; 
  rows?: number; 
  accept?: string; 
  content?: string; 
  headingImage?: string; 
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  backgroundImage?: string;
  backgroundType: 'color' | 'image' | 'gradient';
  textColor: string;
  buttonStyle: 'filled' | 'outlined' | 'ghost';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  fontFamily: string;
}

export interface FormSettings {
  allowMultipleSubmissions: boolean;
  showProgressBar: boolean;
  showPageNumbers: boolean;
  requireLogin: boolean;
  redirectUrl?: string;
  successMessage?: string;
  emailNotifications?: boolean;
  notificationEmails?: string[];
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published';
  elements: FormElement[];
  theme?: FormTheme;
  settings?: FormSettings;
  createdAt: string;
  updatedAt: string;
  responseCount?: number;
  viewCount?: number;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
  device?: 'desktop' | 'tablet' | 'mobile';
}

