import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/health', async () => ({
  ok: true,
  service: 'interpreter-ai-parth-index-diagnostic',
  runtime: process.version,
}));

fastify.get('/', async () => ({
  ok: true,
  message: 'Fastify src/index.ts diagnostic deployment is running',
}));

fastify.listen({
  port: Number(process.env.PORT) || 3000,
  host: '0.0.0.0',
}).then(() => {
  console.info('[DIAGNOSTIC] Fastify src/index.ts started');
}).catch((error) => {
  console.error('[DIAGNOSTIC] Fastify startup failed', error);
  process.exit(1);
});
