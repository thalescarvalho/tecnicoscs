import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, MessageSquare, User } from 'lucide-react';

interface Avaliacao {
  id: string;
  nota: number;
  comentario: string | null;
  cliente_nome: string | null;
  created_at: string;
  trabalho_id: string;
  tecnico_id: string | null;
  trabalho_titulo?: string;
  tecnico_nome?: string;
}

interface TecnicoStats {
  tecnico_id: string;
  nome: string;
  total: number;
  media: number;
}

export default function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [tecnicoStats, setTecnicoStats] = useState<TecnicoStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTecnico, setFiltroTecnico] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('avaliacoes').select('*').order('created_at', { ascending: false });
      if (!data || data.length === 0) { setAvaliacoes([]); setLoading(false); return; }

      const trabalhoIds = [...new Set(data.map(a => a.trabalho_id))];
      const tecnicoIds = [...new Set(data.map(a => a.tecnico_id).filter(Boolean))] as string[];

      const [trabalhosRes, profilesRes] = await Promise.all([
        supabase.from('trabalhos').select('id, titulo').in('id', trabalhoIds),
        tecnicoIds.length > 0 ? supabase.from('profiles').select('user_id, nome').in('user_id', tecnicoIds) : { data: [] },
      ]);

      const tMap = new Map((trabalhosRes.data || []).map(t => [t.id, t.titulo]));
      const pMap = new Map((profilesRes.data || []).map(p => [p.user_id, p.nome]));

      const enriched = data.map(a => ({
        ...a,
        trabalho_titulo: tMap.get(a.trabalho_id) || '',
        tecnico_nome: a.tecnico_id ? pMap.get(a.tecnico_id) || 'Técnico' : 'N/A',
      }));

      setAvaliacoes(enriched);

      // Build per-technician stats
      const statsMap = new Map<string, { nome: string; total: number; soma: number }>();
      enriched.forEach(a => {
        if (!a.tecnico_id) return;
        const existing = statsMap.get(a.tecnico_id) || { nome: a.tecnico_nome || 'Técnico', total: 0, soma: 0 };
        existing.total += 1;
        existing.soma += a.nota;
        statsMap.set(a.tecnico_id, existing);
      });
      setTecnicoStats(
        Array.from(statsMap.entries()).map(([id, s]) => ({
          tecnico_id: id, nome: s.nome, total: s.total, media: s.soma / s.total,
        })).sort((a, b) => b.media - a.media)
      );

      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const mediaGeral = avaliacoes.length > 0 ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length).toFixed(1) : '—';
  const filtered = filtroTecnico ? avaliacoes.filter(a => a.tecnico_id === filtroTecnico) : avaliacoes;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold text-foreground">Avaliações</h1>
      <p className="text-sm text-muted-foreground">Feedback dos clientes sobre os trabalhos</p>

      <div className="glass-card rounded-xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
          <Star className="w-7 h-7 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{mediaGeral}</p>
          <p className="text-xs text-muted-foreground">{avaliacoes.length} avaliações recebidas</p>
        </div>
      </div>

      {/* Per-technician stats */}
      {tecnicoStats.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Desempenho por técnico
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tecnicoStats.map(ts => (
              <button
                key={ts.tecnico_id}
                onClick={() => setFiltroTecnico(filtroTecnico === ts.tecnico_id ? null : ts.tecnico_id)}
                className={`glass-card rounded-xl p-3 text-left transition-all ${filtroTecnico === ts.tecnico_id ? 'ring-2 ring-primary' : ''}`}
              >
                <p className="text-sm font-semibold truncate">{ts.nome}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} className={`w-3 h-3 ${n <= Math.round(ts.media) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-foreground">{ts.media.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({ts.total})</span>
                </div>
              </button>
            ))}
          </div>
          {filtroTecnico && (
            <button onClick={() => setFiltroTecnico(null)} className="text-xs text-primary underline">Limpar filtro</button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma avaliação recebida ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{a.trabalho_titulo}</p>
                  <p className="text-xs text-muted-foreground">{a.cliente_nome || 'Cliente anônimo'}</p>
                  {a.tecnico_nome && <p className="text-xs text-primary">Técnico: {a.tecnico_nome}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={`w-4 h-4 ${n <= a.nota ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
              </div>
              {a.comentario && <p className="text-sm text-muted-foreground">{a.comentario}</p>}
              <p className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString('pt-BR')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
