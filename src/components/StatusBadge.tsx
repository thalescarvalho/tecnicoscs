import { TrabalhoStatus, Prioridade } from '@/types';

const statusConfig: Record<TrabalhoStatus, { label: string; className: string }> = {
  PENDENTE: { label: 'Pendente', className: 'bg-warning/15 text-warning-foreground border border-warning/30' },
  ANDAMENTO: { label: 'Em andamento', className: 'bg-primary/15 text-foreground border border-primary/30' },
  CONCLUIDO: { label: 'Concluído', className: 'bg-success/15 text-foreground border border-success/30' },
  CANCELADO: { label: 'Cancelado', className: 'bg-destructive/15 text-foreground border border-destructive/30' },
};

const prioridadeConfig: Record<Prioridade, { label: string; className: string }> = {
  BAIXA: { label: 'Baixa', className: 'bg-muted text-muted-foreground' },
  MEDIA: { label: 'Média', className: 'bg-secondary text-secondary-foreground' },
  ALTA: { label: 'Alta', className: 'bg-warning/20 text-foreground border border-warning/30' },
  URGENTE: { label: 'Urgente', className: 'bg-destructive/20 text-foreground border border-destructive/40' },
};

export function StatusBadge({ status }: { status: TrabalhoStatus }) {
  const config = statusConfig[status];
  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}

export function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  const config = prioridadeConfig[prioridade];
  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}
