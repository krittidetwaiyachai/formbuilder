# Security Regression Test Plan

This plan is repository-specific. It is based on the current backend auth, public-submission, and websocket surfaces in:

- `backend/src/forms/forms.controller.ts`
- `backend/src/activity-log/activity-log.service.ts`
- `backend/src/responses/responses.controller.ts`
- `backend/src/responses/responses.service.ts`
- `backend/src/form-security/form-security.controller.ts`
- `backend/src/form-security/form-security.service.ts`
- `backend/src/form-security/public-submission-orchestrator.service.ts`
- `backend/src/collaboration/collaboration.gateway.ts`
- `backend/src/forms/form.gateway.ts`
- `backend/src/events/events.gateway.ts`
- `backend/src/common/guards/ws-auth.util.ts`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/security_hardening.sql`

The test strategy is issue-driven rather than endpoint-driven. Each Critical/High issue below gets explicit regression coverage with attack scenario, expected secure behavior, setup data, exact assertions, and the right layer.

## Recommended Test Layout

Create a dedicated backend security suite under `backend/test/security/`:

- `backend/test/security/http-authorization.e2e-spec.ts`
- `backend/test/security/public-endpoint-abuse.e2e-spec.ts`
- `backend/test/security/public-submission-races.int-spec.ts`
- `backend/test/security/websocket-auth.int-spec.ts`
- `backend/test/security/websocket-room-authorization.e2e-spec.ts`
- `backend/test/security/form-security.service.spec.ts`
- `backend/test/security/ws-auth.util.spec.ts`

Recommended tooling:

- Unit: Jest
- Integration/e2e HTTP: Nest testing module + `supertest`
- Integration/e2e websocket: `socket.io-client`
- Race tests: `Promise.allSettled()` with 10 to 50 concurrent requests against a real test Postgres database

## Coverage Matrix

| Issue | Severity | Unit | Integration | E2E | Race | Authorization | Public Abuse | Websocket Auth |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| WS room join without per-form authorization | Critical | Yes | Yes | Yes | No | Yes | No | Yes |
| WS auth bypasses session revocation / disabled account | High | Yes | Yes | Yes | No | Yes | No | Yes |
| Form activity/editor endpoints leak cross-tenant metadata | High | Yes | Yes | Yes | No | Yes | No | No |
| Public submission status endpoint enables responder enumeration | High | Yes | Yes | Yes | No | No | Yes | No |
| Email-verification grants are not bound to session/IP | High | Yes | Yes | Yes | Yes | Yes | Yes | No |
| Concurrent public submissions can bypass one-response controls or double-spend grants | High | No | Yes | Yes | Yes | No | Yes | No |

## Critical And High Issues

### 1. Critical: Websocket room join without per-form authorization

Primary code paths:

- `backend/src/collaboration/collaboration.gateway.ts`
- `backend/src/forms/form.gateway.ts`
- `backend/src/common/guards/form-access.service.ts`

Why this is severe:

- Both websocket gateways authenticate the caller but do not authorize access to the specific `formId` before `client.join(...)`.
- An authenticated outsider can subscribe to another tenant's collaboration/presence/update stream or inject updates into it.

Attack scenario:

- User B has a valid JWT for their own account.
- User B guesses or obtains User A's private `formId`.
- User B connects to `/collaboration` or `/forms` and emits `join-form` or `join_form` with User A's `formId`.
- User B receives presence or update traffic for a form they do not own and do not collaborate on.

Expected secure behavior:

- Room join must enforce the same form-level access as HTTP reads.
- Only creator, collaborator, `ADMIN`, or `SUPER_ADMIN` may join private rooms.
- `VIEWER` may only join a published form if that behavior is explicitly intended.
- Unauthorized join attempts must fail before room membership is added.

Test setup data:

- `ownerUser`: owns `privateForm`
- `collaboratorUser`: collaborator on `privateForm`
- `outsiderUser`: authenticated but unrelated to `privateForm`
- `viewerUser`: `VIEWER` role, not collaborator
- `privateForm`: `status = DRAFT`
- `publicForm`: `status = PUBLISHED`
- Signed JWTs for all four users

Exact assertions:

- Unauthorized socket receives an error event or is disconnected.
- Unauthorized socket never receives `active-users`, `joined_room`, or `form_updated` for the victim form.
- Authorized owner/collaborator does receive success ack or room traffic.
- After outsider attempts to broadcast `update_form_client`, owner socket receives nothing.
- Internal gateway room/user maps do not contain outsider membership for victim form.

Tests:

- Unit: mock `FormAccessService.assertReadAccess` and verify join handler refuses unauthorized `formId`.
- Integration: connect real gateway with `socket.io-client`, emit join event, assert no room traffic for outsider.
- E2E: connect two clients, have owner join victim room, outsider attempt join and broadcast, assert owner never receives outsider-forged event.

### 2. High: Websocket auth bypasses session revocation and disabled-account checks

Primary code paths:

- `backend/src/common/guards/ws-auth.util.ts`
- `backend/src/events/events.gateway.ts`
- `backend/src/forms/form.gateway.ts`
- `backend/src/collaboration/collaboration.gateway.ts`
- `backend/src/auth/jwt.strategy.ts`
- `backend/src/auth/auth.service.ts`

Why this is high:

- HTTP auth validates `sessionToken` and `isActive`.
- Websocket auth currently verifies the JWT signature only.
- A stale token can still be used after re-login, force logout, or account disablement.

Attack scenario:

- Attacker steals a JWT from a browser session.
- Legitimate user logs in again, rotating `sessionToken`, or an admin disables the account.
- Attacker reconnects to websocket namespaces with the old JWT and still receives events.

Expected secure behavior:

- Websocket auth must enforce the same effective checks as `JwtStrategy.validate()`.
- Old JWTs must be rejected after session rotation.
- Disabled users must be rejected even if the JWT signature is valid.

Test setup data:

- `userA` with initial `sessionToken = tokenA`
- Re-login rotates DB value to `tokenB`
- `disabledUser` with `isActive = false`
- JWT signed with stale `sessionToken = tokenA`
- JWT signed for disabled user

Exact assertions:

- `/events`, `/forms`, and `/collaboration` reject the stale-session JWT.
- `/events`, `/forms`, and `/collaboration` reject the disabled-user JWT.
- A fresh JWT with current session token is accepted.
- Old sockets are disconnected after re-login or can no longer reconnect.

Tests:

- Unit: `ws-auth.util` or replacement auth helper returns null for stale or disabled users.
- Integration: one test per namespace verifies disconnect on stale or disabled JWT.
- E2E: login twice, keep first token, reconnect with first token, assert disconnect and no `force_logout`/room traffic delivered.

### 3. High: Form activity and editor endpoints leak cross-tenant metadata

Primary code paths:

- `backend/src/forms/forms.controller.ts`
- `backend/src/activity-log/activity-log.service.ts`
- `backend/src/common/guards/form-access.service.ts`

Why this is high:

- `GET /api/forms/:id/activity` and `GET /api/forms/:id/activity/editors` are authenticated, but there is no form-level authorization check before data is returned.
- That exposes editor identities, emails, and activity history across tenants.

Attack scenario:

- Authenticated outsider knows another tenant's `formId`.
- Outsider calls activity or editors endpoint.
- API returns names, emails, and action history for a form the outsider cannot access.

Expected secure behavior:

- Both endpoints must call form-level access checks before returning any data.
- Unauthorized caller gets `403`.
- Nonexistent form gets `404`.
- `VIEWER` must not access draft-form activity unless explicitly allowed.

Test setup data:

- `ownerUser`, `collaboratorUser`, `outsiderUser`, `viewerUser`
- `draftForm` owned by `ownerUser`
- `publishedForm` owned by `ownerUser`
- Activity log rows for create/update/delete and collaborator changes

Exact assertions:

- Outsider `GET /api/forms/:draftFormId/activity` returns `403`.
- Outsider `GET /api/forms/:draftFormId/activity/editors` returns `403`.
- Response body for denied requests contains no editor emails or activity items.
- Owner and collaborator receive `200` with only the requested form's rows.
- `VIEWER` requesting draft-form activity gets `403`.

Tests:

- Unit: controller/service test verifies `FormAccessService.assertReadAccess` is invoked before querying activity data.
- Integration: request both endpoints through a Nest test app with seeded records.
- E2E: validate no cross-tenant metadata leak from real HTTP responses.

### 4. High: Public submission-status endpoint enables responder enumeration

Primary code paths:

- `backend/src/responses/responses.controller.ts`
- `backend/src/responses/responses.service.ts`
- `frontend/src/components/public-form/hooks/useQuizFeatures.ts`

Why this is high:

- `GET /api/responses/check/:formId` is public.
- It accepts `userId`, `respondentEmail`, and `fingerprint`, then reveals whether a matching submission exists.
- That can be used to test whether a target email or fingerprint has submitted a sensitive form.

Attack scenario:

- Internet attacker iterates through candidate emails against a whistleblower, HR, medical, or incident form.
- Endpoint returns `hasSubmitted: true` when the guessed target has already submitted.

Expected secure behavior:

- Public callers must not be allowed to probe arbitrary `userId` or `respondentEmail`.
- If status checks remain public, they must be limited to a caller-bound signal only, ideally validated fingerprint or verified submission context.
- Invalid or unsupported identifiers must be rejected.
- Public response must not reveal another person's submission status.

Test setup data:

- `sensitiveForm` with submissions from `victim@example.com`
- Valid stored victim fingerprint
- Anonymous client without any server-issued proof
- Legitimate client fingerprint for the current browser session

Exact assertions:

- Public request with `respondentEmail=victim@example.com` returns `400` or `403`.
- Public request with `userId=<victim-id>` returns `400` or `403`.
- Public request with malformed fingerprint returns `400`.
- Public request with an unrelated valid fingerprint returns `200` and `hasSubmitted: false`.
- Public request must never return `hasSubmitted: true` for arbitrary victim email or userId guesses.

Tests:

- Unit: validation logic only permits supported public identifiers and rejects email/userId probes.
- Integration: hit `/api/responses/check/:formId` with each probe type.
- E2E: simulate attacker enumeration loop and assert every probe is rejected or non-enumerable.

### 5. High: Email-verification grants are not bound to session or network context

Primary code paths:

- `backend/src/form-security/form-security.service.ts`
- `backend/src/form-security/public-submission-orchestrator.service.ts`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/security_hardening.sql`

