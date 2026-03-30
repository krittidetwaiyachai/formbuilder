import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
@Catch()export class
GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let errorResponse: Record<string, unknown> | null = null;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const errObj = res as Record<string, unknown>;
        message = typeof errObj.message === 'string' ? errObj.message : 'Http Error';
        errorResponse = errObj;
      }
      this.logger.error(`HttpException [${status}]: ${JSON.stringify(res)}`);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database operation failed';
      this.logger.error(`Prisma Error [${exception.code}]: ${exception.message}`);
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`Unknown Exception: ${JSON.stringify(exception)}`);
    }
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: status >= 500 ? 'Internal Server Error' : message,
      ...(status < 500 && errorResponse && typeof errorResponse === 'object' ? errorResponse : {})
    });
  }
}