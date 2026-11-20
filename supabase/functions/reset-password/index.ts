import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8"
};

const REC_ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function genRecoveryCode(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let raw = "";
  for (let i = 0; i < 12; i++) raw += REC_ABC[bytes[i] & 31];
  return `VAL-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

function jsonRes(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonRes({ error: "Méthode non autorisée." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) {
      return jsonRes({ error: "Configuration serveur incomplète." }, 500);
    }

    const body = await req.json().catch(() => null);
    const pseudo = typeof body?.pseudo === "string" ? body.pseudo.trim() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!/^[A-Za-z0-9_-]{3,20}$/.test(pseudo)) {
      return jsonRes({ error: "Pseudo invalide." }, 400);
    }
    if (code.replace(/[^A-Za-z0-9]/g, "").length < 12) {
      return jsonRes({ error: "Format du code de secours invalide." }, 400);
    }
    if (password.length < 6 || password.length > 200) {
      return jsonRes({ error: "Le nouveau mot de passe doit faire entre 6 et 200 caractères." }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data, error: verifyErr } = await admin.rpc("verify_recovery_code", {
      p_pseudo: pseudo,
      p_code: code
    });
    if (verifyErr) {
      return jsonRes({ error: "Impossible de vérifier le code de secours." }, 500);
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row || row.status === "invalid") {
      return jsonRes({ error: "Pseudo ou code de secours invalide." }, 400);
    }
    if (row.status === "locked") {
      return jsonRes({ error: "Trop d'essais incorrects. Réessayez dans 15 minutes." }, 429);
    }
    if (row.status !== "ok" || !row.user_id) {
      return jsonRes({ error: "Pseudo ou code de secours invalide." }, 400);
    }

    const { error: updErr } = await admin.auth.admin.updateUserById(row.user_id, { password });
    if (updErr) {
      return jsonRes({ error: "Impossible de modifier le mot de passe." }, 500);
    }

    const newCode = genRecoveryCode();
    const { error: rotErr } = await admin.rpc("rotate_recovery_code", {
      p_user_id: row.user_id,
      p_new_code: newCode
    });
    if (rotErr) {
      return jsonRes({ ok: true, newCode: null });
    }

    return jsonRes({ ok: true, newCode }, 200);
  } catch {
    return jsonRes({ error: "Requête invalide." }, 400);
  }
});
