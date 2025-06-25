import { z } from 'zod';

export const generateCvSchema = z.object({
  professionalSummary: z.string()
    .min(50, { message: 'Professional summary must be at least 50 characters long.' })
    .max(1000, { message: 'Professional summary cannot exceed 1000 characters.' }),
  
  customSkills: z.string()
    .max(500, { message: 'Skills list cannot exceed 500 characters.' })
    .optional(),
  
  languages: z.string()
    .max(500, { message: 'Languages list cannot exceed 500 characters.' })
    .optional()
    .refine(
        (val) => {
          if (!val) return true;
          return val.split(',').every(part => {
            const trimmedPart = part.trim();
            return trimmedPart === '' || trimmedPart.includes(':');
          });
        },
        { message: 'Languages must follow the "Language:Proficiency, ..." format.' }
    ),
});

export type GenerateCvPayload = z.infer<typeof generateCvSchema>;