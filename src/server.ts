import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(process.cwd(), 'dist', 'hero-frontend', 'browser');

const app = express();
let angularApp: AngularNodeAppEngine | null = null;

try {
  angularApp = new AngularNodeAppEngine();
} catch (err) {
  // If manifest is not available (e.g., during dev-server), skip SSR initialization
  console.warn('SSR not available (dev mode or missing manifest):', (err as any).message);
}

/**
 * Endpoints da API REST Express de exemplo podem ser definidos aqui.
 * Descomente e defina endpoints conforme necessário.
 *
 * Exemplo:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Trate a solicitação da API
 * });
 * ```
 */

/**
 * Servir arquivos estáticos de /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Trate todas as outras solicitações renderizando a aplicação Angular.
 */
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!angularApp) {
    // SSR not available (dev mode), skip to next middleware
    next();
    return;
  }

  angularApp
    .handle(req)
    .then((response: any) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Inicie o servidor se este módulo for o ponto de entrada principal ou estiver sendo executado via PM2.
 * O servidor ouve na porta definida pela variável de ambiente `PORT` ou usa como padrão 4000.
 */
export function startServer(port: number | string = process.env['PORT'] || 4000) {
  app.listen(Number(port), (error: any) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Manipulador de solicitação usado pelo Angular CLI (para dev-server e durante a build) ou Firebase Cloud Functions.
 */
export const reqHandler = angularApp ? createNodeRequestHandler(app) : app;
