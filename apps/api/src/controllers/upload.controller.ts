import { Request, Response } from 'express';
import { UploadService } from '@/services/upload.service';
import { AuthUser } from '@/types/company';

// Use the global Express Request type that already has AuthUser
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

      // Now we have the real user ID from auth middleware
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
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to upload file'
      });
    }
  }
}