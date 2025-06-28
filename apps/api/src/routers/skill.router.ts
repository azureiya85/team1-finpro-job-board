import { Router } from 'express';
import { createSkill, listSkills } from '../controllers/skillAssessment.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();
router.get('/', listSkills);
router.post('/', requireAuth, requireRole('DEVELOPER'), createSkill);
export default router;
