import 'dotenv/config';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/app.js';

async function startServer() {
  const app = createApp();
  const PORT = 3000;

  // Vite middleware in development vs static file serving in production.
  // (Only used for local/self-hosted Node runs — the Vercel deployment
  // serves the built dist/ assets directly and only calls into this app
  // via api/index.ts for /api/* requests.)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ mini2k Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
