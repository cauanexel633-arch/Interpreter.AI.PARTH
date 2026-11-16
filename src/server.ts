import Fastify from 'fastify';
import { config } from './config.js';
import { routes } from './routes/pedidos.js';
import { OpenAIProvider } from './ia/provedor.js';
import { MemoryRateLimiter } from './ratelimit.js';

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

await app.listen({
  port: config.PORT,
  host: '0.0.0.0',
});
