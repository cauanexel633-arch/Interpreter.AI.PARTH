// Ponto de entrada para execução local (npm run dev / npm start).
// Na Vercel, o entrypoint é api/index.ts.
import { buildApp } from './app.js';
import { config } from './config.js';

const app = await buildApp();
await app.listen({ port: config.PORT, host: '0.0.0.0' });
console.info(`[BOOT] servidor ouvindo na porta ${config.PORT}`);
