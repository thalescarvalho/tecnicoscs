const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Always return 200 with { error } so supabase.functions.invoke surfaces the real message
const errOk = (message: string) => json({ error: message }, 200);

function friendlyAuthError(raw: string): string {
  try {
    const obj = JSON.parse(raw);
    const code = obj?.error_code || obj?.code;
    const msg = obj?.msg || obj?.message || raw;
    if (code === "weak_password") {
      return "Senha fraca. Use uma senha mais forte (evite senhas comuns/vazadas e use no mínimo 6 caracteres).";
    }
    return msg;
  } catch {
    return raw;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errOk("No authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) return errOk("Server config error");

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: anonKey },
    });
    if (!userRes.ok) return errOk("Unauthorized");
    const caller = await userRes.json();

    const roleRes = await fetch(
      `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${caller.id}&select=role`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const roles = await roleRes.json();
    const callerRole = roles?.[0]?.role;
    const isAdmin = callerRole === "admin";
    const isGestor = callerRole === "gestor";

    if (!isAdmin && !isGestor) return errOk("Forbidden: admin ou gestor apenas");

    const { action, targetUserId, newPassword, newName } = await req.json();

    if (!targetUserId) return errOk("targetUserId obrigatório");

    if (action === "delete_user") {
      if (!isAdmin) return errOk("Forbidden: admin apenas");
      await fetch(`${supabaseUrl}/rest/v1/user_roles?user_id=eq.${targetUserId}`, {
        method: "DELETE",
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      });
      await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${targetUserId}`, {
        method: "DELETE",
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      });
      const delRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUserId}`, {
        method: "DELETE",
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      });
      if (!delRes.ok) return errOk(friendlyAuthError(await delRes.text()));
      return json({ success: true });
    }

    if (action === "change_password") {
      if (!newPassword || newPassword.length < 6) {
        return errOk("Senha deve ter no mínimo 6 caracteres");
      }
      const updRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!updRes.ok) return errOk(friendlyAuthError(await updRes.text()));
      return json({ success: true });
    }

    if (action === "update_name") {
      if (!isAdmin) return errOk("Forbidden: admin apenas");
      const name = (newName || "").trim();
      if (name.length < 2) return errOk("Nome deve ter no mínimo 2 caracteres");

      const upd = await fetch(
        `${supabaseUrl}/rest/v1/profiles?user_id=eq.${targetUserId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ nome: name }),
        }
      );
      if (!upd.ok) return errOk(await upd.text());

      // also sync into auth metadata
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ user_metadata: { nome: name } }),
      });
      return json({ success: true });
    }

    return errOk("Ação desconhecida");
  } catch (err) {
    return json({ error: (err as Error).message }, 200);
  }
});
