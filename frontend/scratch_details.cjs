const fs = require('fs');

let cnt = fs.readFileSync('src/pages/admin/AdminLogs.tsx', 'utf-8');

const additionalCases = `
    case "LOCAL_USER_CREATED":
      return t("admin.logs.details_text.local_user_created", { email: detailRecord.email as string });
    case "FORM_DELETED":
      return t("admin.logs.details_text.form_deleted", { formId: detailRecord.formId as string });
    case "USER_BANNED":
      return t("admin.logs.details_text.user_banned", { targetUserId: detailRecord.targetUserId as string });
    case "USER_UNBANNED":
      return t("admin.logs.details_text.user_unbanned", { targetUserId: detailRecord.targetUserId as string });
    case "USER_ROLE_UPDATED":
      return t("admin.logs.details_text.user_role_updated", { 
        targetUserId: detailRecord.targetUserId as string,
        newRoleId: detailRecord.newRoleId as string 
      });
    case "ROLE_DESCRIPTION_UPDATED":
      return t("admin.logs.details_text.role_description_updated");
    case "SYSTEM_EMAIL_SETTINGS_UPDATED":
      return t("admin.logs.details_text.system_email_settings_updated");
    case "SYSTEM_INVITE_SETTINGS_UPDATED":
      return t("admin.logs.details_text.system_invite_settings_updated");
    case "SYSTEM_CONTACT_SETTINGS_UPDATED":
      return t("admin.logs.details_text.system_contact_settings_updated");
    case "SYSTEM_BRANDING_SETTINGS_UPDATED":
      return t("admin.logs.details_text.system_branding_settings_updated");
    case "SYSTEM_AUTH_POLICY_SETTINGS_UPDATED":
      return t("admin.logs.details_text.system_auth_policy_settings_updated");
    case "SYSTEM_PASSWORD_POLICY_SETTINGS_UPDATED":
      return t("admin.logs.details_text.system_password_policy_settings_updated");
    case "SYSTEM_RATE_LIMIT_SETTINGS_UPDATED":
      return t("admin.logs.details_text.system_rate_limit_settings_updated");
    case "SYSTEM_RETENTION_SETTINGS_UPDATED":
      return t("admin.logs.details_text.system_retention_settings_updated");
    case "SYSTEM_BACKUP_SETTINGS_UPDATED":
      return t("admin.logs.details_text.system_backup_settings_updated");
    case "SYSTEM_RETENTION_CLEANUP_RUN":
      return t("admin.logs.details_text.system_retention_cleanup_run");
    case "SYSTEM_BACKUP_RUN":
      return t("admin.logs.details_text.system_backup_run");
    case "SYSTEM_BACKUP_RESTORED":
      return t("admin.logs.details_text.system_backup_restored");
    case "SYSTEM_BACKUP_DELETED":
      return t("admin.logs.details_text.system_backup_deleted");
    case "SYSTEM_TEST_EMAIL_SENT":
      return t("admin.logs.details_text.system_test_email_sent");
`;

cnt = cnt.replace('case "CREATED":', additionalCases + '\n    case "CREATED":');
fs.writeFileSync('src/pages/admin/AdminLogs.tsx', cnt);

const thPath = 'src/i18n/locales/th/admin.ts';
let th = fs.readFileSync(thPath, 'utf-8');

const tStrings = `
  "admin.logs.table.system": "ระบบกลาง",
  "admin.logs.details_text.local_user_created": "สร้างผู้ใช้ (Local) ใหม่ {{email}}",
  "admin.logs.details_text.form_deleted": "ลบฟอร์ม {{formId}} ถาวร",
  "admin.logs.details_text.user_banned": "ระงับการใช้งานผู้ใช้ระหัส {{targetUserId}}",
  "admin.logs.details_text.user_unbanned": "ยกเลิกระงับการใช้งานผู้ใช้ระหัส {{targetUserId}}",
  "admin.logs.details_text.user_role_updated": "แก้ไข Role ของผู้ใช้ระหัส {{targetUserId}}",
  "admin.logs.details_text.role_description_updated": "แก้ไขคำอธิบาย Role",
  "admin.logs.details_text.system_email_settings_updated": "อัปเดตตั้งค่า System Email (SMTP)",
  "admin.logs.details_text.system_invite_settings_updated": "อัปเดตตั้งค่า Invite Expiry",
  "admin.logs.details_text.system_contact_settings_updated": "อัปเดตตั้งค่าหน้าต่าง Contact",
  "admin.logs.details_text.system_branding_settings_updated": "อัปเดตตั้งค่า Branding ของระบบ",
  "admin.logs.details_text.system_auth_policy_settings_updated": "อัปเดตตั้งค่านโยบาย Login",
  "admin.logs.details_text.system_password_policy_settings_updated": "อัปเดตตั้งค่านโยบายรหัสผ่าน",
  "admin.logs.details_text.system_rate_limit_settings_updated": "อัปเดตตั้งค่า Rate Limit",
  "admin.logs.details_text.system_retention_settings_updated": "อัปเดตตั้งค่าการเก็บรักษาข้อมูล (Retention)",
  "admin.logs.details_text.system_backup_settings_updated": "อัปเดตตั้งค่าการสำรองข้อมูล (Backup)",
  "admin.logs.details_text.system_retention_cleanup_run": "สั่งล้างข้อมูลหมดอายุ (Cleanup)",
  "admin.logs.details_text.system_backup_run": "สั่งสำรองข้อมูลระบบ (Backup) ทันที",
  "admin.logs.details_text.system_backup_restored": "กู้คืนระบบจากไฟล์สำรองข้อมูล (Restore)",
  "admin.logs.details_text.system_backup_deleted": "ลบไฟล์สำรองข้อมูลระบบ",
  "admin.logs.details_text.system_test_email_sent": "สั่งส่ง Test Email เพื่อตรวจสอบระบบ SMTP",
`;

th = th.replace('"admin.logs.details_text.generic": "มีการเปลี่ยนแปลงข้อมูล",', '"admin.logs.details_text.generic": "มีการเปลี่ยนแปลงข้อมูล",\n' + tStrings);

fs.writeFileSync(thPath, th);

