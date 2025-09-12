import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';

const app = express();
const PORT = process.env.PORT || 4000;

// CORS for frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Regular Express health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server running!' });
});

// tRPC API endpoint
app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext: () => ({}),
}));

app.listen(PORT, () => {
  console.log(`🚀 Backend server: http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/trpc`);
});