import Fastify from 'fastify';

let bootStage = 'starting';

try {
  console.info('[BOOT] startup');

  bootStage = 'loading configuration';
  const { config } = await import('./config.js');
  console.info('[BOOT] configuration loaded');

  bootStage = 'loading request routes and database client';
  const { routes } = await import('./routes/pedidos.js');
  console.info('[BOOT] routes and database client loaded');

  bootStage = 'loading AI provider';
  const { OpenAIProvider } = await import('./ia/provedor.js');
  console.info('[BOOT] AI provider loaded');

  bootStage = 'loading rate limiter';
  const { MemoryRateLimiter } = await import('./ratelimit.js');
  console.info('[BOOT] rate limiter loaded');

  bootStage = 'creating Fastify instance';
  const app = Fastify({
    logger: {
      redact: ['req.headers.authorization'],
    },
  });

  bootStage = 'registering application routes';
  await routes(
    app,
    new OpenAIProvider(),
    new MemoryRateLimiter(config.RATE_LIMIT_POR_MINUTO),
  );
  console.info('[BOOT] application routes registered');

  bootStage = 'registering health route';
  app.get('/health', async () => ({
    ok: true,
    service: 'interpreter-ai-parth',
  }));

  bootStage = 'starting Fastify listener';
  await app.listen({
    port: config.PORT,
    host: '0.0.0.0',
  });

  console.info('[BOOT] Fastify listener started');
} catch (error) {
  const err = error instanceof Error ? error : new Error(String(error));
  const safeMessage = err.message
    .replace(/Bearer\\s+\\S+/gi, 'Bearer [REDACTED]')
    .replace(/\\bsk-[A-Za-z0-9_-]+/g, '[REDACTED_API_KEY]');

  console.error(
    `[BOOT] startup failed at "${bootStage}": ${err.name}: ${safeMessage}`,
  );

  throw error;
}
