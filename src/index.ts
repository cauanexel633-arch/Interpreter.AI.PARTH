import Fastify from 'fastify';
import { config } from './config.js';
import { routes } from './routes/pedidos.js';
import { OpenAIProvider } from './ia/provedor.js';
import { MemoryRateLimiter } from './ratelimit.js';

console.info('[BOOT] modules loaded');

const app = Fastify({
  logger: {
    redact: ['req.headers.authorization'],
  },
});

void routes(
  app,
  new OpenAIProvider(),
  new MemoryRateLimiter(config.RATE_LIMIT_POR_MINUTO),
).catch((error: unknown) => {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error('[BOOT] route registration failed:', err.name, err.message);
  process.exitCode = 1;
});

app.get('/health', async () => ({
  ok: true,
  service: 'interpreter-ai-parth',
}));

console.info('[BOOT] routes registered; starting Fastify');

app.listen({
  port: config.PORT,
  host: '0.0.0.0',
}).then(() => {
  console.info('[BOOT] Fastify listener started');
}).catch((error: unknown) => {
  const err = error instanceof Error ? error : new Error(String(error));
  const safeMessage = err.message
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/\bsk-[A-Za-z0-9_-]+/g, '[REDACTED_API_KEY]');
  console.error('[BOOT] Fastify listener failed:', err.name, safeMessage);
  process.exitCode = 1;
});
