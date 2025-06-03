import { Router } from 'express';
import jobRoutes from '@/routers/job.routers';
// Import other resource routers here
// import userRoutes from './users/user.routes';

const router = Router();

router.use('/jobs', jobRoutes);
// router.use('/users', userRoutes);

export default router;