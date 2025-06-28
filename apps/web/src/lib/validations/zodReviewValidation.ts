import { z } from 'zod';
import { EmploymentStatus } from '@prisma/client';

export const createReviewSchema = z.object({
  title: z
    .string({ required_error: 'Review title is required.' })
    .min(10, { message: 'Title must be at least 10 characters.' })
    .max(100, { message: 'Title must be 100 characters or less.' }),
  
  review: z
    .string()
    .min(50, { message: 'Review must be at least 50 characters long.' })
    .max(2000, { message: 'Review must not exceed 2000 characters.' }),

  jobPosition: z
    .string()
    .min(1, { message: 'Job position is required.' }),

  employmentStatus: z
    .nativeEnum(EmploymentStatus, {
      errorMap: () => ({ message: "Please select your employment status." }),
    }),

  rating: z
    .number({ required_error: 'Overall rating is required.' })
    .min(1, { message: 'Overall rating is required.' }),

  cultureRating: z
    .number({ required_error: 'Culture rating is required.' })
    .min(1, { message: 'Culture rating is required.' }),

  workLifeBalance: z
    .number({ required_error: 'Work-Life balance rating is required.' })
    .min(1, { message: 'Work-Life balance rating is required.' }),

  facilitiesRating: z
    .number({ required_error: 'Facilities rating is required.' })
    .min(1, { message: 'Facilities rating is required.' }),

  careerRating: z
    .number({ required_error: 'Career opportunities rating is required.' })
    .min(1, { message: 'Career opportunities rating is required.' }),

  workDuration: z
    .string()
    .max(50, "Work duration must be 50 characters or less.")
    .optional()
    .nullable(),
  
  salaryEstimate: z
    .number({ invalid_type_error: 'Salary must be a number.' })
    .int()
    .positive("Salary estimate must be a positive number.")
    .optional()
    .nullable(),
});