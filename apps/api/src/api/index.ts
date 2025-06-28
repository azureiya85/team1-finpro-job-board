import { Router } from 'express';
import jobRoutes from '@/routers/job.routers';
import uploadRoutes from '@/routers/upload.routers';
import applicationRoutes from '@/routers/application.routers';
import companyRoutes from '@/routers/company.routers';
import locationRoutes from '@/routers/location.routers';

const router = Router();

router.use('/jobs', jobRoutes);
router.use('/upload', uploadRoutes);
router.use('/applications', applicationRoutes);
router.use('/companies', companyRoutes);
router.use('/locations', locationRoutes); 

export default router;