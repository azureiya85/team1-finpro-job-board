import { Request, Response } from 'express';
import { UploadService } from '@/services/upload.service';
import { AuthUser } from '@/types/company';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export class UploadController {
  static async uploadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('Upload request received:', {
        file: req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file',
        user: req.user,
        body: req.body
      });

      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check if file exists
      if (!req.file) {
        console.log('No file provided in request');
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      console.log('File details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      const folder = req.body.folder || 'uploads';

      // Validate file size (5MB max) - additional check
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        res.status(400).json({ error: 'File size exceeds 5MB limit' });
        return;
      }

      const result = await UploadService.uploadFile({
        userId,
        folder,
        file: req.file
      });

      console.log('Upload successful:', result);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Upload controller error:', error);
      
      // Return specific error messages from service
      if (error instanceof Error) {
        const statusCode = error.message.includes('Invalid file type') || 
                          error.message.includes('Only image files') || 
                          error.message.includes('Only document files') ? 400 : 500;
        
        res.status(statusCode).json({
          error: error.message
        });
      } else {
        res.status(500).json({
          error: 'Failed to upload file'
        });
      }
    }
  }
}