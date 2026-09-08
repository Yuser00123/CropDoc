import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { createApp } from './server/app';

async function startServer() {
  const app = createApp();
  app.use(express.static(path.resolve('public')));
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => res.sendFile(path.resolve('dist/index.html')));
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }
  app.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('CropDoc listening on port', process.env.PORT || 3000));
}
startServer().catch(() => { console.error('CropDoc failed to start. Check configuration.'); process.exit(1); });
