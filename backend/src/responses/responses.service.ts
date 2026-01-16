import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { FormStatus, RoleType } from '@prisma/client';

@Injectable()
export class ResponsesService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async create(createResponseDto: CreateResponseDto) {
    try {
        const { formId, answers, userId, respondentEmail, fingerprint } = createResponseDto;



        // Check if form exists and is published
        const form = await this.prisma.form.findUnique({
          where: { id: formId },
          select: {
            id: true,
            status: true,
            isQuiz: true,
            settings: true,
            fields: true,
            quizSettings: true,
          },
        });

        if (!form) {
          throw new NotFoundException('Form not found');
        }

        if (form.status !== FormStatus.PUBLISHED) {
          throw new ForbiddenException('Form is not published');
        }

        // Check quiz availability times
        if (form.isQuiz && form.quizSettings) {
          const quizSettings = form.quizSettings as any;
          const now = new Date();
          
          if (quizSettings.startTime) {
            const startTime = new Date(quizSettings.startTime);
            if (now < startTime) {
              throw new ForbiddenException(`This quiz will be available starting ${startTime.toLocaleString()}`);
            }
          }
          
          if (quizSettings.endTime) {
            const endTime = new Date(quizSettings.endTime);
            if (now > endTime) {
              throw new ForbiddenException(`This quiz closed on ${endTime.toLocaleString()}`);
            }
          }
        }

        // Check if multiple submissions are allowed
        const settings = form.settings as any;
        const allowMultipleSubmissions = settings?.allowMultipleSubmissions === true;

        if (!allowMultipleSubmissions) {
          // Check if user has already submitted (check userId, email, or fingerprint)
          const whereConditions = [];
          
          if (userId) {
            whereConditions.push({ userId });
          }
          if (respondentEmail) {
            whereConditions.push({ respondentEmail });
          }
          if (fingerprint) {
            whereConditions.push({ fingerprint });
          }

          if (whereConditions.length > 0) {
            const existingResponse = await this.prisma.formResponse.findFirst({
              where: {
                formId,
                OR: whereConditions,
              },
            });

            if (existingResponse) {
              throw new ForbiddenException('You have already submitted this form. Multiple submissions are not allowed.');
            }
          }
        }

        // Calculate quiz score if form is a quiz
        let score = 0;
        let totalScore = 0;
        const answerResults: any[] = [];

        if (form.isQuiz) {
          for (const answer of answers) {
            const field = form.fields.find((f) => f.id === answer.fieldId);
            if (field) {
              totalScore += field.score || 0;
              const isCorrect = field.correctAnswer === answer.value;
              if (isCorrect) {
                score += field.score || 0;
              }
              answerResults.push({
                fieldId: answer.fieldId,
                value: answer.value,
                isCorrect,
              });
            }
          }
        }

        // Create response
        const response = await this.prisma.formResponse.create({
          data: {
            formId,
            userId: userId || null,
            respondentEmail: createResponseDto.respondentEmail || null,
            fingerprint: fingerprint || null,
            score: form.isQuiz ? score : null,
            totalScore: form.isQuiz ? totalScore : null,
            answers: {
              create: answers.map((answer) => {
                const result = answerResults.find((r) => r.fieldId === answer.fieldId);
                const field = form.fields.find((f) => f.id === answer.fieldId);
                const valueToStore = field?.isPII && answer.value 
                  ? this.encryptionService.encrypt(answer.value) 
                  : answer.value;
                return {
                  fieldId: answer.fieldId,
                  value: valueToStore,
                  isCorrect: result?.isCorrect || null,
                };
              }),
            },
          },
          include: {
            answers: {
              include: {
                field: true,
              },
            },
            form: {
              select: {
                id: true,
                title: true,
                isQuiz: true,
                quizSettings: true,
              },
            },
          },
        });

        // Create quiz score record if quiz
        if (form.isQuiz && totalScore > 0) {
          const percentage = (score / totalScore) * 100;
          await this.prisma.quizScore.create({
            data: {
              responseId: response.id,
              score,
              totalScore,
              percentage,
            },
          });
        }

        return {
          ...response,
          score: form.isQuiz ? score : undefined,
          totalScore: form.isQuiz ? totalScore : undefined,
          // Quiz Review data for answer display
          quizReview: form.isQuiz ? {
            answers: response.answers.map(ans => ({
              fieldId: ans.fieldId,
              fieldLabel: ans.field.label,
              userAnswer: ans.value,
              correctAnswer: (form.quizSettings as any)?.showAnswer ? ans.field.correctAnswer : null,
              isCorrect: ans.isCorrect,
              score: ans.field.score || 0,
            })),
            showAnswer: (form.quizSettings as any)?.showAnswer || false,
            showDetail: (form.quizSettings as any)?.showDetail || false,
          } : undefined,
        };
    } catch (error) {
        console.error('FAILED TO CREATE RESPONSE:', error);
        throw error; // Re-throw to ensure 500 is still sent, but verified via logs
    }
  }

  async checkSubmissionStatus(
    formId: string,
    userId?: string,
    respondentEmail?: string,
    fingerprint?: string,
  ) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      select: {
        settings: true,
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const settings = form.settings as any;
    const allowMultipleSubmissions = settings?.allowMultipleSubmissions === true;

    if (allowMultipleSubmissions) {
      return { hasSubmitted: false };
    }

    const whereConditions = [];
    
    if (userId) {
      whereConditions.push({ userId });
    }
    if (respondentEmail) {
      whereConditions.push({ respondentEmail });
    }
    if (fingerprint) {
      whereConditions.push({ fingerprint });
    }

    if (whereConditions.length > 0) {
      const existingResponse = await this.prisma.formResponse.findFirst({
        where: {
          formId,
          OR: whereConditions,
        },
      });

      return { hasSubmitted: !!existingResponse };
    }

    return { hasSubmitted: false };
  }

  async findAll(formId: string, userId: string, userRole: RoleType) {
    // Check form access
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Check permissions
    if (userRole === RoleType.VIEWER && form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('You can only view responses for published forms');
    }

    if (
      userRole === RoleType.EDITOR &&
      form.createdById !== userId &&
      form.status !== FormStatus.PUBLISHED
    ) {
      throw new ForbiddenException('You can only view responses for your own forms');
    }

    const responses = await this.prisma.formResponse.findMany({
      where: { formId },
      include: {
        answers: {
          include: {
            field: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return responses.map(response => ({
      ...response,
      answers: response.answers.map(answer => ({
        ...answer,
        value: answer.field?.isPII && answer.value
          ? this.encryptionService.decrypt(answer.value)
          : answer.value,
      })),
    }));
  }

  async findOne(id: string, userId: string, userRole: RoleType) {
    const response = await this.prisma.formResponse.findUnique({
      where: { id },
      include: {
        form: true,
        answers: {
          include: {
            field: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    // Check permissions
    const form = response.form;
    if (userRole === RoleType.VIEWER && form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('You can only view responses for published forms');
    }

    if (
      userRole === RoleType.EDITOR &&
      form.createdById !== userId &&
      form.status !== FormStatus.PUBLISHED
    ) {
      throw new ForbiddenException('You can only view responses for your own forms');
    }

    return {
      ...response,
      answers: response.answers.map(answer => ({
        ...answer,
        value: answer.field?.isPII && answer.value
          ? this.encryptionService.decrypt(answer.value)
          : answer.value,
      })),
    };
  }

  async exportToCSV(formId: string, userId: string, userRole: RoleType) {
    try {
      const responses = await this.findAll(formId, userId, userRole);
      const form = await this.prisma.form.findUnique({
        where: { id: formId },
        include: { fields: { orderBy: { order: 'asc' } } },
      });

      if (!form) {
        throw new NotFoundException('Form not found');
      }

      // Helper to escape CSV values
      const escapeCsv = (value: any): string => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Generate CSV
      // Add 'Respondent Email' to headers if collected
      const headers = ['Submitted At'];
      const safeSettings = form.settings as any;
      if (safeSettings?.collectEmail) {
        headers.push('Respondent Email');
      }
      
      form.fields.forEach(f => {
         if (!['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'].includes(f.type)) {
             headers.push(f.label);
         }
      });

      if (form.isQuiz) {
        headers.push('Score', 'Total Score', 'Percentage');
      }

      const rows = responses.map((response) => {
        const date = new Date(response.submittedAt);
        const formattedDate = date.toLocaleString('th-TH', { 
           day: '2-digit', 
           month: '2-digit', 
           year: 'numeric',
           hour: '2-digit', 
           minute: '2-digit',
           second: '2-digit'
        });
        
        const row = [escapeCsv(formattedDate)];
        
        // Add email if collected
        if (safeSettings?.collectEmail) {
           const email = (response as any).respondentEmail || '';
           row.push(escapeCsv(email));
        }

        form.fields.forEach((field) => {
          if (!['HEADER', 'PARAGRAPH', 'DIVIDER', 'PAGE_BREAK', 'SUBMIT'].includes(field.type)) {
              const answer = response.answers.find((a) => a.fieldId === field.id);
              if (!answer && responses.indexOf(response) === 0) {

              }
              row.push(escapeCsv(answer?.value || ''));
          }
        });

        if (form.isQuiz) {
          const percentage = response.totalScore
            ? ((response.score || 0) / response.totalScore * 100).toFixed(2)
            : '0';

          row.push(
            escapeCsv(response.score || 0),
            escapeCsv(response.totalScore || 0),
            escapeCsv(percentage),
          );
        }
        return row.join(',');
      });

      const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');
      
      // Add UTF-8 BOM for Excel compatibility
      const csvWithBOM = '\uFEFF' + csv;

      return {
        csv: csvWithBOM,
        filename: `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses_${new Date().toISOString().split('T')[0]}.csv`,
      };
    } catch (error) {
        console.error('Export CSV Error:', error);
        throw error;
    }
  }
}
