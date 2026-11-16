import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

// Reutiliza a aplicação entre invocações "quentes" da função serverless.
let appPromise: Promise<FastifyInstance> | undefined;

function obterApp(): Promise<FastifyInstance> {
  appPromise ??= buildApp()
    .then(async (app) => {
      await app.ready();
      return app;
    })
    .catch((error) => {
      // Se a inicialização falhar, descarta a promessa para a próxima chamada tentar de novo.
      appPromise = undefined;
      throw error;
    });
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await obterApp();
  app.server.emit('request', req, res);
}
