import cloudinary, { UploadApiResponse } from '@/lib/cloudinary';

export interface UploadFileOptions {
  userId: string;
  folder?: string;
  file: Express.Multer.File;
}

export interface UploadResult {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  type: string;
}

export class UploadService {
  static async uploadFile({ userId, folder = 'uploads', file }: UploadFileOptions): Promise<UploadResult> {
    try {
      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: `job-portal/${folder}`,
            public_id: `${userId}_${Date.now()}`,
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error('Upload failed: No result returned'));
            }
          }
        ).end(file.buffer);
      });

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype
      };
    } catch (error) {
      console.error('Upload service error:', error);
      throw new Error('Failed to upload file to cloud storage');
    }
  }
}