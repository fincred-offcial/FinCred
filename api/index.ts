import app from '../server/app.js';

export default function handler(req: any, res: any) {
  // Ensure req.url retains /api prefix for Express routing consistency
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}
