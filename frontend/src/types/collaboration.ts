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
