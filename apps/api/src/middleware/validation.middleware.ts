import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate =
  (schema: AnyZodObject, type: 'body' | 'query' | 'params' = 'body') =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req[type]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Zod Validation Middleware Error:", error.format());
        res.status(400).json({
          error: `Invalid ${type} parameters`,
          details: error.format(),
        });
        return; // Exit after sending response
      }
      next(error);
    }
  };