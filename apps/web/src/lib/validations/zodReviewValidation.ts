import { z } from 'zod';

export const createReviewSchema = z.object({
  title: z.string().max(100, "Title must be 100 characters or less.").optional(),
  review: z.string().min(50, "Review must be at least 50 characters long."),
  rating: z.number().min(1, "Rating must be at least 1.").max(5, "Rating must be at most 5."),
  cultureRating: z.number().min(1).max(5).optional().nullable(),
  workLifeBalance: z.number().min(1).max(5).optional().nullable(),
  facilitiesRating: z.number().min(1).max(5).optional().nullable(),
  careerRating: z.number().min(1).max(5).optional().nullable(),
  salaryEstimate: z.number().int().positive("Salary estimate must be a positive number.").optional().nullable(),
  workDuration: z.string().max(50, "Work duration must be 50 characters or less.").optional().nullable(),
});