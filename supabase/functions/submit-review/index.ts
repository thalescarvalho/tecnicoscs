import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { trabalho_id, nota, comentario, cliente_nome } = await req.json();

    if (!trabalho_id || typeof trabalho_id !== 'string') {
      return new Response(JSON.stringify({ error: 'trabalho_id obrigatório' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const n = Number(nota);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return new Response(JSON.stringify({ error: 'nota deve ser 1-5' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const com = comentario ? String(comentario).slice(0, 1000) : null;
    const nome = cliente_nome ? String(cliente_nome).slice(0, 100) : null;

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: trabalho, error: tErr } = await admin
      .from('trabalhos')
      .select('id, status, tecnico_id')
      .eq('id', trabalho_id)
      .maybeSingle();

    if (tErr || !trabalho) {
      return new Response(JSON.stringify({ error: 'Trabalho não encontrado' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (trabalho.status !== 'CONCLUIDO') {
      return new Response(JSON.stringify({ error: 'Trabalho não está concluído' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { error } = await admin.from('avaliacoes').insert({
      trabalho_id,
      nota: n,
      comentario: com,
      cliente_nome: nome,
      tecnico_id: trabalho.tecnico_id,
    });

    if (error) {
      return new Response(JSON.stringify({ error: 'Erro ao salvar avaliação' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
