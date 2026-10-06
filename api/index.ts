import app from '../server/app.js';

export default function handler(req: any, res: any) {
  // If Vercel has already parsed request body, mark it so body-parser does not re-read stream
  if (req.body && typeof req.body === 'object') {
    (req as any)._body = true;
  }

  let targetUrl = req.url || '/api';

  try {
    const urlObj = new URL(targetUrl, 'http://localhost');
    const queryPath =
      urlObj.searchParams.get('__path') ||
      urlObj.searchParams.get('path') ||
      (req.query && (req.query.__path || req.query.path || req.query['0']));

    if (queryPath && typeof queryPath === 'string') {
      urlObj.searchParams.delete('__path');
      urlObj.searchParams.delete('path');
      const cleanSubpath = queryPath.replace(/^\/+/, '');
      const remainingSearch = urlObj.search;
      targetUrl = `/api/${cleanSubpath}${remainingSearch && remainingSearch !== '?' ? remainingSearch : ''}`;
    } else {
      const rawOriginalUrl =
        (req as any).originalUrl ||
        req.headers?.['x-forwarded-url'] ||
        req.headers?.['x-forwarded-uri'] ||
        req.headers?.['x-matched-path'];

      if (rawOriginalUrl && typeof rawOriginalUrl === 'string' && rawOriginalUrl.startsWith('/api')) {
        targetUrl = rawOriginalUrl;
      }
    }
  } catch {
    // If URL parsing fails, fallback safely to targetUrl
  }

  // Ensure req.url retains /api prefix for Express app.use('/api', api)
  if (!targetUrl.startsWith('/api')) {
    targetUrl = `/api${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
  }

  req.url = targetUrl;
  return app(req, res);
}
