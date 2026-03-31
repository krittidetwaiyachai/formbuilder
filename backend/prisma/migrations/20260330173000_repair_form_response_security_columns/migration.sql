ALTER TABLE "form_responses"
  ADD COLUMN IF NOT EXISTS "normalizedRespondentEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "emailVerificationId" TEXT,
  ADD COLUMN IF NOT EXISTS "submissionGrantId" TEXT,
  ADD COLUMN IF NOT EXISTS "sessionKey" TEXT;

UPDATE "form_responses"
SET "normalizedRespondentEmail" = LOWER(TRIM("respondentEmail"))
WHERE "normalizedRespondentEmail" IS NULL
  AND "respondentEmail" IS NOT NULL
  AND LENGTH(TRIM("respondentEmail")) > 0;

CREATE INDEX IF NOT EXISTS "form_responses_formId_normalizedRespondentEmail_idx"
  ON "form_responses"("formId", "normalizedRespondentEmail");

CREATE INDEX IF NOT EXISTS "form_responses_formId_sessionKey_idx"
  ON "form_responses"("formId", "sessionKey");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'form_email_verifications'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'form_responses_emailVerificationId_fkey'
  ) THEN
    ALTER TABLE "form_responses"
      ADD CONSTRAINT "form_responses_emailVerificationId_fkey"
      FOREIGN KEY ("emailVerificationId") REFERENCES "form_email_verifications"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'form_verified_submission_grants'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'form_responses_submissionGrantId_fkey'
  ) THEN
    ALTER TABLE "form_responses"
      ADD CONSTRAINT "form_responses_submissionGrantId_fkey"
      FOREIGN KEY ("submissionGrantId") REFERENCES "form_verified_submission_grants"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
