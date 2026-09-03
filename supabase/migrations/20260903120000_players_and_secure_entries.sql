-- Catálogo UEFA de jugadores y única vía de escritura para inscripciones.
create table if not exists public.players (
  player_id text primary key,
  season text not null,
  competition text not null,
  team_id text not null,
  team_name text not null,
  full_name text not null,
  normalized_name text not null,
  position text,
  shirt_number text,
  uefa_list_type text,
  source_provider text not null,
  source_url text not null,
  source_updated_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournament_teams (
  team_name text primary key,
  pot smallint not null check (pot between 1 and 4),
  season text not null default '2026-2027'
);

alter table public.entries add column if not exists top_scorer_player_id text references public.players(player_id);
create index if not exists players_active_season_idx on public.players (season, active, team_name);
alter table public.players enable row level security;
alter table public.tournament_teams enable row level security;
create policy "players_authenticated_read" on public.players for select to authenticated using (true);
create policy "tournament_teams_authenticated_read" on public.tournament_teams for select to authenticated using (true);

create or replace function public.save_entry(
  target_pot_1 text, target_pot_2 text, target_pot_3 text, target_pot_4 text,
  target_champion text, target_runner_up text, target_player_id text
) returns public.entries language plpgsql security definer set search_path = public as $$
declare saved public.entries; team_count integer;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if now() >= (select min(starts_at) from public.matches where round_code like 'J%') then raise exception 'ENTRY_CLOSED'; end if;
  if not exists (select 1 from public.tournament_teams where team_name=target_pot_1 and pot=1) or not exists (select 1 from public.tournament_teams where team_name=target_pot_2 and pot=2) or not exists (select 1 from public.tournament_teams where team_name=target_pot_3 and pot=3) or not exists (select 1 from public.tournament_teams where team_name=target_pot_4 and pot=4) then raise exception 'INVALID_POT_TEAM'; end if;
  if not exists (select 1 from public.tournament_teams where team_name in (target_champion,target_runner_up)) then raise exception 'INVALID_FINALIST_TEAM'; end if;
  if target_champion = target_runner_up then raise exception 'CHAMPION_RUNNER_UP_EQUAL'; end if;
  select max(n) into team_count from (
    select count(*) n from unnest(array[target_pot_1,target_pot_2,target_pot_3,target_pot_4,target_champion,target_runner_up]) t group by t
  ) counts;
  if coalesce(team_count, 0) > 2 then raise exception 'TEAM_OCCURRENCE_LIMIT'; end if;
  if not exists (select 1 from public.players p where p.player_id = target_player_id and p.active and p.season = '2026-2027' and p.team_name in (select home_team from public.matches union select away_team from public.matches)) then raise exception 'INVALID_TOP_SCORER'; end if;
  insert into public.entries (user_id,pot_1_team,pot_2_team,pot_3_team,pot_4_team,champion_team,runner_up_team,top_scorer,top_scorer_player_id,submitted_at,updated_at)
  select auth.uid(),target_pot_1,target_pot_2,target_pot_3,target_pot_4,target_champion,target_runner_up,p.full_name,p.player_id,now(),now() from public.players p where p.player_id=target_player_id
  on conflict (user_id) do update set pot_1_team=excluded.pot_1_team,pot_2_team=excluded.pot_2_team,pot_3_team=excluded.pot_3_team,pot_4_team=excluded.pot_4_team,champion_team=excluded.champion_team,runner_up_team=excluded.runner_up_team,top_scorer=excluded.top_scorer,top_scorer_player_id=excluded.top_scorer_player_id,updated_at=now()
  returning * into saved;
  return saved;
end; $$;

revoke insert, update, delete on public.entries from anon, authenticated;
revoke insert, update, delete on public.tournament_teams from anon, authenticated;
revoke all on function public.save_entry(text,text,text,text,text,text,text) from public;
grant execute on function public.save_entry(text,text,text,text,text,text,text) to authenticated;
