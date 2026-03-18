import { useState, useEffect } from 'react';
import { fetchTrabalhosWithRelations, TrabalhoWithRelations } from '@/lib/queries';
import { WorkCard } from '@/components/WorkCard';
import type { Enums } from '@/integrations/supabase/types';

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

  useEffect(() => {
    fetchTrabalhosWithRelations().then(data => { setTrabalhos(data); setLoading(false); });
  }, []);

  const filtered = filter === 'TODOS' ? trabalhos : trabalhos.filter(t => t.status === filter);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold text-foreground">Trabalhos</h1>
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
