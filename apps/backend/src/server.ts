import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { v2 as cloudinary } from 'cloudinary';

const app = express();
const PORT = process.env.PORT || 4000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const allowedOrigins = [
  'http://localhost:3000',
  'https://gaten.vercel.app',
  'https://gaten-*.vercel.app',
  'https://gatenlabs.com/'
];

// Configure multer to use memory storage for Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/', 'video/', 'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    const isAllowed = allowedTypes.some(type => 
      file.mimetype.startsWith(type) || file.mimetype === type
    );
    
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'Backend server running!' });
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer: Buffer, options: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Regular video upload endpoint (for regular video lessons)
app.post('/api/upload/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    console.log('=== VIDEO UPLOAD ===');
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'video',
      folder: 'gaten-lms/videos',
      public_id: `video_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      transformation: [
        { quality: 'auto:good' },
        { format: 'mp4' }
      ]
    });

    console.log('Video upload successful:', result.secure_url);
    
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0,
      format: result.format,
      resourceType: result.resource_type,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload video',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Assignment file upload
// Assignment file upload with better Cloudinary handling
app.post('/api/upload/assignment-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('=== ASSIGNMENT FILE UPLOAD ===');
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Use different upload strategy based on file type
    let uploadOptions;
    let resourceType: 'image' | 'video' | 'raw' = 'raw';

    if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
      uploadOptions = {
        resource_type: 'image',
        folder: 'gaten-lms/assignments',
        public_id: `assignment_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        transformation: [{ quality: 'auto:good' }]
      };
    } else if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
      uploadOptions = {
        resource_type: 'video',
        folder: 'gaten-lms/assignments',
        public_id: `assignment_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        transformation: [{ quality: 'auto:good' }]
      };
    } else {
      // For documents (PDF, DOC, etc.), use raw but with access mode
      resourceType = 'raw';
      uploadOptions = {
        resource_type: 'raw',
        folder: 'gaten-lms/assignments',
        public_id: `assignment_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        // Add these options for better document handling
        use_filename: true,
        unique_filename: true,
        access_mode: 'authenticated', // This might help with the untrusted issue
      };
    }

    const result = await uploadToCloudinary(req.file.buffer, uploadOptions);

    console.log('Assignment upload successful:', result.secure_url);

    // Generate a signed URL for raw files (documents)
    let viewUrl = result.secure_url;
    if (resourceType === 'raw') {
      // Generate signed URL for document viewing
      viewUrl = cloudinary.utils.private_download_url(result.public_id, result.format || 'pdf', {
        resource_type: 'raw',
        expires_at: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
      });
    }

    res.json({
      success: true,
      url: result.secure_url,
      viewUrl: viewUrl, // Separate view URL for documents
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      resourceType: resourceType,
      size: req.file.size
    });

  } catch (error) {
    console.error('Assignment file upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
// Hotspot image upload
app.post('/api/upload/hotspot-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' });
    }

    console.log('=== HOTSPOT IMAGE UPLOAD ===');
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'image',
      folder: 'gaten-lms/hotspots',
      public_id: `hotspot_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    console.log('Hotspot upload successful:', result.secure_url);

    res.json({
      success: true,
      url: result.secure_url,
      fileName: req.file.originalname,
      width: result.width,
      height: result.height,
      size: req.file.size
    });

  } catch (error) {
    console.error('Hotspot image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Interactive video upload
app.post('/api/upload/interactive-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video provided' });
    }

    if (!req.file.mimetype.startsWith('video/')) {
      return res.status(400).json({ error: 'File must be a video' });
    }

    console.log('=== INTERACTIVE VIDEO UPLOAD ===');
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'video',
      folder: 'gaten-lms/interactive-videos',
      public_id: `interactive_video_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      transformation: [
        { quality: 'auto:good' },
        { format: 'mp4' }
      ]
    });

    console.log('Interactive video upload successful:', result.secure_url);

    res.json({
      success: true,
      url: result.secure_url,
      fileName: req.file.originalname,
      duration: result.duration || 300,
      size: req.file.size
    });

  } catch (error) {
    console.error('Interactive video upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload video',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// tRPC middleware
app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext: ({ req, res }) => ({ req, res }),
}));

app.listen(PORT, () => {
  console.log(`🚀 Backend server: http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
});