// apps/web/src/lib/utils/apiResponse.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

export class ApiResponse {
  static success(data: Record<string, unknown>, status: number = 200) {
    return NextResponse.json(data, { status });
  }

  static error(message: string, status: number = 400, details?: unknown) {
    const response: { error: string; details?: unknown } = { error: message };
    if (details !== undefined) {
      response.details = details;
    }
    return NextResponse.json(response, { status });
  }

  static unauthorized(message: string = 'Unauthorized') {
    return this.error(message, 401);
  }

  static notFound(message: string = 'Resource not found') {
    return this.error(message, 404);
  }

  static badRequest(message: string = 'Bad request', details?: unknown) {
    return this.error(message, 400, details);
  }

  static internalError(message: string = 'Internal server error') {
    return this.error(message, 500);
  }

  static validationError(zodError: z.ZodError) {
    return this.badRequest('Validation failed', zodError.issues);
  }

  static handleError(error: unknown) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return this.validationError(error);
    }

    if (error instanceof Error) {
      // Handle known business logic errors
      const businessErrors = [
        'Job posting not found',
        'This job posting is no longer active',
        'Application deadline has passed',
        'You have already applied for this position'
      ];

      if (businessErrors.includes(error.message)) {
        const status = error.message === 'Job posting not found' ? 404 : 400;
        return this.error(error.message, status);
      }
    }

    return this.internalError('An unexpected error occurred. Please try again.');
  }
}