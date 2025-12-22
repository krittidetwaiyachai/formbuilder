import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { FormStatus, RoleType } from '@prisma/client';

@Injectable()
export class ResponsesService {
  constructor(private prisma: PrismaService) {}

  async create(createResponseDto: CreateResponseDto) {
    const { formId, answers, userId } = createResponseDto;

    // Check if form exists and is published
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: true,
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.status !== FormStatus.PUBLISHED) {
      throw new ForbiddenException('Form is not published');
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
        score: form.isQuiz ? score : null,
        totalScore: form.isQuiz ? totalScore : null,
        answers: {
          create: answers.map((answer) => {
            const result = answerResults.find((r) => r.fieldId === answer.fieldId);
            return {
              fieldId: answer.fieldId,
              value: answer.value,
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
    };
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

    return this.prisma.formResponse.findMany({
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

    return response;
  }

  async exportToCSV(formId: string, userId: string, userRole: RoleType) {
    const responses = await this.findAll(formId, userId, userRole);
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { fields: { orderBy: { order: 'asc' } } },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    // Generate CSV
    const headers = ['Submitted At', ...form.fields.map((f) => f.label)];
    if (form.isQuiz) {
      headers.push('Score', 'Total Score', 'Percentage');
    }

    const rows = responses.map((response) => {
      const row = [response.submittedAt.toISOString()];
      form.fields.forEach((field) => {
        const answer = response.answers.find((a) => a.fieldId === field.id);
        row.push(answer?.value || '');
      });
      if (form.isQuiz) {
        row.push(
          response.score?.toString() || '0',
          response.totalScore?.toString() || '0',
          response.totalScore
            ? ((response.score || 0) / response.totalScore * 100).toFixed(2)
            : '0',
        );
      }
      return row;
    });

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return {
      csv,
      filename: `${form.title}_responses_${new Date().toISOString()}.csv`,
    };
  }
}

