-- Security Hardening Migration
-- WARNING: Run cleanup queries BEFORE creating unique indexes
-- Schedule during maintenance window

-- ============================================
-- STEP 1: Cleanup duplicate submissions
-- ============================================

-- Check for duplicates first (preview)
SELECT "formId", "normalizedRespondentEmail", COUNT(*) as cnt
FROM "form_responses"
WHERE "normalizedRespondentEmail" IS NOT NULL
GROUP BY "formId", "normalizedRespondentEmail"
HAVING COUNT(*) > 1;

SELECT "formId", "fingerprint", COUNT(*) as cnt
FROM "form_responses"
WHERE "fingerprint" IS NOT NULL
GROUP BY "formId", "fingerprint"
HAVING COUNT(*) > 1;

SELECT "formId", "ipAddress", COUNT(*) as cnt
FROM "form_responses"
WHERE "ipAddress" IS NOT NULL
GROUP BY "formId", "ipAddress"
HAVING COUNT(*) > 1;

-- Delete duplicates, keep earliest submission per (formId, identifier)
-- UNCOMMENT TO RUN AFTER REVIEW:

-- DELETE FROM "form_responses" WHERE id IN (
--   SELECT id FROM (
--     SELECT id, ROW_NUMBER() OVER (
--       PARTITION BY "formId", "normalizedRespondentEmail"
--       ORDER BY "submittedAt" ASC
--     ) as rn
--     FROM "form_responses"
--     WHERE "normalizedRespondentEmail" IS NOT NULL
--   ) sub WHERE rn > 1
-- );

-- ============================================
-- STEP 2: Create partial unique indexes
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS "uq_response_form_email"
  ON "form_responses" ("formId", "normalizedRespondentEmail")
  WHERE "normalizedRespondentEmail" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_response_form_fingerprint"
  ON "form_responses" ("formId", "fingerprint")
  WHERE "fingerprint" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_response_form_ip"
  ON "form_responses" ("formId", "ipAddress")
  WHERE "ipAddress" IS NOT NULL;

-- ============================================
-- STEP 3: Add grant session binding columns
-- ============================================

ALTER TABLE "form_verified_submission_grants"
  ADD COLUMN IF NOT EXISTS "ipHash" TEXT,
  ADD COLUMN IF NOT EXISTS "sessionKeyHash" TEXT;

-- Index for grant lookup with session binding
CREATE INDEX IF NOT EXISTS "idx_grant_ip_session"
  ON "form_verified_submission_grants" ("formId", "ipHash");
