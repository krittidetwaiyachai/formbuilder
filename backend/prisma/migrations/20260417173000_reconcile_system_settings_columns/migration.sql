ALTER TABLE "system_settings"
  ADD COLUMN IF NOT EXISTS "smtpHost" TEXT,
  ADD COLUMN IF NOT EXISTS "smtpPort" INTEGER,
  ADD COLUMN IF NOT EXISTS "smtpSecure" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "smtpUser" TEXT,
  ADD COLUMN IF NOT EXISTS "smtpPass" TEXT,
  ADD COLUMN IF NOT EXISTS "smtpFrom" TEXT,
  ADD COLUMN IF NOT EXISTS "smtpFromName" TEXT,
  ADD COLUMN IF NOT EXISTS "inviteExpiryDays" INTEGER DEFAULT 3;

UPDATE "system_settings"
SET "inviteExpiryDays" = 3
WHERE "inviteExpiryDays" IS NULL;

ALTER TABLE "system_settings"
  ALTER COLUMN "smtpSecure" SET DEFAULT false,
  ALTER COLUMN "inviteExpiryDays" SET DEFAULT 3,
  ALTER COLUMN "inviteExpiryDays" SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'system_settings' AND column_name = 'settings'
  ) THEN
    EXECUTE $SQL$
      UPDATE "system_settings"
      SET
        "smtpHost" = COALESCE(
          "smtpHost",
          NULLIF(COALESCE("settings"->'email'->>'smtpHost', "settings"->>'smtpHost'), '')
        ),
        "smtpPort" = COALESCE(
          "smtpPort",
          NULLIF(COALESCE("settings"->'email'->>'smtpPort', "settings"->>'smtpPort'), '')::INTEGER
        ),
        "smtpSecure" = COALESCE(
          "smtpSecure",
          NULLIF(COALESCE("settings"->'email'->>'smtpSecure', "settings"->>'smtpSecure'), '')::BOOLEAN,
          false
        ),
        "smtpUser" = COALESCE(
          "smtpUser",
          NULLIF(COALESCE("settings"->'email'->>'smtpUser', "settings"->>'smtpUser'), '')
        ),
        "smtpPass" = COALESCE(
          "smtpPass",
          NULLIF(COALESCE("settings"->'email'->>'smtpPass', "settings"->>'smtpPass'), '')
        ),
        "smtpFrom" = COALESCE(
          "smtpFrom",
          NULLIF(COALESCE("settings"->'email'->>'smtpFrom', "settings"->>'smtpFrom'), '')
        ),
        "smtpFromName" = COALESCE(
          "smtpFromName",
          NULLIF(COALESCE("settings"->'email'->>'smtpFromName', "settings"->>'smtpFromName'), '')
        ),
        "inviteExpiryDays" = COALESCE(
          "inviteExpiryDays",
          NULLIF(COALESCE("settings"->'invite'->>'expiryDays', "settings"->>'inviteExpiryDays'), '')::INTEGER,
          3
        )
      WHERE "settings" IS NOT NULL;
    $SQL$;
  END IF;
END $$;
