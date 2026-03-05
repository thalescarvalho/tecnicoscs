import { useState } from 'react';
import { mockTrabalhos } from '@/data/mock';
import { WorkCard } from '@/components/WorkCard';
import { TrabalhoStatus } from '@/types';

const tabs: { label: string; value: TrabalhoStatus | 'TODOS' }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Pendentes', value: 'PENDENTE' },
  { label: 'Andamento', value: 'ANDAMENTO' },
  { label: 'Concluídos', value: 'CONCLUIDO' },
];

export default function Trabalhos() {
  const [filter, setFilter] = useState<TrabalhoStatus | 'TODOS'>('TODOS');

  const filtered = filter === 'TODOS'
    ? mockTrabalhos
    : mockTrabalhos.filter(t => t.status === filter);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold text-foreground">Trabalhos</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Nenhum trabalho encontrado</p>
          </div>
        ) : (
          filtered.map(t => <WorkCard key={t.id} trabalho={t} />)
        )}
      </div>
    </div>
  );
}
