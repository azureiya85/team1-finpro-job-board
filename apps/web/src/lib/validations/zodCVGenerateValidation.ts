import { z } from 'zod';

export const generateCvSchema = z.object({
  professionalSummary: z.string()
    .min(50, { message: 'Professional summary must be at least 50 characters long.' })
    .max(1000, { message: 'Professional summary cannot exceed 1000 characters.' }),
  
  customSkills: z.string()
    .max(500, { message: 'Skills list cannot exceed 500 characters.' })
    .optional()
    .default(''),
  
  languages: z.string()
    .max(500, { message: 'Languages list cannot exceed 500 characters.' })
    .optional()
    .default('')
    .refine(
        (val) => {
          if (!val || val.trim() === '') return true;
          return val.split(',').every(part => {
            const trimmedPart = part.trim();
            return trimmedPart === '' || trimmedPart.includes(':');
          });
        },
        { message: 'Languages must follow the "Language:Proficiency, ..." format.' }
    ),

  educationHistory: z.string()
    .max(1000, { message: 'Education history cannot exceed 1000 characters.' })
    .optional()
    .default('')
    .refine(
        (val) => {
          if (!val || val.trim() === '') return true;
          return val.split(',').every(part => {
            const trimmedPart = part.trim();
            if (trimmedPart === '') return true;
            // Format: "startYear:endYear:universityName:degree"
            const segments = trimmedPart.split(':');
            return segments.length === 4 && segments.every(seg => seg.trim().length > 0);
          });
        },
        { message: 'Education history must follow the "StartYear:EndYear:University:Degree, ..." format.' }
    ),
});

export type GenerateCvPayload = z.infer<typeof generateCvSchema>;