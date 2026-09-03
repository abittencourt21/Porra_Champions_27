-- Permite un Pichichi provisional mientras se completa el catálogo UEFA.
create or replace function public.save_entry(target_pot_1 text,target_pot_2 text,target_pot_3 text,target_pot_4 text,target_champion text,target_runner_up text,target_player_id text)
returns public.entries language plpgsql security definer set search_path = public as $$
declare saved public.entries; scorer text; scorer_id text; team_count integer;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if now() >= (select min(starts_at) from public.matches where round_code like 'J%') then raise exception 'ENTRY_CLOSED'; end if;
  if not exists (select 1 from public.tournament_teams where team_name=target_pot_1 and pot=1) or not exists (select 1 from public.tournament_teams where team_name=target_pot_2 and pot=2) or not exists (select 1 from public.tournament_teams where team_name=target_pot_3 and pot=3) or not exists (select 1 from public.tournament_teams where team_name=target_pot_4 and pot=4) then raise exception 'INVALID_POT_TEAM'; end if;
  if not exists (select 1 from public.tournament_teams where team_name in (target_champion,target_runner_up)) or target_champion=target_runner_up then raise exception 'INVALID_FINALISTS'; end if;
  select max(n) into team_count from (select count(*) n from unnest(array[target_pot_1,target_pot_2,target_pot_3,target_pot_4,target_champion,target_runner_up]) t group by t) x;
  if coalesce(team_count,0)>2 then raise exception 'TEAM_OCCURRENCE_LIMIT'; end if;
  if target_player_id like 'manual:%' then scorer:=nullif(trim(substr(target_player_id,8)), ''); scorer_id:=null;
  else select full_name,player_id into scorer,scorer_id from public.players where player_id=target_player_id and active; end if;
  if scorer is null then raise exception 'INVALID_TOP_SCORER'; end if;
  insert into public.entries (user_id,pot_1_team,pot_2_team,pot_3_team,pot_4_team,champion_team,runner_up_team,top_scorer,top_scorer_player_id,submitted_at,updated_at)
  values (auth.uid(),target_pot_1,target_pot_2,target_pot_3,target_pot_4,target_champion,target_runner_up,scorer,scorer_id,now(),now())
  on conflict (user_id) do update set pot_1_team=excluded.pot_1_team,pot_2_team=excluded.pot_2_team,pot_3_team=excluded.pot_3_team,pot_4_team=excluded.pot_4_team,champion_team=excluded.champion_team,runner_up_team=excluded.runner_up_team,top_scorer=excluded.top_scorer,top_scorer_player_id=excluded.top_scorer_player_id,updated_at=now() returning * into saved;
  return saved;
end; $$;
