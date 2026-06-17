-- ============================================================
-- RL1 · Taller IA Abogacía — esquema del aula en vivo
-- Aplicar en el SQL editor de Supabase (o vía CLI / MCP).
-- Todo el acceso pasa por las API routes del server (service-role),
-- por eso RLS queda activado sin políticas públicas.
-- ============================================================

create extension if not exists pgcrypto;

-- Sesiones (una clase). El docente abre una y comparte el slug.
create table if not exists public.sessions (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null default 'Taller IA Abogacía',
  current_activity text not null default 'lobby',
  activity_config  jsonb not null default '{}'::jsonb,
  status           text not null default 'lobby',   -- lobby | live | ended
  created_at       timestamptz not null default now()
);

-- Participantes de una sesión (identificados por cookie del lado del server).
create table if not exists public.participants (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists participants_session_idx
  on public.participants(session_id);

-- Respuestas (genéricas por actividad).
-- item_key discrimina ítems dentro de una actividad (ej. índice de afirmación V/F).
create table if not exists public.responses (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.sessions(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  activity       text not null,
  item_key       text not null default '',
  payload        jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (session_id, participant_id, activity, item_key)
);

create index if not exists responses_session_activity_idx
  on public.responses(session_id, activity);

-- mantener updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists responses_touch on public.responses;
create trigger responses_touch before update on public.responses
  for each row execute function public.touch_updated_at();

-- RLS: activado, sin políticas públicas (solo service-role del server accede).
alter table public.sessions     enable row level security;
alter table public.participants enable row level security;
alter table public.responses    enable row level security;
