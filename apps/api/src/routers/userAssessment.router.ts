import { Router } from 'express';
import { submitAssessment } from '../controllers/userAssessment.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.post('/', requireAuth, submitAssessment);
export default router;
