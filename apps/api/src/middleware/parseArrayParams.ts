import { Request, Response, NextFunction } from 'express';

export const parseArrayParams = (req: Request, res: Response, next: NextFunction): void => {
  const arrayKeys = ['categories', 'employmentTypes', 'experienceLevels', 'companySizes'];
  
  arrayKeys.forEach(key => {
    if (req.query[key]) {
      if (typeof req.query[key] === 'string') {
        (req.query as Record<string, any>)[key] = [(req.query[key] as string).trim()];
      } else if (Array.isArray(req.query[key])) {
        (req.query as Record<string, any>)[key] = (req.query[key] as string[])
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }
    }
  });  
  next();
};