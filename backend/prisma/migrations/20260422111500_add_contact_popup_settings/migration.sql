ALTER TABLE "system_settings"
  ADD COLUMN IF NOT EXISTS "supportEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "supportLineId" TEXT;
