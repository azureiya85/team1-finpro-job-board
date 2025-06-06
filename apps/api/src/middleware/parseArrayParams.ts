import { Request, Response, NextFunction } from 'express';

export const parseArrayParams = (req: Request, res: Response, next: NextFunction): void => {
  const arrayKeys = ['categories', 'employmentTypes', 'experienceLevels', 'companySizes'];
  
  arrayKeys.forEach(key => {
    if (req.query[key]) {
      if (typeof req.query[key] === 'string') {
        // Convert single string to array
        (req.query as Record<string, any>)[key] = [(req.query[key] as string).trim()];
      } else if (Array.isArray(req.query[key])) {
        // If it's already an array (multiple values), clean it up
        (req.query as Record<string, any>)[key] = (req.query[key] as string[])
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }
    }
  });
  
  console.log('Parsed query params:', req.query); // Debug log
  next();
};