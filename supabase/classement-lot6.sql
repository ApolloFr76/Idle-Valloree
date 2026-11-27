-- Idle Vallorée : classement enrichi (lot 6)
-- À lancer une fois dans Supabase (SQL Editor). Peut être relancé sans danger.
-- Reprend les vérifications des lots 4 et 5 (valeurs lues dans la sauvegarde en ligne, comptes signalés gelés)
-- et ajoute :
--   * de nouvelles catégories lues dans la sauvegarde : écus gagnés, monstres vaincus, succès, niveaux de métiers, temps de jeu ;
--   * le classement de la semaine (niveaux, étages de tour et monstres gagnés depuis lundi 0 h UTC) ;
--   * le palmarès : le top 3 de chaque semaine est archivé (il débloque le cadre « Laurier ») ;
--   * les records du serveur : le premier joueur à atteindre chaque palier (niveau 100, Oméga 1, étage 50…).
-- Tant que ce script n'est pas lancé, le jeu garde l'ancien classement (les nouveautés restent masquées).

-- 1) Lecture de la sauvegarde d'un compte (colonne data en texte ou en jsonb)
create or replace function public.vallore_save_json(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare d jsonb;
begin
  select (s.data::text)::jsonb into d from public.saves s where s.user_id = p_user;
  if d is null then return null; end if;
  if jsonb_typeof(d) = 'string' then d := (d #>> '{}')::jsonb; end if;
  return d;
end $$;

-- nombre lu dans la sauvegarde, borné (texte, nombre ou absent → valeur par défaut)
create or replace function public.vallore_num(v text, dflt numeric, lo numeric, hi numeric) returns numeric
language sql immutable as $$
  select least(greatest(coalesce(case when v ~ '^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$' then v::numeric end, dflt), lo), hi)
$$;

-- 2) Nouvelles colonnes
alter table public.classement add column if not exists cadre       text   not null default 'bois';
alter table public.classement add column if not exists embleme     text   not null default 'cls';
alter table public.classement add column if not exists ecus_total  double precision not null default 0;
alter table public.classement add column if not exists kills       bigint not null default 0;
alter table public.classement add column if not exists succes      int    not null default 0;
alter table public.classement add column if not exists metiers     int    not null default 0;
alter table public.classement add column if not exists temps       bigint not null default 0;   -- secondes de jeu
alter table public.classement add column if not exists sem_debut   date;
alter table public.classement add column if not exists sem_lvl     int    not null default 0;
alter table public.classement add column if not exists sem_tour    int    not null default 0;
alter table public.classement add column if not exists sem_kills   bigint not null default 0;

-- 3) Palmarès des semaines et records du serveur (lecture pour les joueurs connectés, écriture par le serveur seulement)
create table if not exists public.classement_palmares (
  semaine date not null,
  critere text not null,
  rang    int  not null,
  user_id uuid not null,
  pseudo  text,
  cls     text,
  valeur  double precision,
  primary key (semaine, critere, rang)
);
create table if not exists public.classement_records (
  cle     text primary key,
  libelle text not null,
  ordre   int  not null default 0,
  user_id uuid not null,
  pseudo  text,
  cls     text,
  at      timestamptz not null default now()
);
alter table public.classement_palmares enable row level security;
alter table public.classement_records  enable row level security;
drop policy if exists palmares_read on public.classement_palmares;
create policy palmares_read on public.classement_palmares for select to authenticated using (true);
drop policy if exists records_read on public.classement_records;
create policy records_read on public.classement_records for select to authenticated using (true);
revoke insert, update, delete on public.classement_palmares from anon, authenticated;
revoke insert, update, delete on public.classement_records  from anon, authenticated;
grant select on public.classement_palmares to authenticated;
grant select on public.classement_records  to authenticated;

-- 4) Archive le top 3 d'une semaine terminée (une seule fois par semaine : les lignes déjà archivées sont gardées)
create or replace function public.classement_archiver(p_sem date) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_sem is null then return; end if;
  insert into public.classement_palmares (semaine, critere, rang, user_id, pseudo, cls, valeur)
  select p_sem, k, rn, user_id, pseudo, cls, v from (
    select 'lvl' k, row_number() over (order by sem_lvl desc, updated_at) rn, user_id, pseudo, cls, sem_lvl::double precision v
      from public.classement where sem_debut = p_sem and sem_lvl > 0
    union all
    select 'tour', row_number() over (order by sem_tour desc, updated_at), user_id, pseudo, cls, sem_tour
      from public.classement where sem_debut = p_sem and sem_tour > 0
    union all
    select 'kills', row_number() over (order by sem_kills desc, updated_at), user_id, pseudo, cls, sem_kills
      from public.classement where sem_debut = p_sem and sem_kills > 0
  ) t where rn <= 3
  on conflict do nothing;
