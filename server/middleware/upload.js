const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    if (file.fieldname === 'grainImages') {
      folder += 'grains/';
    } else if (file.fieldname === 'profileImage') {
      folder += 'profiles/';
    } else if (file.fieldname === 'qualityImages') {
      folder += 'quality/';
    } else {
      folder += 'misc/';
    }
    
    // Create folder if it doesn't exist
    const fullPath = path.join(__dirname, '../', folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Middleware for handling single file upload
exports.uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB.'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Too many files. Maximum 10 files allowed.'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Middleware for handling multiple file upload
exports.uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB per file.'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum ${maxCount} files allowed.`
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: 'Unexpected field name in file upload.'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Middleware for handling multiple fields with files
exports.uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB per file.'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Too many files uploaded.'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Utility function to delete uploaded file
exports.deleteFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`File deleted: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

// Utility function to get file URL
exports.getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

// Middleware to serve uploaded files
exports.serveUploads = (req, res, next) => {
  if (req.url.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '../', req.url);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } else {
    next();
  }
};
