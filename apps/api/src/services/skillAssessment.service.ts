import prisma from '../prisma';
import { CreateSkillInput } from '../types/skillAssessment';

export const createSkillAssessment = (data: CreateSkillInput) =>
  prisma.skillAssessment.create({ data });

export const getAllSkillAssessments = () =>
  prisma.skillAssessment.findMany();
