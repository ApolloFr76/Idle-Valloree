-- Sécurité Supabase pour Les Terres de Vallorée
-- Exécuter ce script dans l'éditeur SQL (SQL Editor) du projet Supabase.
-- Idempotent : peut être relancé sans danger après mise à jour.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Table public.saves : validation taille/JSON/pseudo + RLS strict par user_id
CREATE OR REPLACE FUNCTION public.validate_save_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_json jsonb;
BEGIN
  IF NEW.user_id IS NULL OR NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  IF NEW.pseudo IS NULL OR NEW.pseudo !~ '^[A-Za-z0-9_-]{3,20}$' THEN
    RAISE EXCEPTION 'Pseudo invalide';
  END IF;

  IF NEW.data IS NULL OR octet_length(NEW.data::text) > 500000 THEN
    RAISE EXCEPTION 'Sauvegarde trop volumineuse';
  END IF;

  BEGIN
    v_json := NEW.data::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'JSON de sauvegarde invalide';
  END;

  IF jsonb_typeof(v_json) <> 'object' THEN
    RAISE EXCEPTION 'Format de sauvegarde invalide';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_save_row ON public.saves;
CREATE TRIGGER trg_validate_save_row
  BEFORE INSERT OR UPDATE ON public.saves
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_save_row();

ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS saves_select_own ON public.saves;
CREATE POLICY saves_select_own ON public.saves
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS saves_insert_own ON public.saves;
CREATE POLICY saves_insert_own ON public.saves
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS saves_update_own ON public.saves;
CREATE POLICY saves_update_own ON public.saves
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 2. Table public.classement : lecture seule pour les joueurs, écriture via RPC sync_classement()
ALTER TABLE public.classement ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS classement_read_auth ON public.classement;
CREATE POLICY classement_read_auth ON public.classement
  FOR SELECT TO authenticated
  USING (true);

-- Supprimer d'éventuelles anciennes politiques d'écriture directe côté client
DROP POLICY IF EXISTS classement_insert_own ON public.classement;
DROP POLICY IF EXISTS classement_update_own ON public.classement;
DROP POLICY IF EXISTS classement_upsert_own ON public.classement;
DROP POLICY IF EXISTS classement_write_own ON public.classement;

