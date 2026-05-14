import { createHash } from 'crypto';
import {
  PrismaClient,
  SubmissionIdentityLockType
} from '@prisma/client';
import { getFormSecuritySettings } from '../src/form-security/form-security-settings.util';

const prisma = new PrismaClient();

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeHistoricalEmail(value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  return value.trim().toLowerCase();
}

async function main() {
  const responseColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'form_responses'
  `;
  const availableResponseColumns = new Set(
    responseColumns.map((column) => column.column_name)
  );
  const hasSessionKey = availableResponseColumns.has('sessionKey');
  const hasSubmissionSessionId = availableResponseColumns.has('submissionSessionId');
  const hasNormalizedRespondentEmail = availableResponseColumns.has('normalizedRespondentEmail');
  const hasRespondentEmail = availableResponseColumns.has('respondentEmail');
  const hasIpAddress = availableResponseColumns.has('ipAddress');

  const forms = await prisma.form.findMany({
    select: {
      id: true,
      settings: true,
      submissionIdentityLocks: {
        select: {
          lockType: true,
          lockKeyHash: true
        }
      }
    }
  });

  let createdLocks = 0;
  let skippedDuplicates = 0;

  for (const form of forms) {
    const security = getFormSecuritySettings(form.settings);
    const settings =
      form.settings &&
      typeof form.settings === 'object' &&
      !Array.isArray(form.settings) ?
      form.settings as Record<string, unknown> :
      {};
    const allowMultipleSubmissions = settings.allowMultipleSubmissions === true;

    const seenSessionLocks = new Set(
      form.submissionIdentityLocks
        .filter((lock) => lock.lockType === SubmissionIdentityLockType.SESSION)
        .map((lock) => lock.lockKeyHash)
    );
    const seenEmailLocks = new Set(
      form.submissionIdentityLocks
        .filter((lock) => lock.lockType === SubmissionIdentityLockType.CANONICAL_EMAIL)
        .map((lock) => lock.lockKeyHash)
    );
    const seenIpLocks = new Set(
      form.submissionIdentityLocks
        .filter((lock) => lock.lockType === SubmissionIdentityLockType.IP)
        .map((lock) => lock.lockKeyHash)
    );

    const responses = await prisma.formResponse.findMany({
      where: {
        formId: form.id
      },
      select: {
        id: true,
        createdAt: true,
        ...(hasSubmissionSessionId ? { submissionSessionId: true } : {}),
        ...(hasSessionKey ? { sessionKey: true } : {}),
        ...(hasNormalizedRespondentEmail ? { normalizedRespondentEmail: true } : {}),
        ...(hasRespondentEmail ? { respondentEmail: true } : {}),
        ...(hasIpAddress ? { ipAddress: true } : {})
      } as any,
      orderBy: [{ createdAt: 'asc' }]
    }) as Array<any>;

    for (const response of responses) {
      const pendingLocks: {
        lockType: SubmissionIdentityLockType;
        lockKeyHash: string;
        seenSet: Set<string>;
      }[] = [];

      if (!allowMultipleSubmissions) {
        const sessionSource =
          (hasSubmissionSessionId ? response.submissionSessionId : null) ||
          ('sessionKey' in response && typeof response.sessionKey === 'string' ?
            response.sessionKey :
            null);
        if (sessionSource) {
          const sessionLockHash = sha256(sessionSource);
          if (!seenSessionLocks.has(sessionLockHash)) {
            pendingLocks.push({
              lockType: SubmissionIdentityLockType.SESSION,
              lockKeyHash: sessionLockHash,
              seenSet: seenSessionLocks
            });
          } else {
            skippedDuplicates++;
          }
        }
      }

      if (security.limitOneResponsePerEmail) {
        const canonicalEmail =
          normalizeHistoricalEmail(
            hasNormalizedRespondentEmail ? response.normalizedRespondentEmail : null
          ) ||
          normalizeHistoricalEmail(hasRespondentEmail ? response.respondentEmail : null);
        if (canonicalEmail) {
          const emailLockHash = sha256(canonicalEmail);
          if (!seenEmailLocks.has(emailLockHash)) {
            pendingLocks.push({
              lockType: SubmissionIdentityLockType.CANONICAL_EMAIL,
              lockKeyHash: emailLockHash,
              seenSet: seenEmailLocks
            });
          } else {
            skippedDuplicates++;
          }
        }
      }

      if (security.limitOneResponsePerIP && hasIpAddress && response.ipAddress) {
        if (!seenIpLocks.has(response.ipAddress)) {
          pendingLocks.push({
            lockType: SubmissionIdentityLockType.IP,
            lockKeyHash: response.ipAddress,
            seenSet: seenIpLocks
          });
        } else {
          skippedDuplicates++;
        }
      }

      for (const lock of pendingLocks) {
        try {
          await prisma.submissionIdentityLock.create({
            data: {
              formId: form.id,
              lockType: lock.lockType,
              lockKeyHash: lock.lockKeyHash,
              responseId: response.id
            }
          });
          lock.seenSet.add(lock.lockKeyHash);
          createdLocks++;
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            'code' in error &&
            error.code === 'P2002'
          ) {
            skippedDuplicates++;
            lock.seenSet.add(lock.lockKeyHash);
            continue;
          }

          throw error;
        }
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        formsProcessed: forms.length,
        availableResponseColumns: [...availableResponseColumns].sort(),
        hasSessionKey,
        createdLocks,
        skippedDuplicates
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
