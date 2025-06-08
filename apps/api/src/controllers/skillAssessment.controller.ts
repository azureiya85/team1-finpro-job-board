import { Request, Response, NextFunction } from 'express';
import { createSkillSchema } from '../lib/validations/zodSkillValidation';
import * as skillService from '../services/skillAssessment.service';

export const createSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = createSkillSchema.parse(req.body);
    const skill = await skillService.createSkillAssessment(data);
    res.status(201).json(skill);
  } catch (err) {
    next(err);
  }
};

export const listSkills = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const skills = await skillService.getAllSkillAssessments();
    res.json(skills);
  } catch (err) {
    next(err);
  }
};
