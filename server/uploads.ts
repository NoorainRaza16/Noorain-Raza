import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different file types
const imageDir = path.join(uploadsDir, "images");
const blogImageDir = path.join(uploadsDir, "blog-images");
const resumeDir = path.join(uploadsDir, "resumes");

[imageDir, blogImageDir, resumeDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fieldName = file.fieldname;
    const uploadType = req.params?.type;
    
    // Determine destination based on upload type or file characteristics
    if (uploadType === 'resume' || 
        fieldName === "resume" || 
        file.mimetype === "application/pdf" || 
        file.mimetype === "application/msword" || 
        file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      cb(null, resumeDir);
    } else if (uploadType === 'blog-image') {
      cb(null, blogImageDir);
    } else if (uploadType === 'image' || 
               fieldName === "profileImage" || 
               file.mimetype.startsWith("image/")) {
      cb(null, imageDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${sanitizedBasename}_${timestamp}${ext}`);
  }
});

// File filter for security
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const allowedDocumentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  const uploadType = req.params?.type;
  
  if (file.fieldname === "profileImage" || (uploadType === "image" && file.fieldname === "file")) {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed for profile images"));
    }
  } else if (file.fieldname === "resume" || (uploadType === "resume" && file.fieldname === "file")) {
    if (allowedDocumentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents are allowed for resumes"));
    }
  } else {
    // Generic file upload - check by mimetype
    if (allowedImageTypes.includes(file.mimetype) || allowedDocumentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed. Please upload images (JPEG, PNG, GIF, WebP) or documents (PDF, DOC, DOCX)"));
    }
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 2 // Maximum 2 files per request
  }
});

// Middleware for handling file uploads
export const handleFileUpload = (fieldNames: string[]) => {
  const fields = fieldNames.map(name => ({ name, maxCount: 1 }));
  return upload.fields(fields);
};

// Image optimization configuration
const IMAGE_OPTIMIZATION_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  progressive: true,
  formats: ['webp', 'jpeg'] as const,
  thumbnailSizes: [
    { width: 400, height: 300, suffix: 'thumb' },
    { width: 800, height: 600, suffix: 'medium' },
  ]
};

// Helper function to optimize and process images
export const optimizeImage = async (inputPath: string, outputDir: string, originalFilename: string, imageType: 'image' | 'blog-image' = 'image'): Promise<{
  optimized: string[];
  thumbnails: { size: string; path: string; url: string }[];
}> => {
  const fileBaseName = path.parse(originalFilename).name;
  const timestamp = Date.now();
  const optimizedFiles: string[] = [];
  const thumbnails: { size: string; path: string; url: string }[] = [];

  try {
    // Load the original image
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Optimizing image: ${originalFilename} (${metadata.width}x${metadata.height})`);

    // Calculate optimal dimensions while maintaining aspect ratio
    let { width = 0, height = 0 } = metadata;
    const aspectRatio = width / height;
    
    if (width > IMAGE_OPTIMIZATION_CONFIG.maxWidth) {
      width = IMAGE_OPTIMIZATION_CONFIG.maxWidth;
      height = Math.round(width / aspectRatio);
    }
    
    if (height > IMAGE_OPTIMIZATION_CONFIG.maxHeight) {
      height = IMAGE_OPTIMIZATION_CONFIG.maxHeight;
      width = Math.round(height * aspectRatio);
    }

    // Generate optimized main image in multiple formats
    for (const format of IMAGE_OPTIMIZATION_CONFIG.formats) {
      const optimizedFilename = `${fileBaseName}_${timestamp}_optimized.${format}`;
      const optimizedPath = path.join(outputDir, optimizedFilename);
      
      let sharpInstance = image
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });

      if (format === 'webp') {
        sharpInstance = sharpInstance.webp({
          quality: IMAGE_OPTIMIZATION_CONFIG.quality,
          effort: 6
        });
      } else if (format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({
          quality: IMAGE_OPTIMIZATION_CONFIG.quality,
          progressive: IMAGE_OPTIMIZATION_CONFIG.progressive,
          mozjpeg: true
        });
      }

      await sharpInstance.toFile(optimizedPath);
      optimizedFiles.push(optimizedFilename);
      
      console.log(`Generated optimized ${format}: ${optimizedFilename} (${width}x${height})`);
    }

    // Generate thumbnails
    for (const thumbSize of IMAGE_OPTIMIZATION_CONFIG.thumbnailSizes) {
      const thumbFilename = `${fileBaseName}_${timestamp}_${thumbSize.suffix}.webp`;
      const thumbPath = path.join(outputDir, thumbFilename);
      
      await image
        .resize(thumbSize.width, thumbSize.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({
          quality: 80,
          effort: 6
        })
        .toFile(thumbPath);
      
      thumbnails.push({
        size: `${thumbSize.width}x${thumbSize.height}`,
        path: thumbPath,
        url: getFileUrl(thumbFilename, imageType)
      });
      
      console.log(`Generated thumbnail: ${thumbFilename} (${thumbSize.width}x${thumbSize.height})`);
    }

    // Clean up original uploaded file
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    return { optimized: optimizedFiles, thumbnails };
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to get file URL
export const getFileUrl = (filename: string, type: 'image' | 'blog-image' | 'resume' = 'image'): string => {
  if (type === 'resume') {
    return `/uploads/resumes/${filename}`;
  } else if (type === 'blog-image') {
    return `/uploads/blog-images/${filename}`;
  } else {
    return `/uploads/images/${filename}`;
  }
};

// Helper function to delete old files
export const deleteFile = (filepath: string): boolean => {
  try {
    const fullPath = path.join(process.cwd(), filepath.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

// Error handling middleware for multer
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 10MB."
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field or too many files."
      });
    }
  }
  
  if (error.message.includes("File type not allowed") || 
      error.message.includes("Only image files") ||
      error.message.includes("Only PDF and Word")) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};