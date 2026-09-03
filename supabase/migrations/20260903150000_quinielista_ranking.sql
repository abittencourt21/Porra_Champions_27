-- Ranking público derivado exclusivamente de quinielas confirmadas.
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
  where m.status in ('FT','AET','AOT','AP','PEN') and m.home_score is not null and m.away_score is not null
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
