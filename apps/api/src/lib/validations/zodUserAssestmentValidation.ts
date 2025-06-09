import { z } from 'zod';

export const submitAssessmentSchema = z.object({
  assessmentId: z.string().cuid(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.enum(['A', 'B', 'C', 'D']),
    })
  ),
});
