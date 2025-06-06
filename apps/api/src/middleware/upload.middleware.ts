import multer from 'multer';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function 
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

  if (allValidTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) and documents (PDF, DOC, DOCX) are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware for single file upload
export const uploadSingle = upload.single('file');

// Error handling middleware for multer
export const handleUploadError: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File size exceeds 5MB limit' });
      return; 
    }
    res.status(400).json({ error: `Upload error: ${error.message}` });
    return;
  }
  
  if (error.message.includes('Invalid file type')) {
    res.status(400).json({ error: error.message });
    return;
  }

  // Pass to next error handler if not handled
  next(error);
};