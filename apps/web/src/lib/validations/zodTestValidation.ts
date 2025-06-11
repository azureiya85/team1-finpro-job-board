import { z } from 'zod';

export const testSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    passingScore: z.number().min(0).max(100),
    timeLimit: z.number().min(1),
    questions: z.array(z.object({
      question: z.string().min(1),
      optionA: z.string().min(1),
      optionB: z.string().min(1),
      optionC: z.string().min(1),
      optionD: z.string().min(1),
      correctAnswer: z.enum(['A', 'B', 'C', 'D']),
      explanation: z.string().optional()
    })).min(1).max(25)
  })