Why this is high:

- Verification requests store `sessionKey` and request IP context, but grant validation and submission do not enforce those bindings.
- `security_hardening.sql` already indicates intended `ipHash` and `sessionKeyHash` hardening for grants.
- Anyone who obtains `bindingId + grantToken + canonicalEmail` can submit from another browser/session before consumption.

Attack scenario:

- Victim requests email verification in Browser A.
- Attacker obtains the verification link or resulting grant token.
- Attacker submits the verified form from Browser B with a different `sessionKey` or IP before the victim does.

Expected secure behavior:

- Grant creation must bind the grant to the verification context.
- Verified-submission status and final submit must require the same `sessionKey` and, if configured, same IP hash.
- Mismatched session or IP must invalidate the grant or reject submission.

Test setup data:

- `verifiedForm` with:
  - `requireEmailVerification = true`
  - `canonicalEmailSource = top_level` or email field
- Browser A:
  - `sessionKey = session-A`
  - `ip = 198.51.100.10`
  - verified `bindingId`, `grantToken`
- Browser B:
  - `sessionKey = session-B`
  - `ip = 203.0.113.20`

Exact assertions:

- `POST /api/forms/:id/submit` with valid grant but different `sessionKey` returns `409` or `403`.
- `POST /api/forms/:id/submit` with valid grant but different IP returns `409` or `403` if IP binding is enabled.
- `POST /api/forms/:id/verified-submission-status` with wrong session context returns `INVALID`.
- No `form_responses` row is created for the mismatched-context submission.
- Grant remains unused for the legitimate session or is explicitly invalidated.

