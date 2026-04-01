import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

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
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Inicie o servidor se este módulo for o ponto de entrada principal ou estiver sendo executado via PM2.
 * O servidor ouve na porta definida pela variável de ambiente `PORT` ou usa como padrão 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Manipulador de solicitação usado pelo Angular CLI (para dev-server e durante a build) ou Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
