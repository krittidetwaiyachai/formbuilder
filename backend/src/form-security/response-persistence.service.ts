import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  FormStatus,
  Prisma
} from '@prisma/client';
import { EncryptionService } from '../common/encryption.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResponseDto } from '../responses/dto/create-response.dto';

interface FormSettings {
  allowMultipleSubmissions?: boolean;
}

interface QuizSettings {
  startTime?: string | Date;
  endTime?: string | Date;
  showAnswer?: boolean;
  showDetail?: boolean;
}

interface PersistPublicResponseInput {
  formId: string;
  answers: { fieldId: string; value: string }[];
  userId?: string | null;
  respondentEmail?: string | null;
  normalizedRespondentEmail?: string | null;
  emailVerifiedAt?: Date | null;
  emailVerificationId?: string | null;
  submissionGrantId?: string | null;
  sessionKey?: string | null;
  fingerprint?: string | null;
  ipAddress?: string | null;
}

@Injectable()
export class ResponsePersistenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService
  ) {}

  async createLegacyCompatible(createResponseDto: CreateResponseDto) {
    const {
      formId,
      answers,
      userId,
      respondentEmail,
      normalizedRespondentEmail,
      fingerprint,
      ipAddress,
      sessionKey
    } = createResponseDto;

    const form = await this.loadPublishedForm(formId);
    this.assertQuizWindow(form);
    await this.assertLegacySubmissionAllowance(form, {
      formId,
      userId,
      respondentEmail,
      fingerprint
    });

    return this.prisma.$transaction((tx) =>
      this.createInTransaction(tx, form, {
        formId,
        answers,
        userId: userId || null,
        respondentEmail: respondentEmail || null,
        normalizedRespondentEmail:
          normalizedRespondentEmail || respondentEmail?.trim().toLowerCase() || null,
        emailVerifiedAt: null,
        emailVerificationId: null,
        submissionGrantId: null,
        sessionKey: sessionKey || null,
        fingerprint: fingerprint || null,
        ipAddress: ipAddress || null
      })
    );
  }

  async createInTransaction(
    tx: Prisma.TransactionClient,
    form: Awaited<ReturnType<ResponsePersistenceService['loadPublishedForm']>>,
    input: PersistPublicResponseInput
  ) {
    let score = 0;
    let totalScore = 0;
    const answerResults: { fieldId: string; isCorrect: boolean }[] = [];

    if (form.isQuiz) {
      for (const answer of input.answers) {
        const field = form.fields.find((candidate) => candidate.id === answer.fieldId);

        if (!field) {
          continue;
        }

        totalScore += field.score || 0;
        const isCorrect = field.correctAnswer === answer.value;

        if (isCorrect) {
          score += field.score || 0;
        }

        answerResults.push({
          fieldId: answer.fieldId,
          isCorrect
        });
      }
    }

    const response = await tx.formResponse.create({
      data: {
        formId: input.formId,
        userId: input.userId || null,
        respondentEmail: input.respondentEmail || null,
        normalizedRespondentEmail: input.normalizedRespondentEmail || null,
        emailVerifiedAt: input.emailVerifiedAt || null,
        emailVerificationId: input.emailVerificationId || null,
        submissionGrantId: input.submissionGrantId || null,
        sessionKey: input.sessionKey || null,
        fingerprint: input.fingerprint || null,
        ipAddress: input.ipAddress
          ? this.encryptionService.hashIpAddress(input.ipAddress)
          : null,
        score: form.isQuiz ? score : null,
        totalScore: form.isQuiz ? totalScore : null,
        answers: {
          create: input.answers.map((answer) => {
            const answerResult = answerResults.find(
              (candidate) => candidate.fieldId === answer.fieldId
            );
            const field = form.fields.find((candidate) => candidate.id === answer.fieldId);
            const valueToStore =
              field?.isPII && answer.value
                ? this.encryptionService.encrypt(answer.value)
                : answer.value;

            return {
              fieldId: answer.fieldId,
              value: valueToStore,
              isCorrect: answerResult?.isCorrect || null
            };
          })
        }
      },
      include: {
        answers: {
          include: {
            field: true
          }
        },
        form: {
          select: {
            id: true,
            title: true,
            isQuiz: true,
            quizSettings: true
          }
        }
      }
    });

    if (form.isQuiz && totalScore > 0) {
      await tx.quizScore.create({
        data: {
          responseId: response.id,
          score,
          totalScore,
          percentage: (score / totalScore) * 100
        }
      });
    }

    return {
      ...response,
      score: form.isQuiz ? score : undefined,
      totalScore: form.isQuiz ? totalScore : undefined,
      quizReview: form.isQuiz
        ? {
            answers: response.answers.map((answer) => ({
              fieldId: answer.fieldId,
              fieldLabel: answer.field.label,
              userAnswer: answer.value,
              correctAnswer: (form.quizSettings as QuizSettings | null)?.showAnswer
                ? answer.field.correctAnswer
                : null,
              isCorrect: answer.isCorrect,
              score: answer.field.score || 0
            })),
            showAnswer: (form.quizSettings as QuizSettings | null)?.showAnswer || false,
            showDetail: (form.quizSettings as QuizSettings | null)?.showDetail || false
          }
        : undefined
    };
  }

  async loadPublishedForm(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        title: true,
        status: true,
        isQuiz: true,
        settings: true,
        quizSettings: true,
        fields: {
          select: {
            id: true,
            type: true,
            label: true,
            isPII: true,
            score: true,
            correctAnswer: true
          }
        }
      }
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('Form is not published');
    }

    return form;
  }

  assertQuizWindow(form: Awaited<ReturnType<ResponsePersistenceService['loadPublishedForm']>>) {
    if (!form.isQuiz || !form.quizSettings) {
      return;
    }

    const settings = form.quizSettings as QuizSettings;
    const now = new Date();

    if (settings.startTime) {
      const startTime = new Date(settings.startTime);

      if (now < startTime) {
        throw new ForbiddenException(
          `This quiz will be available starting ${startTime.toLocaleString()}`
        );
      }
    }

    if (settings.endTime) {
      const endTime = new Date(settings.endTime);

      if (now > endTime) {
        throw new ForbiddenException(`This quiz closed on ${endTime.toLocaleString()}`);
      }
    }
  }

  async assertLegacySubmissionAllowance(
    form: Awaited<ReturnType<ResponsePersistenceService['loadPublishedForm']>>,
    params: {
      formId: string;
      userId?: string;
      respondentEmail?: string;
      fingerprint?: string;
    }
  ) {
    const settings = form.settings as FormSettings | null;
    const allowMultipleSubmissions = settings?.allowMultipleSubmissions === true;

    if (allowMultipleSubmissions) {
      return;
    }

    const whereConditions: Prisma.FormResponseWhereInput[] = [];

    if (params.userId) {
      whereConditions.push({ userId: params.userId });
    }

    if (params.respondentEmail) {
      whereConditions.push({ respondentEmail: params.respondentEmail });
    }

    if (params.fingerprint) {
      whereConditions.push({ fingerprint: params.fingerprint });
    }

    if (whereConditions.length === 0) {
      return;
    }

    const existingResponse = await this.prisma.formResponse.findFirst({
      where: {
        formId: params.formId,
        OR: whereConditions
      }
    });

    if (existingResponse) {
      throw new ForbiddenException(
        'You have already submitted this form. Multiple submissions are not allowed.'
      );
    }
  }
}
