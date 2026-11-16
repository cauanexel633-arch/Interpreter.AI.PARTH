create extension if not exists pgcrypto;
create table if not exists public.pecas(id text primary key,nome text not null,tipo text not null check(tipo in('arma','mapa')),categoria text not null,custo jsonb not null default'{}',propriedades jsonb not null default'{}',ativo boolean not null default true);
create table if not exists public.criacoes(id uuid primary key default gen_random_uuid(),jogador_id bigint not null,tipo text not null check(tipo in('arma','mapa')),pedido_texto text not null,nome text not null,pecas jsonb,layout jsonb,custo_total jsonb not null default'{}',publico boolean not null default false,criado_em timestamptz not null default now());
create table if not exists public.pedidos_falhos(id uuid primary key default gen_random_uuid(),jogador_id bigint,tipo text not null check(tipo in('arma','mapa')),pedido_texto text,motivo_codigo text not null,motivo_detalhe text,resposta_ia jsonb,criado_em timestamptz not null default now());
create index if not exists criacoes_jogador_id_idx on public.criacoes(jogador_id);
create index if not exists criacoes_tipo_publico_idx on public.criacoes(tipo,publico);
create index if not exists pedidos_falhos_motivo_criado_idx on public.pedidos_falhos(motivo_codigo,criado_em);
alter table public.pecas enable row level security;alter table public.criacoes enable row level security;alter table public.pedidos_falhos enable row level security;
revoke all on public.pecas,public.criacoes,public.pedidos_falhos from anon,authenticated;
create or replace function public.registrar_criacao(p_jogador_id bigint,p_tipo text,p_pedido_texto text,p_nome text,p_pecas jsonb,p_layout jsonb,p_custo_total jsonb) returns uuid language plpgsql security invoker set search_path=public as $$
declare new_id uuid;
begin
 insert into public.criacoes(jogador_id,tipo,pedido_texto,nome,pecas,layout,custo_total) values(p_jogador_id,p_tipo,p_pedido_texto,p_nome,p_pecas,p_layout,coalesce(p_custo_total,'{}'::jsonb)) returning id into new_id;
 return new_id;
end;$$;
revoke all on function public.registrar_criacao(bigint,text,text,text,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.registrar_criacao(bigint,text,text,text,jsonb,jsonb,jsonb) to service_role;