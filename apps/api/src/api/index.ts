import { Router } from 'express';
import jobRoutes from '@/routers/job.routers';
import uploadRoutes from '@/routers/upload.routers';
import applicationRoutes from '@/routers/application.routers';

const router = Router();

router.use('/jobs', jobRoutes);
router.use('/upload', uploadRoutes);
router.use('/applications', applicationRoutes);

export default router;