import express from 'express';
import cors from 'cors';
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

app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext,
}));

app.listen(PORT, () => {
  console.log(`🚀 Backend server: http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
});