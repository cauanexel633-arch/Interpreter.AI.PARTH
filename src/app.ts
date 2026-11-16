import Fastify, { type FastifyInstance } from 'fastify';
import { config } from './config.js';
import { routes } from './routes/pedidos.js';
import { OpenAIProvider } from './ia/provedor.js';
import { MemoryRateLimiter } from './ratelimit.js';

/**
 * Cria a aplicação Fastify sem abrir porta.
 * Usada tanto pelo servidor local (src/server.ts) quanto pela função serverless da Vercel (api/index.ts).
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      redact: ['req.headers.authorization'],
    },
  });

  await routes(
    app,
    new OpenAIProvider(),
    new MemoryRateLimiter(config.RATE_LIMIT_POR_MINUTO),
  );

  app.get('/health', async () => ({
    ok: true,
    service: 'interpreter-ai-parth',
  }));

  return app;
}
