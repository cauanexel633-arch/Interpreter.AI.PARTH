# Interpreter.AI.PARTH
Backend Fastify/TypeScript para criação de armas e mapas por IA no Roblox.

## Rodar
Node.js 20+. Execute `npm install`, copie `.env.example` para `.env`, preencha as credenciais e rode `npm run dev`. Build: `npm run build`; testes: `npm test`.

## Provedor de IA
O backend aceita **OpenAI** e **OpenRouter**, usando `fetch` nativo do Node.js para chamar a API Chat Completions compatível. Isso evita conflitos entre dependências do SDK e a versão do Zod usada pelo projeto.

Para usar OpenRouter:
1. Crie uma chave em [openrouter.ai/keys](https://openrouter.ai/keys).
2. No `.env`, configure `AI_PROVIDER=openrouter`.
3. Coloque a chave em `AI_API_KEY`.
4. Defina `AI_MODEL` com o identificador completo do modelo no formato `provedor/modelo`, conforme o [catálogo do OpenRouter](https://openrouter.ai/models).
5. Deixe `AI_BASE_URL` vazia para usar automaticamente `https://openrouter.ai/api/v1`.

Para usar OpenAI, configure `AI_PROVIDER=openai`, coloque a chave da OpenAI em `AI_API_KEY` e informe o modelo em `AI_MODEL`. `AI_BASE_URL` é opcional e permite sobrescrever o endpoint padrão em ambos os provedores.

Não coloque a chave em scripts do Roblox, no cliente ou no repositório. Mantenha-a somente nas variáveis de ambiente do servidor.

## Supabase
Aplique `supabase/migrations/20261115000100_initial_schema.sql` no SQL Editor/CLI e depois `supabase/seed.sql`. As três tabelas usam RLS sem políticas públicas. Service role só no servidor.

## Chamadas
Arma: `curl -X POST http://localhost:3000/pedidos -H "Authorization: Bearer $GAME_SHARED_TOKEN" -H "Content-Type: application/json" -d '{"jogador_id":123,"tipo":"arma","descricao":"arma leve de cano curto","inventario":{"metal":10,"polvora":2}}'`
Mapa: `curl -X POST http://localhost:3000/pedidos -H "Authorization: Bearer $GAME_SHARED_TOKEN" -H "Content-Type: application/json" -d '{"jogador_id":123,"tipo":"mapa","descricao":"arena pequena com ponte e spawn","inventario":{"metal":10,"madeira":20}}'`

## Decisões / pendências
- O modelo é configurado por `AI_MODEL`; o identificador precisa existir no catálogo do provedor escolhido.
- Rate limit em memória por instância; use Redis para múltiplas réplicas.
- Não foi definida tabela de inventário. Por isso o backend valida o inventário recebido e retorna custo; o Roblox é responsável por aplicar desconto. O RPC grava criação atomicamente, mas não há transação conjunta com inventário externo. Para isso, mover inventário para Supabase e estender o RPC.
- Chão é exigido na mesma célula para estrutura e spawn. Sobreposição somente quando as duas peças têm propriedades.empilhavel=true.
- Seed demonstrativo; alinhar IDs/custos/propriedades ao catálogo real.
- Falhas de negócio HTTP 200, entrada 400 e erro interno 500. Texto inválido é persistido apenas quando jogador/tipo podem ser confiavelmente identificados.
