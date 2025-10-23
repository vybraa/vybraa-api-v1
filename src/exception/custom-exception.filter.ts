import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails: any = null;
    console.log('aww', exception);
    if (exception instanceof Error) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;

      errorDetails = exception.name;
    }

    // Log the error
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    console.log('log', exception['response']);

    if (exception instanceof Error && exception['response']) {
      return response.status(status).json({
        statusCode: status,
        message,
        data: exception['response'],
        error: errorDetails,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
    // Send structured response
    return response.status(status).json({
      statusCode: status,
      message,
      error: errorDetails,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
