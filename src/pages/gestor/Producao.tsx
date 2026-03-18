import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Calendar, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TecnicoProducao {
  tecnico_id: string;
  nome: string;
  total_peso: number;
  total_itens: number;
}

interface ProdutoPorTecnico {
  produto: string;
  tecnicos: { nome: string; peso: number; qtd: number }[];
  total_peso: number;
  total_qtd: number;
}

export default function Producao() {
  const [dados, setDados] = useState<TecnicoProducao[]>([]);
  const [produtosDados, setProdutosDados] = useState<ProdutoPorTecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchProducao();
  }, [dataInicio, dataFim]);

  async function fetchProducao() {
    setLoading(true);
    const { data: trabalhos } = await supabase
      .from('trabalhos')
      .select('id, tecnico_id')
      .eq('status', 'CONCLUIDO')
      .gte('end_at', `${dataInicio}T00:00:00`)
      .lte('end_at', `${dataFim}T23:59:59`);

    if (!trabalhos || trabalhos.length === 0) {
      setDados([]);
      setProdutosDados([]);
      setLoading(false);
      return;
    }

    const trabalhoIds = trabalhos.map(t => t.id);
    const tecnicoIds = [...new Set(trabalhos.map(t => t.tecnico_id))];

    const [itensRes, profilesRes] = await Promise.all([
      supabase.from('itens_produzidos').select('trabalho_id, nome_produto, peso_valor, quantidade').in('trabalho_id', trabalhoIds),
      supabase.from('profiles').select('user_id, nome').in('user_id', tecnicoIds),
    ]);

    const profileMap = new Map((profilesRes.data || []).map(p => [p.user_id, p.nome]));
    const trabalhoTecnico = new Map(trabalhos.map(t => [t.id, t.tecnico_id]));

    // Aggregation by technician
    const tecnicoAgg: Record<string, { total_peso: number; total_itens: number }> = {};
    // Aggregation by product -> technician
    const produtoAgg: Record<string, Record<string, { peso: number; qtd: number }>> = {};

    (itensRes.data || []).forEach(item => {
      const tecId = trabalhoTecnico.get(item.trabalho_id);
      if (!tecId) return;
      const peso = Number(item.peso_valor) || 0;
      const qtd = item.quantidade || 1;

      // Per technician
      if (!tecnicoAgg[tecId]) tecnicoAgg[tecId] = { total_peso: 0, total_itens: 0 };
      tecnicoAgg[tecId].total_peso += peso;
      tecnicoAgg[tecId].total_itens += qtd;

      // Per product per technician
      const produto = item.nome_produto || 'Sem nome';
      if (!produtoAgg[produto]) produtoAgg[produto] = {};
      if (!produtoAgg[produto][tecId]) produtoAgg[produto][tecId] = { peso: 0, qtd: 0 };
      produtoAgg[produto][tecId].peso += peso;
      produtoAgg[produto][tecId].qtd += qtd;
    });

    const result: TecnicoProducao[] = Object.entries(tecnicoAgg).map(([tecnico_id, agg]) => ({
      tecnico_id,
      nome: profileMap.get(tecnico_id) || 'Desconhecido',
      total_peso: Math.round(agg.total_peso * 100) / 100,
      total_itens: agg.total_itens,
    })).sort((a, b) => b.total_peso - a.total_peso);

    const produtosResult: ProdutoPorTecnico[] = Object.entries(produtoAgg).map(([produto, tecnicos]) => {
      const tecList = Object.entries(tecnicos).map(([tecId, v]) => ({
        nome: profileMap.get(tecId) || 'Desconhecido',
        peso: Math.round(v.peso * 100) / 100,
        qtd: v.qtd,
      })).sort((a, b) => b.peso - a.peso);
      return {
        produto,
        tecnicos: tecList,
        total_peso: Math.round(tecList.reduce((s, t) => s + t.peso, 0) * 100) / 100,
        total_qtd: tecList.reduce((s, t) => s + t.qtd, 0),
      };
    }).sort((a, b) => b.total_peso - a.total_peso);

    setDados(result);
    setProdutosDados(produtosResult);
    setLoading(false);
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold text-foreground">Produção</h1>
      <p className="text-sm text-muted-foreground">Relatórios de produção no período selecionado</p>

      <div className="flex gap-3 items-end">
        <div className="space-y-1 flex-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> De</label>
          <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
        </div>
        <div className="space-y-1 flex-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Até</label>
          <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
        </div>
      </div>

      <Tabs defaultValue="tecnico" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="tecnico" className="flex-1"><BarChart3 className="w-4 h-4 mr-1.5" />Por Técnico</TabsTrigger>
          <TabsTrigger value="produto" className="flex-1"><Package className="w-4 h-4 mr-1.5" />Por Produto</TabsTrigger>
        </TabsList>

        <TabsContent value="tecnico" className="space-y-4 mt-4">
          {dados.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma produção no período selecionado</p>
            </div>
          ) : (
            <>
              <div className="glass-card rounded-xl p-4" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" tick={{ fontSize: 12 }} unit=" kg" />
                    <YAxis type="category" dataKey="nome" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip formatter={(v: number) => `${v} kg`} />
                    <Bar dataKey="total_peso" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {dados.map((d, i) => (
                  <div key={d.tecnico_id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold">{d.nome}</p>
                        <p className="text-xs text-muted-foreground">{d.total_itens} itens produzidos</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary">{d.total_peso} kg</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="produto" className="space-y-4 mt-4">
          {produtosDados.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma produção no período selecionado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {produtosDados.map(p => (
                <div key={p.produto} className="glass-card rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">{p.produto}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{p.total_peso} kg</p>
                      <p className="text-xs text-muted-foreground">{p.total_qtd} un.</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {p.tecnicos.map(t => (
                      <div key={t.nome} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t.nome}</span>
                        <span className="font-medium text-foreground">{t.peso} kg <span className="text-muted-foreground text-xs">({t.qtd} un.)</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
