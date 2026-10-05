import app from '../server/app.js';

export default function handler(req: any, res: any) {
  // Extract and restore original requested path if rewritten or stripped by hosting environment
  const rawOriginalUrl =
    (req as any).originalUrl ||
    req.headers?.['x-forwarded-url'] ||
    req.headers?.['x-forwarded-uri'] ||
    req.headers?.['x-matched-path'];

  if (rawOriginalUrl && typeof rawOriginalUrl === 'string' && rawOriginalUrl.startsWith('/api/')) {
    req.url = rawOriginalUrl;
  } else if (req.query && (req.query.path || req.query['0'])) {
    const subpath = req.query.path || req.query['0'];
    req.url = `/api/${String(subpath).replace(/^\/+/, '')}`;
  }

  // Ensure req.url retains /api prefix for Express routing consistency
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  return app(req, res);
}
