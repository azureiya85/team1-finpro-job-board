import { Router } from 'express';
import * as locationController from '@/controllers/location.controller';

const router = Router();

router.get('/', locationController.getAllLocations);

export default router;