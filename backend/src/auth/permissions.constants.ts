export const Permissions = {
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_BUNDLES: 'MANAGE_BUNDLES',
  MANAGE_ROLES: 'MANAGE_ROLES',
  MANAGE_FORMS: 'MANAGE_FORMS',
  MANAGE_TEMPLATES: 'MANAGE_TEMPLATES',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
  VIEW_SYSTEM_LOGS: 'VIEW_SYSTEM_LOGS',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  VIEW_RESPONSES: 'VIEW_RESPONSES',
  VIEW_USER_DATA: 'VIEW_USER_DATA',
  VIEW_AUDIT_LOG: 'VIEW_AUDIT_LOG',
  EXPORT_DATA: 'EXPORT_DATA',
  DELETE_RESPONSES: 'DELETE_RESPONSES',
  BYPASS_PDPA: 'BYPASS_PDPA',
} as const;

export type Permission = keyof typeof Permissions;

export const ALL_PERMISSIONS = Object.values(Permissions);

export const PERMISSION_LABELS: Record<Permission, string> = {
  MANAGE_USERS: 'จัดการผู้ใช้ (แบน/แก้ไข)',
  MANAGE_BUNDLES: 'จัดการ Field Bundles',
  MANAGE_ROLES: 'จัดการ Roles',
  MANAGE_FORMS: 'จัดการฟอร์มทั้งหมด',
  MANAGE_TEMPLATES: 'จัดการ Form Templates',
  MANAGE_SETTINGS: 'แก้ไขการตั้งค่าระบบ',
  VIEW_SYSTEM_LOGS: 'ดู Activity Logs',
  VIEW_ANALYTICS: 'ดูสถิติและ Analytics',
  VIEW_RESPONSES: 'ดู Responses ทั้งหมด',
  VIEW_USER_DATA: 'ดูข้อมูล User อื่น',
  VIEW_AUDIT_LOG: 'ดู Security Audit Log',
  EXPORT_DATA: 'Export ข้อมูล (CSV/Excel)',
  DELETE_RESPONSES: '⚠️ ลบ Responses',
  BYPASS_PDPA: '⚠️ ดูข้อมูล Encrypted (ฉุกเฉิน)',
};

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  MANAGE_USERS: 'สามารถแบน/ปลดแบน และเปลี่ยน Role ของผู้ใช้ได้',
  MANAGE_BUNDLES: 'สามารถสร้าง แก้ไข และลบ Field Bundles ได้',
  MANAGE_ROLES: 'สามารถแก้ไข permissions ของ Role ได้',
  MANAGE_FORMS: 'สามารถแก้ไขและลบฟอร์มทุกฟอร์ม (ไม่ใช่แค่ของตัวเอง)',
  MANAGE_TEMPLATES: 'สามารถสร้างและแก้ไข Form Templates สำหรับใช้ร่วมกัน',
  MANAGE_SETTINGS: 'สามารถแก้ไขการตั้งค่าระบบทั้งหมด',
  VIEW_SYSTEM_LOGS: 'ดู Activity Logs ของระบบได้ (อ่านอย่างเดียว)',
  VIEW_ANALYTICS: 'ดูสถิติ Dashboard และ Analytics ได้',
  VIEW_RESPONSES: 'ดูคำตอบฟอร์มทั้งหมด (ไม่ใช่แค่ของตัวเอง)',
  VIEW_USER_DATA: 'ดูข้อมูล Profile และกิจกรรมของ User อื่น',
  VIEW_AUDIT_LOG: 'ดู Security Audit Log รวมถึง Login/Logout',
  EXPORT_DATA: 'Export ข้อมูลเป็น CSV หรือ Excel ได้',
  DELETE_RESPONSES: 'ลบคำตอบฟอร์มได้ (ข้อมูลจะหายถาวร)',
  BYPASS_PDPA: 'ดูข้อมูลที่ encrypt ไว้ในกรณีฉุกเฉิน (อันตราย!)',
};

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [...ALL_PERMISSIONS],
  ADMIN: ['VIEW_SYSTEM_LOGS', 'VIEW_ANALYTICS', 'VIEW_RESPONSES', 'VIEW_USER_DATA'],
  EDITOR: ['MANAGE_FORMS', 'VIEW_RESPONSES', 'EXPORT_DATA'],
  VIEWER: ['VIEW_RESPONSES'],
  USER: [],
};
