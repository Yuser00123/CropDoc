import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { requestSchema, validateImage } from './validation';
import { configuredProviders, diagnose } from './providers';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Set only for a deployment with a known, fixed number of trusted proxy hops.
  if (process.env.TRUST_PROXY_HOPS) app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));
  app.use(helmet({ contentSecurityPolicy: false, frameguard: false, crossOriginResourcePolicy: false }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'CropDoc AI', aiConfigured: configuredProviders().length > 0 }));
  app.use('/api/diagnose', rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please wait a minute.' } }));
  app.use(express.json({ limit: '8mb' }));
  app.post('/api/diagnose', async (req, res) => {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Provide a valid image, language, and optional crop/location context.' });
    const { imageBase64, mimeType, language, crop, location } = parsed.data;
    let image: string;
    try { image = await validateImage(imageBase64, mimeType); }
    catch { return res.status(400).json({ success: false, error: 'Use a valid JPEG, PNG, or WebP image under 5 MB and 25 megapixels.' }); }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 35000);
    const onClose = () => controller.abort();
    res.on('close', onClose);
    try {
      const result = await diagnose(image, language, crop, location, controller.signal);
      if (!res.destroyed) res.json(result);
    } catch (error) {
      if (!res.destroyed) res.status(503).json({ success: false, error: error instanceof Error && error.message === 'NOT_CONFIGURED'
        ? 'AI service is not configured. Please contact the demo operator.' : 'AI assessment is unavailable. Please try again shortly.' });
    } finally { clearTimeout(timer); res.off('close', onClose); }
  });
  app.use('/api', (_req, res) => res.status(404).json({ success: false, error: 'Unknown API endpoint.' }));
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.type === 'entity.too.large' ? 413 : 400).json({ success: false, error: 'Invalid or oversized request body.' });
  });
  return app;
}
