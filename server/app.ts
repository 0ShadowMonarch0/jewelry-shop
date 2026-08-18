import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes.js';

export function createApp() {
  const app = express();

  // Middleware for parsing JSON with support for base64 images (10mb limit)
  app.use(express.json({ limit: '12mb' }));
  app.use(express.urlencoded({ extended: true, limit: '12mb' }));
  app.use(cookieParser());

  // Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // For admin routes, prevent indexing
    if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }
    next();
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'AURA Jewelry Atelier API', timestamp: new Date().toISOString() });
  });

  return app;
}