Tests:

- Unit: grant-binding helper hashes and compares session/IP context correctly.
- Integration: request verification, verify email, then submit from mismatched session/IP and assert rejection.
- E2E: simulate Browser A and Browser B end to end, confirm only Browser A can submit.

### 6. High: Concurrent public submissions can bypass one-response controls or double-spend a verification grant

Primary code paths:

- `backend/src/form-security/public-submission-orchestrator.service.ts`
- `backend/src/form-security/response-persistence.service.ts`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/security_hardening.sql`

Why this is high:

- The repository is mid-hardening for uniqueness constraints.
- The application checks for duplicates before insert, but concurrent requests still need DB-backed guarantees.
- Race conditions can allow:
  - multiple submissions from the same email, fingerprint, or IP
  - double consumption of the same verified-submission grant
  - secure logic degrading into `500` instead of a controlled rejection

Attack scenario:

- Attacker fires 10 to 50 parallel `submit` requests with the same canonical email/fingerprint/IP.
- Or attacker replays the same verified grant in parallel.

Expected secure behavior:

- Exactly one submission persists for a one-response-constrained form.
- Exactly one submission consumes a verified grant.
- All losing requests fail deterministically with `409` or `429`, not `500`.
- DB state remains internally consistent.

Test setup data:

- `singleSubmitForm` with:
  - `allowMultipleSubmissions = false`
  - `limitOneResponsePerEmail = true`
  - `limitOneResponsePerIP = true`
  - `canonicalEmailSource` configured
- `verifiedSingleSubmitForm` with email verification enabled
- One valid `bindingId + grantToken`
- 10 to 50 parallel request payloads sharing the same canonical email, fingerprint, IP, and optionally same verified grant

Exact assertions:

- After all parallel requests settle, `form_responses.count({ formId }) === 1`.
- If using a verified grant, only one response row references `submissionGrantId`.
- The corresponding grant has exactly one `consumedAt` value and is not reused.
- At least `N - 1` requests fail with controlled `409`/`429`.
- Zero requests fail with uncaught `500`.

Tests:

- Integration race: fire parallel `POST /api/forms/:id/submit` requests directly against the Nest app and real test DB.
- E2E race: run the same scenario through the public HTTP interface and assert both HTTP results and final DB state.

## Baseline Unit Tests

These are not separate High issues, but they support the issue-specific suites above and should be added first:

- `validateFingerprint()` accepts only 16 to 128 chars matching `[a-zA-Z0-9_-]`.
- `validateFormSecuritySettings()` rejects email-verification or one-response-per-email forms without a valid email source.
- Submission-status validation rejects unsupported public probe parameters.
- Websocket auth helper rejects missing token, stale session token, disabled account, and malformed JWT.
- Grant-binding helper hashes and compares `sessionKey` and IP consistently.

## Authorization Test Inventory

- Outsider cannot read form activity or editor lists for another tenant.
- Outsider cannot join private websocket rooms.
- `VIEWER` cannot access draft-form activity or draft-form rooms.
- Stale-session websocket clients cannot reconnect after session rotation.
- Disabled users cannot establish websocket connections.

## Public Endpoint Abuse Test Inventory

- Public status endpoint rejects email and userId probes.
- Public status endpoint does not reveal third-party submission state.
- Verified submission status rejects stolen or mismatched grants.
- Parallel public submits do not create duplicate rows.

## Race-Condition Test Inventory

- Same email, same fingerprint, same IP submitted in parallel.
- Same verified grant submitted in parallel.
- Parallel duplicate submits fail closed with `409`/`429`, not `500`.

## Exit Criteria

Treat the security regression plan as complete only when:

- Every Critical/High issue above has at least one automated test in its designated layer.
- Websocket tests cover all three namespaces: `/events`, `/forms`, `/collaboration`.
- Public abuse tests execute against the actual HTTP routes, not only service methods.
- Race tests assert final persisted DB state, not just HTTP status codes.
