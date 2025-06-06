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
  fileType: 'image' | 'document';
  width?: number;
  height?: number;
}

export class UploadService {
  static async uploadFile({ userId, folder = 'uploads', file }: UploadFileOptions): Promise<UploadResult> {
    try {
      // Validate file type
      const imageTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
      ];

      const documentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      const allValidTypes = [...imageTypes, ...documentTypes];

      if (!allValidTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) and documents (PDF, DOC, DOCX) are allowed.');
      }

      // Check if file type matches expected usage
      const isImage = imageTypes.includes(file.mimetype);
      const isDocument = documentTypes.includes(file.mimetype);
      const isImageFolder = ['company-logos', 'company-banners', 'profile-images'].includes(folder);
      const isDocumentFolder = ['cv-uploads', 'documents', 'resumes'].includes(folder);

      if (isImageFolder && !isImage) {
        throw new Error('Only image files are allowed for this upload type.');
      }

      if (isDocumentFolder && !isDocument) {
        throw new Error('Only document files (PDF, DOC, DOCX) are allowed for this upload type.');
      }

      // Determine resource type and transformation based on file type and folder
      let resourceType: 'image' | 'auto' = 'auto';
      let transformation = {};
      
      if (isImage) {
        resourceType = 'image';
        if (folder === 'company-logos') {
          transformation = {
            width: 400,
            height: 400,
            crop: 'fit',
            quality: 'auto',
            format: 'auto'
          };
        } else if (folder === 'company-banners') {
          transformation = {
            width: 1200,
            height: 675, // 16:9 aspect ratio
            crop: 'fit',
            quality: 'auto',
            format: 'auto'
          };
        } else if (folder === 'profile-images') {
          transformation = {
            width: 300,
            height: 300,
            crop: 'fill',
            quality: 'auto',
            format: 'auto'
          };
        }
      }

      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: `job-portal/${folder}`,
            public_id: `${userId}_${Date.now()}`,
            use_filename: true,
            unique_filename: true,
            ...(isImage && Object.keys(transformation).length > 0 ? { transformation } : {})
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
        type: file.mimetype,
        fileType: isImage ? 'image' : 'document',
        ...(isImage && { 
          width: uploadResult.width, 
          height: uploadResult.height 
        })
      };
    } catch (error) {
      console.error('Upload service error:', error);
      throw error instanceof Error ? error : new Error('Failed to upload file to cloud storage');
    }
  }
}