-- Porra Champions 2026/27: Auth + RLS.
-- Ejecutar mediante Supabase CLI/migrations, nunca con service_role en el navegador.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  alias text not null check (char_length(trim(alias)) between 2 and 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  match_id text primary key,
  round_code text not null,
  starts_at timestamptz not null,
  home_team text not null,
  away_team text not null,
  status text not null default 'NS',
  home_score smallint,
  away_score smallint,
  check (home_score is null or home_score >= 0),
  check (away_score is null or away_score >= 0)
);

create table if not exists public.entries (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  pot_1_team text not null,
  pot_2_team text not null,
  pot_3_team text not null,
  pot_4_team text not null,
  champion_team text not null,
  runner_up_team text not null,
  top_scorer text not null check (char_length(trim(top_scorer)) between 2 and 80),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (champion_team <> runner_up_team)
);

create table if not exists public.predictions (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  match_id text not null references public.matches(match_id) on delete cascade,
  home_score smallint not null check (home_score between 0 and 20),
  away_score smallint not null check (away_score between 0 and 20),
  confirmed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

create index if not exists predictions_user_id_idx on public.predictions(user_id);
create index if not exists predictions_match_id_idx on public.predictions(match_id);
create index if not exists matches_starts_at_idx on public.matches(starts_at);

alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.predictions enable row level security;
alter table public.matches enable row level security;

create policy "profiles_owner_select" on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "profiles_owner_insert" on public.profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy "profiles_owner_update" on public.profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "entries_owner_select" on public.entries for select to authenticated using (user_id = (select auth.uid()));
create policy "entries_owner_insert_before_opening" on public.entries for insert to authenticated
  with check (user_id = (select auth.uid()) and now() < (select min(starts_at) from public.matches where round_code like 'J%'));
create policy "entries_owner_update_before_opening" on public.entries for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and now() < (select min(starts_at) from public.matches where round_code like 'J%'));

create policy "predictions_owner_select" on public.predictions for select to authenticated using (user_id = (select auth.uid()));
create policy "matches_authenticated_read" on public.matches for select to authenticated using (true);

-- Solo el RPC escribe pronósticos: no se puede esquivar el cierre desde DevTools.
create or replace function public.save_prediction(target_match_id text, target_home_score smallint, target_away_score smallint)
returns public.predictions language plpgsql security definer set search_path = public as $$
declare saved public.predictions;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if target_home_score not between 0 and 20 or target_away_score not between 0 and 20 then raise exception 'Invalid score'; end if;
  if not exists (select 1 from public.matches m where m.match_id = target_match_id and now() < m.starts_at - interval '1 hour') then
    raise exception 'Prediction window is closed';
  end if;
  insert into public.predictions (user_id, match_id, home_score, away_score, confirmed_at, updated_at)
  values (auth.uid(), target_match_id, target_home_score, target_away_score, now(), now())
  on conflict (user_id, match_id) do update set home_score = excluded.home_score, away_score = excluded.away_score, confirmed_at = now(), updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

revoke all on function public.save_prediction(text, smallint, smallint) from public;
grant execute on function public.save_prediction(text, smallint, smallint) to authenticated;

-- Datos de partidos, resultados y clasificación: solo administración/CI con clave secreta.
revoke insert, update, delete on public.matches from anon, authenticated;
revoke insert, update, delete on public.predictions from anon, authenticated;
