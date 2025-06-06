import { Router } from 'express';
import { UploadController } from '@/controllers/upload.controller';
import { uploadSingle, handleUploadError } from '@/middleware/upload.middleware';
import { authMiddleware } from '@/middleware/auth.middleware'; 

const router = Router();

router.post(
  '/',
  authMiddleware, 
  uploadSingle,   
  UploadController.uploadFile, 
  handleUploadError 
);

export default router;