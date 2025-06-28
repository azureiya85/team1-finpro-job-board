import { z } from 'zod';

export const createSkillSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  passingScore: z.number().int(),
  timeLimit: z.number().int(),
});
