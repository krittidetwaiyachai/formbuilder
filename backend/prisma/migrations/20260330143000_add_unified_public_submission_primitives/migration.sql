DO $$
BEGIN
  CREATE TYPE "SubmissionIdentityLockType" AS ENUM ('CANONICAL_EMAIL', 'SESSION', 'IP');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE "public_submission_sessions" (
  "id" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "ipHash" TEXT,
  "userAgentHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "submittedAt" TIMESTAMP(3),

  CONSTRAINT "public_submission_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "submission_verification_requests" (
  "id" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "canonicalEmailNormalized" TEXT NOT NULL,
  "canonicalEmailHash" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "requestedIpHash" TEXT,
  "requestedUserAgentHash" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "invalidatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "submission_verification_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "submission_identity_locks" (
  "id" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
  "lockType" "SubmissionIdentityLockType" NOT NULL,
  "lockKeyHash" TEXT NOT NULL,
  "responseId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "submission_identity_locks_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "form_responses"
  ADD COLUMN IF NOT EXISTS "submissionSessionId" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationRequestId" TEXT;

CREATE UNIQUE INDEX "public_submission_sessions_tokenHash_key"
  ON "public_submission_sessions"("tokenHash");

CREATE INDEX "public_submission_sessions_formId_expiresAt_idx"
  ON "public_submission_sessions"("formId", "expiresAt");

CREATE INDEX "public_submission_sessions_formId_submittedAt_idx"
  ON "public_submission_sessions"("formId", "submittedAt");

CREATE UNIQUE INDEX "submission_verification_requests_tokenHash_key"
  ON "submission_verification_requests"("tokenHash");

CREATE INDEX "submission_verification_requests_formId_sessionId_createdAt_idx"
  ON "submission_verification_requests"("formId", "sessionId", "createdAt");

CREATE INDEX "submission_verification_requests_formId_canonicalEmailHash_createdAt_idx"
  ON "submission_verification_requests"("formId", "canonicalEmailHash", "createdAt");

CREATE INDEX "submission_verification_requests_expiresAt_idx"
  ON "submission_verification_requests"("expiresAt");

CREATE UNIQUE INDEX "submission_identity_locks_responseId_key"
  ON "submission_identity_locks"("responseId");

CREATE UNIQUE INDEX "submission_identity_locks_formId_lockType_lockKeyHash_key"
  ON "submission_identity_locks"("formId", "lockType", "lockKeyHash");

CREATE INDEX "form_responses_submissionSessionId_idx"
  ON "form_responses"("submissionSessionId");

CREATE INDEX "form_responses_verificationRequestId_idx"
  ON "form_responses"("verificationRequestId");

ALTER TABLE "public_submission_sessions"
  ADD CONSTRAINT "public_submission_sessions_formId_fkey"
  FOREIGN KEY ("formId") REFERENCES "forms"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "submission_verification_requests"
  ADD CONSTRAINT "submission_verification_requests_formId_fkey"
  FOREIGN KEY ("formId") REFERENCES "forms"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "submission_verification_requests"
  ADD CONSTRAINT "submission_verification_requests_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "public_submission_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "submission_identity_locks"
  ADD CONSTRAINT "submission_identity_locks_formId_fkey"
  FOREIGN KEY ("formId") REFERENCES "forms"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "submission_identity_locks"
  ADD CONSTRAINT "submission_identity_locks_responseId_fkey"
  FOREIGN KEY ("responseId") REFERENCES "form_responses"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "form_responses"
  ADD CONSTRAINT "form_responses_submissionSessionId_fkey"
  FOREIGN KEY ("submissionSessionId") REFERENCES "public_submission_sessions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "form_responses"
  ADD CONSTRAINT "form_responses_verificationRequestId_fkey"
  FOREIGN KEY ("verificationRequestId") REFERENCES "submission_verification_requests"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
