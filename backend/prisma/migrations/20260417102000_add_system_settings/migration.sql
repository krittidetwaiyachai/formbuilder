CREATE TABLE IF NOT EXISTS "system_settings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "smtpHost" TEXT,
  "smtpPort" INTEGER,
  "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
  "smtpUser" TEXT,
  "smtpPass" TEXT,
  "smtpFrom" TEXT,
  "smtpFromName" TEXT,
  "inviteExpiryDays" INTEGER NOT NULL DEFAULT 3,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
