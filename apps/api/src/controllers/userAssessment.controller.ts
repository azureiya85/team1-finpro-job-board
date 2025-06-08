import { Request, Response, NextFunction } from 'express';
import { submitAssessmentSchema } from '../lib/validations/zodUserAssestmentValidation';
import * as userService from '../services/userAssessment.service';

export const submitAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = submitAssessmentSchema.parse(req.body);
    const userId = req.userId!;
    const userEmail = (req as any).user.email!;
    const result = await userService.submitUserAssessment(userId, userEmail, input);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
