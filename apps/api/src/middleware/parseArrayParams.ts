import { Request, Response, NextFunction } from 'express';

export const parseArrayParams = (req: Request, res: Response, next: NextFunction): void => {
  const arrayKeys = ['categories', 'employmentTypes', 'experienceLevels', 'companySizes'];
  
  arrayKeys.forEach(key => {
    if (req.query[key]) {
      if (typeof req.query[key] === 'string') {
        // Use type assertion to allow array assignment
        (req.query as Record<string, any>)[key] = (req.query[key] as string)
          .split(',')
          .map(s => s.trim());
      }
    }
  });
  
  next(); // Synchronous call
};