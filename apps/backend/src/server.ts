import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { createContext } from './trpc';
import { upload, uploadVideoToCloudinary } from './upload';

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  'http://localhost:3000',
  'https://gaten.vercel.app',
  'https://gaten-*.vercel.app',
  'https://gatenlabs.com/'
];

const assignmentUpload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for assignments (we'll validate on frontend)
    cb(null, true);
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

// Video upload endpoint
app.post('/api/upload/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const result = await uploadVideoToCloudinary(req.file.buffer, req.file.originalname);
    
    // Log the full Cloudinary response to debug
    console.log('Cloudinary upload result:', result);
    
    res.json({
      success: true,
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
      duration: (result as any).duration,
      format: (result as any).format,
      resourceType: (result as any).resource_type,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload video',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// Assignment file upload endpoint
app.post('/api/upload/assignment-file', assignmentUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // For now, we'll use a simple file storage approach
    // In production, you'd upload to cloud storage (Cloudinary, AWS S3, etc.)
    const fileName = `assignment_${Date.now()}_${req.file.originalname}`;
    const fileUrl = `http://localhost:4000/uploads/assignments/${fileName}`;
    
    // Save file to uploads directory (create this directory)
    const fs = require('fs');
    const uploadDir = path.join(__dirname, '../uploads/assignments');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(uploadDir, fileName), req.file.buffer);
    
    res.json({
      success: true,
      url: fileUrl,
      fileName: req.file.originalname,
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

// Serve uploaded assignment files
app.use('/uploads/assignments', express.static(path.join(__dirname, '../uploads/assignments')));

app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext,
}));

app.listen(PORT, () => {
  console.log(`🚀 Backend server: http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
});