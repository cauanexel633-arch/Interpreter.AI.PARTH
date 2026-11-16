import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/health', async () => ({
  ok: true,
  service: 'interpreter-ai-parth-diagnostic',
  runtime: process.version,
}));

app.get('/', async () => ({
  ok: true,
  message: 'Fastify diagnostic deployment is running',
}));

await app.listen({
  port: Number(process.env.PORT) || 3000,
  host: '0.0.0.0',
});

console.info('[DIAGNOSTIC] Fastify started');
