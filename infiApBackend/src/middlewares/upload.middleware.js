const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.memoryStorage(); // Store in memory for processing

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
};

// Configure upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    }
});

// Error handler middleware (Express error handler signature)
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File size too large. Max 5MB allowed.' });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
    
    if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    
    next();
};

// Middleware that handles both file and non-file requests
const uploadSingleOptional = (req, res, next) => {
    // Use multer single upload but make it optional
    const uploadMiddleware = upload.single('profilePicture');
    
    uploadMiddleware(req, res, (err) => {
        if (err) {
            // Pass error to error handler
            return handleUploadError(err, req, res, next);
        }
        // Continue even if no file was uploaded
        next();
    });
};

module.exports = {
    uploadSingle: uploadSingleOptional,
    handleUploadError
};
