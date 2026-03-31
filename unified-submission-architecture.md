# Unified Submission Architecture

This document defines the target public submission model for this repository.

## Goals

- Keep current product behavior as much as possible
- Eliminate dual submit logic paths
- Stop trusting client-supplied identity selectors
- Make canonical email source explicit
- Make verification one-time and session-bound
- Enforce duplicate prevention at DB level where applicable
- Make rate limits shared-state and abuse-resistant
- Reduce enumeration through coarse public errors

## Canonical Public Surface

- `GET /api/public/forms/:formId`
- `POST /api/public/forms/:formId/verification-requests`
- `GET /api/public/forms/:formId/verification-requests/:verificationRequestId`
- `POST /api/public/forms/:formId/submissions`
- `GET /api/public/forms/:formId/submission-state`
- `GET /api/public/email-verifications/:token`

## Core Model

- Public browser identity is a server-issued cookie-backed submission session.
- Email verification proves mailbox possession only.
- Final submission is permitted only for the same form, same submission session, and same canonical email that created the verification request.
- Duplicate prevention is enforced through a DB lock table, not application checks alone.

## Migration Direction

- Old public routes remain temporary compatibility aliases.
- New work should land only on the unified public controller and service.
- Fingerprint-based duplicate logic should be treated as legacy and retired after the migration window.