end $$;

-- 5) Avant chaque écriture dans le classement
create or replace function public.classement_verifier() returns trigger
language plpgsql security definer set search_path = public as $$
declare d jsonb; nach int; pr int; ps text; sus boolean; wk date; o_lvl int; o_tour int; o_kills bigint; r record;
begin
  if new.user_id is distinct from auth.uid() then
    raise exception 'classement : on ne peut écrire que sa propre ligne';
  end if;
  if tg_op = 'UPDATE' and old.updated_at is not null and old.updated_at > now() - interval '3 seconds' then
    return old;                                                         -- envoi trop rapproché : on garde la ligne telle quelle
  end if;
  d := public.vallore_save_json(new.user_id);
  if d is null then raise exception 'classement : aucune sauvegarde en ligne pour ce compte'; end if;
  select s.pseudo, s.suspect into ps, sus from public.saves s where s.user_id = new.user_id;

  -- compte signalé (lot 5) : la ligne existante ne bouge plus, et il n'entre pas dans le classement
  if coalesce(sus, false) then
    if tg_op = 'UPDATE' then return old; end if;
    if exists (select 1 from public.classement c where c.user_id = new.user_id) then return new; end if;
    raise exception 'classement : compte en cours de vérification';
  end if;

  new.pseudo      := left(coalesce(ps, new.pseudo, '?'), 20);
  new.cls         := coalesce(d->>'cls', new.cls);
  new.lvl         := public.vallore_num(d->>'lvl', 1, 1, 1000000);
  new.prest       := public.vallore_num(d->>'prest', 0, 0, 1000000);
  new.souls_total := public.vallore_num(d->>'soulsTotal', 0, 0, 9e18);
  new.tour        := public.vallore_num(d#>>'{tower,best}', 0, 0, 10000000);
  new.degats      := least(greatest(coalesce(new.degats, 0), 0), 9e18);   -- dégâts par seconde calculés par le jeu, seulement bornés
  new.ecus_total  := public.vallore_num(d#>>'{st,ecus}', 0, 0, 1e300);
  new.kills       := public.vallore_num(d->>'kills', 0, 0, 9e18);
  new.temps       := public.vallore_num(d->>'time', 0, 0, 9e15);
  select count(*) into nach from jsonb_object_keys(case when jsonb_typeof(d->'ach') = 'object' then d->'ach' else '{}'::jsonb end);
  new.succes      := nach;
  select coalesce(sum(public.vallore_num(j.value->>'lvl', 1, 1, 100000)), 0) into new.metiers
    from jsonb_each(case when jsonb_typeof(d->'jobs') = 'object' then d->'jobs' else '{}'::jsonb end) j;

  -- semaine : ce qui a été gagné depuis lundi 0 h (UTC). Seules les hausses comptent (un passage Oméga ne fait pas perdre de points).
  wk := date_trunc('week', now() at time zone 'utc')::date;
  if tg_op = 'UPDATE' then
    o_lvl := old.lvl; o_tour := old.tour; o_kills := old.kills;
    if old.sem_debut is distinct from wk then
      perform public.classement_archiver(old.sem_debut);              -- première écriture de la semaine : on archive la précédente
      new.sem_debut := wk; new.sem_lvl := 0; new.sem_tour := 0; new.sem_kills := 0;
    else
      new.sem_debut := old.sem_debut; new.sem_lvl := old.sem_lvl; new.sem_tour := old.sem_tour; new.sem_kills := old.sem_kills;
    end if;
    new.sem_lvl   := new.sem_lvl   + greatest(0, new.lvl   - coalesce(o_lvl, new.lvl));
    new.sem_tour  := new.sem_tour  + greatest(0, new.tour  - coalesce(o_tour, new.tour));
    new.sem_kills := new.sem_kills + greatest(0, new.kills - coalesce(o_kills, new.kills));
  else
    new.sem_debut := wk; new.sem_lvl := 0; new.sem_tour := 0; new.sem_kills := 0;
  end if;

  -- cadre : mêmes paliers que dans le jeu (CADRES, js/succes.js) ; « laurier » = au moins une place dans un top 3 hebdomadaire
  pr := public.vallore_num(d->>'prest', 0, 0, 1000000);
  if not (
       new.cadre = 'bois'
    or (new.cadre = 'cuivre'  and nach >= 5)
    or (new.cadre = 'argent'  and nach >= 15)
    or (new.cadre = 'or'      and nach >= 30)
    or (new.cadre = 'givre'   and nach >= 45)
    or (new.cadre = 'braise'  and nach >= 60)
    or (new.cadre = 'omega'   and pr   >= 1)
    or (new.cadre = 'astral'  and nach >= 76)
    or (new.cadre = 'laurier' and exists (select 1 from public.classement_palmares p where p.user_id = new.user_id))
  ) then new.cadre := 'bois'; end if;
  if new.embleme is null or new.embleme not in ('cls','feu','eau','terre','air') then new.embleme := 'cls'; end if;

  -- records du serveur : premier compte à atteindre chaque palier
  for r in select * from (values
      ('lvl100',  'Premier au niveau 100',      10, new.lvl   >= 100),
      ('lvl250',  'Premier au niveau 250',      11, new.lvl   >= 250),
      ('lvl500',  'Premier au niveau 500',      12, new.lvl   >= 500),
      ('lvl750',  'Premier au niveau 750',      13, new.lvl   >= 750),
      ('lvl1000', 'Premier au niveau 1000',     14, new.lvl   >= 1000),
      ('lvl1500', 'Premier au niveau 1500',     15, new.lvl   >= 1500),
      ('lvl2000', 'Premier au niveau 2000',     16, new.lvl   >= 2000),
      ('om1',     'Premier passage Oméga',      20, new.prest >= 1),
      ('om5',     'Premier à Oméga 5',          21, new.prest >= 5),
      ('om10',    'Premier à Oméga 10',         22, new.prest >= 10),
      ('tour25',  'Premier à l''étage 25',      30, new.tour  >= 25),
      ('tour50',  'Premier à l''étage 50',      31, new.tour  >= 50),
      ('tour100', 'Premier à l''étage 100',     32, new.tour  >= 100),
      ('tour200', 'Premier à l''étage 200',     33, new.tour  >= 200),
      ('ach50',   'Premier à 50 succès',        40, nach      >= 50),
      ('achall',  'Premier à 80 succès',        41, nach      >= 80),
      ('met100',  'Premier à 100 niveaux de métiers', 50, new.metiers >= 100),
      ('met300',  'Premier à 300 niveaux de métiers', 51, new.metiers >= 300)
    ) v(cle, libelle, ordre, ok) where ok loop
    insert into public.classement_records (cle, libelle, ordre, user_id, pseudo, cls)
    values (r.cle, r.libelle, r.ordre, new.user_id, new.pseudo, new.cls) on conflict (cle) do nothing;
  end loop;

  new.updated_at := now();
  return new;
end $$;

drop trigger if exists classement_verifier on public.classement;
create trigger classement_verifier before insert or update on public.classement
  for each row execute function public.classement_verifier();

-- 6) Remplit tout de suite les nouvelles colonnes pour les comptes existants (sans compter de progression dans la semaine)
alter table public.classement disable trigger classement_verifier;
update public.classement c set
  ecus_total = public.vallore_num(d#>>'{st,ecus}', 0, 0, 1e300),
  kills      = public.vallore_num(d->>'kills', 0, 0, 9e18),
  temps      = public.vallore_num(d->>'time', 0, 0, 9e15),
  succes     = (select count(*) from jsonb_object_keys(case when jsonb_typeof(d->'ach') = 'object' then d->'ach' else '{}'::jsonb end)),
  metiers    = (select coalesce(sum(public.vallore_num(j.value->>'lvl', 1, 1, 100000)), 0)
                  from jsonb_each(case when jsonb_typeof(d->'jobs') = 'object' then d->'jobs' else '{}'::jsonb end) j),
  sem_debut  = coalesce(c.sem_debut, date_trunc('week', now() at time zone 'utc')::date)
from (select s.user_id, public.vallore_save_json(s.user_id) d from public.saves s) x
where x.user_id = c.user_id and x.d is not null;
alter table public.classement enable trigger classement_verifier;
