-- A participant may update its entry until the league phase starts.  Preserve
-- priority of the first submitted selection when comparing the four pot picks.
create or replace function public.save_entry(
  target_pot_1 text, target_pot_2 text, target_pot_3 text, target_pot_4 text,
  target_champion text, target_runner_up text, target_player_id text
) returns public.entries language plpgsql security definer set search_path = public as $$
declare saved public.entries; team_count integer; own_submitted_at timestamptz;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if now() >= (select min(starts_at) from public.matches where round_code like 'J%') then raise exception 'ENTRY_CLOSED'; end if;
  if not exists (select 1 from public.tournament_teams where team_name=target_pot_1 and pot=1) or not exists (select 1 from public.tournament_teams where team_name=target_pot_2 and pot=2) or not exists (select 1 from public.tournament_teams where team_name=target_pot_3 and pot=3) or not exists (select 1 from public.tournament_teams where team_name=target_pot_4 and pot=4) then raise exception 'INVALID_POT_TEAM'; end if;
  if not exists (select 1 from public.tournament_teams where team_name in (target_champion,target_runner_up)) then raise exception 'INVALID_FINALIST_TEAM'; end if;
  if target_champion = target_runner_up then raise exception 'CHAMPION_RUNNER_UP_EQUAL'; end if;
  select max(n) into team_count from (select count(*) n from unnest(array[target_pot_1,target_pot_2,target_pot_3,target_pot_4,target_champion,target_runner_up]) t group by t) counts;
  if coalesce(team_count, 0) > 2 then raise exception 'TEAM_OCCURRENCE_LIMIT'; end if;
  select submitted_at into own_submitted_at from public.entries where user_id = auth.uid();
  if exists (
    select 1 from public.entries e
    where e.user_id <> auth.uid()
      and (own_submitted_at is null or e.submitted_at <= own_submitted_at)
      and ((e.pot_1_team = target_pot_1)::int + (e.pot_2_team = target_pot_2)::int + (e.pot_3_team = target_pot_3)::int + (e.pot_4_team = target_pot_4)::int) >= 3
  ) then raise exception 'TOO_SIMILAR_ENTRY'; end if;
  if not exists (select 1 from public.players p where p.player_id = target_player_id and p.active and p.season = '2026-2027' and p.team_name in (select home_team from public.matches union select away_team from public.matches)) then raise exception 'INVALID_TOP_SCORER'; end if;
  insert into public.entries (user_id,pot_1_team,pot_2_team,pot_3_team,pot_4_team,champion_team,runner_up_team,top_scorer,top_scorer_player_id,submitted_at,updated_at)
  select auth.uid(),target_pot_1,target_pot_2,target_pot_3,target_pot_4,target_champion,target_runner_up,p.full_name,p.player_id,now(),now() from public.players p where p.player_id=target_player_id
  on conflict (user_id) do update set pot_1_team=excluded.pot_1_team,pot_2_team=excluded.pot_2_team,pot_3_team=excluded.pot_3_team,pot_4_team=excluded.pot_4_team,champion_team=excluded.champion_team,runner_up_team=excluded.runner_up_team,top_scorer=excluded.top_scorer,top_scorer_player_id=excluded.top_scorer_player_id,updated_at=now()
  returning * into saved;
  return saved;
end; $$;
