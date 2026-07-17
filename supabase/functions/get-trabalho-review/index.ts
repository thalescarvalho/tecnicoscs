// Public endpoint: returns trabalho summary + items + photos for CONCLUIDO jobs.
// Used by the public review page so the client can see what was done.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { trabalho_id } = await req.json();
    if (!trabalho_id || typeof trabalho_id !== 'string') {
      return new Response(JSON.stringify({ error: 'trabalho_id inválido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: trabalho } = await admin
      .from('trabalhos')
      .select('id, titulo, descricao, tipo_servico, status, observacoes_tecnico, end_at, tecnico_id')
      .eq('id', trabalho_id)
      .maybeSingle();

    if (!trabalho || trabalho.status !== 'CONCLUIDO') {
      return new Response(JSON.stringify({ error: 'Trabalho não disponível para avaliação' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [itensRes, fotosRes, tecnicoRes] = await Promise.all([
      admin.from('itens_produzidos').select('id, nome_produto, quantidade, peso_valor, peso_unidade').eq('trabalho_id', trabalho_id),
      admin.from('fotos').select('id, url, legenda').eq('trabalho_id', trabalho_id),
      trabalho.tecnico_id
        ? admin.from('profiles').select('nome').eq('user_id', trabalho.tecnico_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return new Response(
      JSON.stringify({
        trabalho: {
          titulo: trabalho.titulo,
          descricao: trabalho.descricao,
          tipo_servico: trabalho.tipo_servico,
          observacoes_tecnico: trabalho.observacoes_tecnico,
          end_at: trabalho.end_at,
          tecnico_nome: (tecnicoRes as any)?.data?.nome ?? null,
        },
        itens: itensRes.data || [],
        fotos: fotosRes.data || [],
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Erro interno' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
