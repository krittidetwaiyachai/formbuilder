export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // For avatar background
}

export interface ActivityLog {
  id: string;
  formId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: "created" | "updated" | "deleted" | "published" | "unpublished" | "viewed";
  target: "form" | "element" | "settings";
  targetId?: string;
  targetName?: string;
  description: string;
  timestamp: string;
}

export interface ActiveEditor {
  userId: string;
  userName: string;
  userAvatar?: string;
  userColor: string;
  isActive: boolean;
  lastSeen: string;
}

