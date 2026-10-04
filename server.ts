import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './server/app.js';

const PORT = Number(process.env.PORT) || 3000;

export async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Client-side SPA routing fallback for non-API routes
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).setHeader('Content-Type', 'application/json').json({
          success: false,
          error: {
            code: 'API_NOT_FOUND',
            message: `API endpoint ${req.method} ${req.path} not found`
          }
        });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });

    // In dev mode, block Vite SPA fallback from answering API routes with index.html
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).setHeader('Content-Type', 'application/json').json({
          success: false,
          error: {
            code: 'API_NOT_FOUND',
            message: `API endpoint ${req.method} ${req.path} not found`
          }
        });
      }
      vite.middlewares(req, res, next);
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinCred Cloud Server running on http://0.0.0.0:${PORT}`);
  });

  return server;
}

export { app };
export default app;

// In standalone execution, start listening
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
if (!isServerless) {
  startServer();
}