REVOKE INSERT, UPDATE, DELETE ON public.classement FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_classement(p_degats bigint DEFAULT 0)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_save jsonb;
  v_pseudo text;
  v_cls text;
  v_lvl int;
  v_prest int;
  v_souls_total bigint;
  v_tour int;
  v_degats bigint;
  v_prev public.classement%ROWTYPE;
  v_has_prev boolean := false;
  v_dt double precision := 999999;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  SELECT s.pseudo, s.data::jsonb
    INTO v_pseudo, v_save
    FROM public.saves s
   WHERE s.user_id = v_uid;

  IF v_save IS NULL THEN
    RETURN;
  END IF;

  v_cls := v_save->>'cls';
  IF v_cls IS NULL OR v_cls NOT IN ('guerrier', 'archer', 'mage', 'gardien', 'peste', 'chrono', 'berserk', 'invoc') THEN
    RETURN;
  END IF;

  v_lvl := CASE
    WHEN COALESCE(v_save->>'lvl', '') ~ '^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$'
      THEN FLOOR(GREATEST(1, LEAST(100000, (v_save->>'lvl')::numeric)))::int
    ELSE 1
  END;

  v_prest := CASE
    WHEN COALESCE(v_save->>'prest', '') ~ '^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$'
      THEN FLOOR(GREATEST(0, LEAST(10000, (v_save->>'prest')::numeric)))::int
    ELSE 0
  END;

  v_souls_total := CASE
    WHEN COALESCE(v_save->>'soulsTotal', '') ~ '^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$'
      THEN FLOOR(GREATEST(0, LEAST(9000000000000000000::numeric, (v_save->>'soulsTotal')::numeric)))::bigint
    ELSE 0
  END;

  v_tour := CASE
    WHEN COALESCE(v_save->'tower'->>'best', '') ~ '^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$'
      THEN FLOOR(GREATEST(0, LEAST(50000, (v_save->'tower'->>'best')::numeric)))::int
    ELSE 0
  END;

  v_degats := GREATEST(0::bigint, LEAST(1000000000000000::bigint, COALESCE(p_degats, 0)));

  IF v_prest > 0 AND v_souls_total <= 0 THEN
    RAISE EXCEPTION 'État Oméga incohérent';
  END IF;

  SELECT * INTO v_prev FROM public.classement WHERE user_id = v_uid;
  v_has_prev := FOUND;

  IF v_has_prev AND v_prev.updated_at IS NOT NULL THEN
    v_dt := EXTRACT(EPOCH FROM (now() - v_prev.updated_at));
    IF v_dt < 60 AND (
      (v_lvl - v_prev.lvl) > 2000
      OR (v_prest - v_prev.prest) > 50
      OR (v_tour - v_prev.tour) > 300
    ) THEN
      RAISE EXCEPTION 'Progression anormale détectée';
    END IF;
  END IF;

  INSERT INTO public.classement (user_id, pseudo, cls, lvl, prest, souls_total, tour, degats, updated_at)
  VALUES (v_uid, v_pseudo, v_cls, v_lvl, v_prest, v_souls_total, v_tour, v_degats, now())
  ON CONFLICT (user_id) DO UPDATE SET
    pseudo = EXCLUDED.pseudo,
    cls = EXCLUDED.cls,
    lvl = EXCLUDED.lvl,
    prest = EXCLUDED.prest,
    souls_total = EXCLUDED.souls_total,
    tour = EXCLUDED.tour,
    degats = EXCLUDED.degats,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.sync_classement(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_classement(bigint) TO authenticated;

-- 3. Codes de secours hachés (réinitialisation du mot de passe via Edge Function reset-password)
CREATE TABLE IF NOT EXISTS public.recovery_codes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudo text NOT NULL UNIQUE,
  code_hash text NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.recovery_codes FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_recovery_code(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_pseudo text;
  v_norm text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  v_norm := UPPER(REGEXP_REPLACE(COALESCE(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  IF LENGTH(v_norm) < 12 THEN
    RAISE EXCEPTION 'Code de secours trop court';
  END IF;

  SELECT COALESCE(NULLIF(u.raw_user_meta_data->>'pseudo', ''), s.pseudo)
    INTO v_pseudo
    FROM auth.users u
    LEFT JOIN public.saves s ON s.user_id = u.id
   WHERE u.id = v_uid;

  IF v_pseudo IS NULL OR v_pseudo !~ '^[A-Za-z0-9_-]{3,20}$' THEN
    RAISE EXCEPTION 'Pseudo introuvable';
  END IF;

  INSERT INTO public.recovery_codes (user_id, pseudo, code_hash, attempts, locked_until, updated_at)
  VALUES (v_uid, v_pseudo, extensions.crypt(v_norm, extensions.gen_salt('bf', 10)), 0, NULL, now())
  ON CONFLICT (user_id) DO UPDATE SET
    pseudo = EXCLUDED.pseudo,
    code_hash = EXCLUDED.code_hash,
    attempts = 0,
    locked_until = NULL,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.set_recovery_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_recovery_code(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.verify_recovery_code(p_pseudo text, p_code text)
RETURNS TABLE(status text, user_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_rec public.recovery_codes%ROWTYPE;
  v_norm text;
  v_next_attempts int;
BEGIN
  v_norm := UPPER(REGEXP_REPLACE(COALESCE(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  IF p_pseudo IS NULL OR p_pseudo !~ '^[A-Za-z0-9_-]{3,20}$' OR LENGTH(v_norm) < 12 THEN
    RETURN QUERY SELECT 'invalid'::text, NULL::uuid;
    RETURN;
  END IF;

  SELECT * INTO v_rec
    FROM public.recovery_codes rc
   WHERE LOWER(rc.pseudo) = LOWER(p_pseudo)
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'invalid'::text, NULL::uuid;
    RETURN;
  END IF;

  IF v_rec.locked_until IS NOT NULL AND v_rec.locked_until > now() THEN
    RETURN QUERY SELECT 'locked'::text, NULL::uuid;
    RETURN;
  END IF;

  IF v_rec.code_hash = extensions.crypt(v_norm, v_rec.code_hash) THEN
    RETURN QUERY SELECT 'ok'::text, v_rec.user_id;
    RETURN;
  END IF;

  v_next_attempts := COALESCE(v_rec.attempts, 0) + 1;
  UPDATE public.recovery_codes
     SET attempts = v_next_attempts,
         locked_until = CASE WHEN v_next_attempts >= 5 THEN now() + interval '15 minutes' ELSE NULL END
   WHERE public.recovery_codes.user_id = v_rec.user_id;

  IF v_next_attempts >= 5 THEN
    RETURN QUERY SELECT 'locked'::text, NULL::uuid;
  ELSE
    RETURN QUERY SELECT 'invalid'::text, NULL::uuid;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_recovery_code(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_recovery_code(text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.rotate_recovery_code(p_user_id uuid, p_new_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_norm text;
BEGIN
  v_norm := UPPER(REGEXP_REPLACE(COALESCE(p_new_code, ''), '[^A-Za-z0-9]', '', 'g'));
  IF LENGTH(v_norm) < 12 THEN
    RAISE EXCEPTION 'Nouveau code de secours trop court';
  END IF;

  UPDATE public.recovery_codes
     SET code_hash = extensions.crypt(v_norm, extensions.gen_salt('bf', 10)),
         attempts = 0,
         locked_until = NULL,
         updated_at = now()
   WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.rotate_recovery_code(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_recovery_code(uuid, text) TO service_role;
