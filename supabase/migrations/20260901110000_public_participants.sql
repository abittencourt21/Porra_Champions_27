-- Solo datos de porra que la clasificación puede mostrar; nunca email ni user_id.
create or replace view public.public_participants
with (security_invoker = false) as
select
  p.alias,
  array[e.pot_1_team, e.pot_2_team, e.pot_3_team, e.pot_4_team] as equipos,
  e.champion_team as campeon,
  e.runner_up_team as subcampeon,
  e.top_scorer as pichichi,
  e.submitted_at
from public.profiles p
join public.entries e on e.user_id = p.user_id;

grant select on public.public_participants to anon, authenticated;
