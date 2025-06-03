import { Router } from 'express';
import * as jobController from '@/controllers/job.controller';
import { validate } from '@/middleware/validation.middleware';
import { jobSearchParamsSchema } from '@/lib/validations/zodCompanyValidation';
import { parseArrayParams } from '@/middleware/parseArrayParams';

const router = Router();

router.get('/', 
  parseArrayParams,
  validate(jobSearchParamsSchema, 'query'), 
  jobController.getAllJobs
);

router.get('/latest-featured', jobController.getLatestFeatured);

router.get('/company/:companyId',
  parseArrayParams,
  validate(jobSearchParamsSchema, 'query'),
  jobController.getJobsByCompany
);

router.get('/:id', jobController.getJobById);

export default router;