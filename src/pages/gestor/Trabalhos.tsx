import { useState, useEffect } from 'react';
import { fetchTrabalhosWithRelations, TrabalhoWithRelations } from '@/lib/queries';
import { WorkCard } from '@/components/WorkCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { Enums, Tables } from '@/integrations/supabase/types';

type TrabalhoStatus = Enums<'trabalho_status'>;

const tabs: { label: string; value: TrabalhoStatus | 'TODOS' }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Aguardando', value: 'AGUARDANDO_APROVACAO' },
  { label: 'Pendentes', value: 'PENDENTE' },
  { label: 'Andamento', value: 'ANDAMENTO' },
  { label: 'Concluídos', value: 'CONCLUIDO' },
];

export default function Trabalhos() {
  const [filter, setFilter] = useState<TrabalhoStatus | 'TODOS'>('TODOS');
  const [trabalhos, setTrabalhos] = useState<TrabalhoWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [selectedVendedor, setSelectedVendedor] = useState('todos');
  const [selectedTecnico, setSelectedTecnico] = useState('todos');
  const [vendedores, setVendedores] = useState<Tables<'profiles'>[]>([]);
  const [tecnicos, setTecnicos] = useState<Tables<'profiles'>[]>([]);

  useEffect(() => {
    fetchTrabalhosWithRelations().then(data => { setTrabalhos(data); setLoading(false); });
  }, []);

  useEffect(() => {
    async function fetchUsersByRole(role: 'vendedor' | 'tecnico', setter: React.Dispatch<React.SetStateAction<Tables<'profiles'>[]>>) {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', role);
      if (roles && roles.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', roles.map(r => r.user_id)).eq('ativo', true);
        setter((profiles || []) as Tables<'profiles'>[]);
      }
    }
    fetchUsersByRole('vendedor', setVendedores);
    fetchUsersByRole('tecnico', setTecnicos);
  }, []);

  const filtered = trabalhos.filter(t => {
    if (filter !== 'TODOS' && t.status !== filter) return false;
    if (dataInicio && t.data_prevista < dataInicio) return false;
    if (dataFim && t.data_prevista > dataFim) return false;
    if (selectedVendedor !== 'todos' && t.vendedor_id !== selectedVendedor) return false;
    if (selectedTecnico !== 'todos' && t.tecnico_id !== selectedTecnico) return false;
    return true;
  });

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold text-foreground">Trabalhos</h1>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Data início</label>
            <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Data fim</label>
            <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Vendedor</label>
            <Select value={selectedVendedor} onValueChange={setSelectedVendedor}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {vendedores.map(v => <SelectItem key={v.user_id} value={v.user_id}>{v.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Técnico</label>
            <Select value={selectedTecnico} onValueChange={setSelectedTecnico}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {tecnicos.map(t => <SelectItem key={t.user_id} value={t.user_id}>{t.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setDataInicio(''); setDataFim(''); setSelectedVendedor('todos'); setSelectedTecnico('todos'); }}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map(tab => (
          <button key={tab.value} onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === tab.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? <p className="text-sm text-muted-foreground text-center py-12">Nenhum trabalho encontrado</p>
          : filtered.map(t => <WorkCard key={t.id} trabalho={t} />)}
      </div>
    </div>
  );
}
