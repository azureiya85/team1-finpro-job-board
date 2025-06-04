import { Router } from 'express';
import { ApplicationController } from '@/controllers/application.controller';
import { validate } from '@/middleware/validation.middleware';
// import { authMiddleware } from '@/middleware/auth.middleware'; 
import { cvSubmissionSchema } from '@/lib/validations/zodApplicationValidation';
import { z } from 'zod';

const router = Router();

// Extended schema for CV submission
const submitCVSchema = cvSubmissionSchema.extend({
  jobPostingId: z.string().cuid(),
  cvUrl: z.string().url(),
});

// Query schema for checking application status
const applicationStatusSchema = z.object({
  jobPostingId: z.string().cuid()
});

router.post(
  '/submit-cv',
  // authMiddleware, // Enable authentication
  validate(submitCVSchema, 'body'),
  ApplicationController.submitApplication
);

router.get(
  '/status',
  // authMiddleware, // Enable authentication
  validate(applicationStatusSchema, 'query'),
  ApplicationController.getApplicationStatus
);

export default router;