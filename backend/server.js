import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import authRoutes from './routes/v1/authRoutes.js';
import taskRoutes from './routes/v1/taskRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await connectDB();
  await connectRedis();

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors({
    origin: [
      'http://localhost:5173',
      process.env.FRONTEND_URL || ''
    ],
    credentials: true
  }));
  app.use(express.json());

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/tasks', taskRoutes);

  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      host: 'secure-rest-monorepo',
      operational: true,
      timestamp: new Date().toISOString()
    });
  });

  // ✅ FIX: Removed vite import entirely — backend is API only on Render
  // Frontend is deployed separately on Vercel
  if (process.env.NODE_ENV === 'production') {
    app.get('/', (req, res) => {
      res.json({ status: 'API is running' });
    });
  }

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Server processing workspace transactions on port ${PORT}`);
  });
}

startServer();