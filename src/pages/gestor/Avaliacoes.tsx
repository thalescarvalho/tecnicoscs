import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, MessageSquare } from 'lucide-react';

interface Avaliacao {
  id: string;
  nota: number;
  comentario: string | null;
  cliente_nome: string | null;
  created_at: string;
  trabalho_id: string;
  trabalho_titulo?: string;
}

export default function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('avaliacoes').select('*').order('created_at', { ascending: false });
      if (!data || data.length === 0) { setAvaliacoes([]); setLoading(false); return; }

      const trabalhoIds = [...new Set(data.map(a => a.trabalho_id))];
      const { data: trabalhos } = await supabase.from('trabalhos').select('id, titulo').in('id', trabalhoIds);
      const tMap = new Map((trabalhos || []).map(t => [t.id, t.titulo]));

      setAvaliacoes(data.map(a => ({ ...a, trabalho_titulo: tMap.get(a.trabalho_id) || '' })));
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const mediaGeral = avaliacoes.length > 0 ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length).toFixed(1) : '—';

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

      {avaliacoes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma avaliação recebida ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {avaliacoes.map(a => (
            <div key={a.id} className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{a.trabalho_titulo}</p>
                  <p className="text-xs text-muted-foreground">{a.cliente_nome || 'Cliente anônimo'}</p>
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
