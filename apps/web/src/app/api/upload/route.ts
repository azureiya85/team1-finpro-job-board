import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import cloudinary, { UploadApiResponse } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type based on folder/usage
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

    if (!allValidTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) and documents (PDF, DOC, DOCX) are allowed.' },
        { status: 400 }
      );
    }

    // Check if file type matches expected usage
    const isImage = imageTypes.includes(file.type);
    const isDocument = documentTypes.includes(file.type);
    const isImageFolder = ['company-logos', 'company-banners', 'profile-images'].includes(folder);
    const isDocumentFolder = ['cv-uploads', 'documents', 'resumes'].includes(folder);

    if (isImageFolder && !isImage) {
      return NextResponse.json(
        { error: 'Only image files are allowed for this upload type.' },
        { status: 400 }
      );
    }

    if (isDocumentFolder && !isDocument) {
      return NextResponse.json(
        { error: 'Only document files (PDF, DOC, DOCX) are allowed for this upload type.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
    // For documents, no transformation needed

    // Upload to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `job-portal/${folder}`,
          public_id: `${session.user.id}_${Date.now()}`,
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
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      originalName: file.name,
      size: file.size,
      type: file.type,
      fileType: isImage ? 'image' : 'document',
      ...(isImage && { 
        width: uploadResult.width, 
        height: uploadResult.height 
      })
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}