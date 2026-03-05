import type { Tables } from '@/integrations/supabase/types';
import { StatusBadge, PrioridadeBadge } from './StatusBadge';
import { Calendar, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Trabalho = Tables<'trabalhos'> & {
  clientes?: Tables<'clientes'> | null;
  tecnico_profile?: Tables<'profiles'> | null;
};

interface WorkCardProps {
  trabalho: Trabalho;
  showTecnico?: boolean;
}

export function WorkCard({ trabalho, showTecnico = true }: WorkCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/trabalho/${trabalho.id}`)}
      className="w-full text-left glass-card rounded-lg p-4 hover:shadow-md transition-all animate-fade-in active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">{trabalho.titulo}</h3>
        <StatusBadge status={trabalho.status} />
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{trabalho.descricao}</p>

      <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
        <PrioridadeBadge prioridade={trabalho.prioridade} />
        {trabalho.clientes && (
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{trabalho.clientes.nome}</span>
        )}
        {showTecnico && trabalho.tecnico_profile && (
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{trabalho.tecnico_profile.nome}</span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <Calendar className="w-3 h-3" />
          {new Date(trabalho.data_prevista).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </button>
  );
}
