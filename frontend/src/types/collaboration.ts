export interface ActiveEditor {
  userId: string;
  userName: string;
  userColor: string;
  fieldId?: string;
  isActive?: boolean;
  lastSeen?: string;
}

export type ActivityAction = 'created' | 'updated' | 'deleted' | 'published' | 'unpublished' | 'viewed';
export type ActivityTarget = 'form' | 'element' | 'settings';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  target: ActivityTarget;
  targetId?: string;
  targetName?: string;
  description: string;
  timestamp: string;
  metadata?: any;
  formId: string;
}

export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  color: string;
  selectedFieldId: string | null;
  socketId: string;
}

export interface FieldSelectionPayload {
  formId: string;
  fieldId: string;
  userId: string;
}

export interface JoinFormPayload {
  formId: string;
  userId: string;
  userName: string;
  userEmail: string;
}

