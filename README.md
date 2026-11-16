# Interpreter.AI.PARTH
Backend Fastify/TypeScript para criação de armas e mapas por IA no Roblox.

## Rodar
Node.js 20+. Execute `npm install`, copie `.env.example` para `.env`, preencha as credenciais e rode `npm run dev`. Build: `npm run build`; testes: `npm test`.

## Supabase
Aplique `supabase/migrations/20261115000100_initial_schema.sql` no SQL Editor/CLI e depois `supabase/seed.sql`. As três tabelas usam RLS sem políticas públicas. Service role só no servidor.

## Chamadas
Arma: `curl -X POST http://localhost:3000/pedidos -H "Authorization: Bearer $GAME_SHARED_TOKEN" -H "Content-Type: application/json" -d '{"jogador_id":123,"tipo":"arma","descricao":"arma leve de cano curto","inventario":{"metal":10,"polvora":2}}'`
Mapa: `curl -X POST http://localhost:3000/pedidos -H "Authorization: Bearer $GAME_SHARED_TOKEN" -H "Content-Type: application/json" -d '{"jogador_id":123,"tipo":"mapa","descricao":"arena pequena com ponte e spawn","inventario":{"metal":10,"madeira":20}}'`

## Decisões / pendências
- Provedor inicial: SDK OpenAI com JSON mode; modelo configurado em AI_MODEL; AI_BASE_URL aceita endpoint compatível.
- Rate limit em memória por instância; use Redis para múltiplas réplicas.
- Não foi definida tabela de inventário. Por isso o backend valida o inventário recebido e retorna custo; o Roblox é responsável por aplicar desconto. O RPC grava criação atomicamente, mas não há transação conjunta com inventário externo. Para isso, mover inventário para Supabase e estender o RPC.
- Chão é exigido na mesma célula para estrutura e spawn. Sobreposição somente quando as duas peças têm propriedades.empilhavel=true.
- Seed demonstrativo; alinhar IDs/custos/propriedades ao catálogo real.
- Falhas de negócio HTTP 200, entrada 400 e erro interno 500. Texto inválido é persistido apenas quando jogador/tipo podem ser confiavelmente identificados.
