-- Jornada 1 es de cortesía solo para la quiniela. Las selecciones de equipos
-- siguen puntuando normalmente. La inscripción se permite hasta el inicio de J2.
create or replace function public.save_entry(
  target_pot_1 text, target_pot_2 text, target_pot_3 text, target_pot_4 text,
  target_champion text, target_runner_up text, target_player_id text
) returns public.entries language plpgsql security definer set search_path = public as $$
declare saved public.entries; team_count integer; own_submitted_at timestamptz;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if now() >= coalesce(
    (select min(starts_at) from public.matches where round_code = 'J02'),
    (select min(starts_at) from public.matches where round_code like 'J%')
  ) then raise exception 'ENTRY_CLOSED'; end if;
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

-- El Premio Quinielista ignora por completo la jornada de cortesía J1.
create or replace view public.quinielista_ranking
with (security_invoker = false) as
with match_points as (
  select p.user_id, m.round_code,
    case when p.home_score=m.home_score and p.away_score=m.away_score then
      case m.round_code when 'R16' then 6 when 'QF' then 8 when 'SF' then 10 when 'F' then 12 else 3 end
    when sign(p.home_score-p.away_score)=sign(m.home_score-m.away_score) then
      case m.round_code when 'R16' then 2 when 'QF' then 3 when 'SF' then 4 when 'F' then 5 else 1 end
    else 0 end as points,
    case when p.home_score=m.home_score and p.away_score=m.away_score then 1 else 0 end as exacts
  from public.predictions p join public.matches m on m.match_id=p.match_id
  where m.round_code <> 'J01'
    and m.status in ('FT','AET','AOT','AP','PEN') and m.home_score is not null and m.away_score is not null
), totals as (
  select user_id, round_code, sum(points) points, sum(exacts) exacts from match_points group by user_id, round_code
), winners as (
  select user_id, count(*) jornadas_ganadas from totals t where points=(select max(t2.points) from totals t2 where t2.round_code=t.round_code) group by user_id
), aggregate as (
  select user_id, sum(points)::integer puntos_quinielista, sum(exacts)::integer resultados_exactos from totals group by user_id
)
select row_number() over (order by a.puntos_quinielista desc, a.resultados_exactos desc, coalesce(w.jornadas_ganadas,0) desc, pr.alias) posicion,
  pr.alias, a.puntos_quinielista, a.resultados_exactos, coalesce(w.jornadas_ganadas,0)::integer jornadas_ganadas
from aggregate a join public.profiles pr on pr.user_id=a.user_id left join winners w on w.user_id=a.user_id;
grant select on public.quinielista_ranking to anon, authenticated;
