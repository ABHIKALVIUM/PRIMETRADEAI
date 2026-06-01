import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

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

  app.use(cors());
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

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, '../frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, '../frontend'),
    });
    app.use(vite.middlewares);
  }

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Server processing workspace transactions on port ${PORT}`);
  });
}

startServer();