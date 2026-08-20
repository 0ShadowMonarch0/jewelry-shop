import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes.js';
import { db } from './db.js';
import { isBotUserAgent, renderProductMetaHtml } from './productMeta.js';

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

  // Social-crawler meta tags for product deep links. On Vercel this same
  // content is served via a bot-triggered rewrite in middleware.ts (Vercel's
  // static rewrites serve /product/:slug directly from the CDN, bypassing
  // this Express app entirely, so middleware is what makes bots reach it
  // there). This direct route only matters for self-hosted/dev, where there
  // is no separate static CDN — everything goes through this app already.
  // Real visitors (non-bot) fall through via next() to the normal SPA.
  app.get('/product/:slug', async (req, res, next) => {
    if (!isBotUserAgent(req.headers['user-agent'])) return next();
    try {
      const product = await db.getProductBySlug(req.params.slug);
      if (!product || !product.isActive) return next();
      const settings = await db.getSettings();
      const canonicalUrl = `${req.protocol}://${req.get('host')}/product/${product.slug}`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(renderProductMetaHtml(product, settings, canonicalUrl));
    } catch {
      next();
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'mini2k API', timestamp: new Date().toISOString() });
  });

  return app;
}
