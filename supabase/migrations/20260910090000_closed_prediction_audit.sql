-- Consulta auditable de quinielas. Las predicciones siguen protegidas por RLS;
-- esta vista solo expone a usuarios autenticados las que ya no se pueden editar.
create or replace view public.closed_prediction_audit
with (security_invoker = false, security_barrier = true) as
select
  pr.alias,
  p.match_id,
  m.round_code,
  m.starts_at,
  m.home_team,
  m.away_team,
  m.status,
  m.home_score as official_home_score,
  m.away_score as official_away_score,
  p.home_score as prediction_home_score,
  p.away_score as prediction_away_score,
  p.confirmed_at
from public.predictions p
join public.profiles pr on pr.user_id = p.user_id
join public.matches m on m.match_id = p.match_id
where now() >= m.starts_at - interval '1 hour';

revoke all on public.closed_prediction_audit from anon;
grant select on public.closed_prediction_audit to authenticated;
