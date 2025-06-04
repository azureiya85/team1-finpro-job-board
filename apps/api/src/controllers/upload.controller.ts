import { Request, Response } from 'express';
import { UploadService } from '@/services/upload.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export class UploadController {
   static async uploadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is authenticated (assuming you have auth middleware)
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check if file exists
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const folder = req.body.folder || 'uploads';

      const result = await UploadService.uploadFile({
        userId,
        folder,
        file: req.file
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Upload controller error:', error);
      res.status(500).json({
        error: 'Failed to upload file'
      });
    }
  }
}