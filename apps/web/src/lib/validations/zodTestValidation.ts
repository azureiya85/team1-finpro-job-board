import { z } from 'zod';

export const testSchema = z.object({
    title: z.string().min(1, "Title is Required"),
    description: z.string().optional(),
    passingScore: z.number().min(0).max(100),
    timeLimit: z.number().min(1, "Minimum Time Limit is 1 Minute"),
    questions: z.array(z.object({
      question: z.string().min(1, "Question is Required"),
      optionA: z.string().min(1, "Option A Answer is Required"),
      optionB: z.string().min(1, "Option B Answer is Required"),
      optionC: z.string().min(1, "Option C Answer is Required"),
      optionD: z.string().min(1, "Option D Answer is Required"),
      correctAnswer: z.enum(['A', 'B', 'C', 'D']),
      explanation: z.string().optional()
    })).min(1).max(25)
  })