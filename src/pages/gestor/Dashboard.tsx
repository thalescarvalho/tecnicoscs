import { mockTrabalhos } from '@/data/mock';
import { WorkCard } from '@/components/WorkCard';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const kpis = [
  { label: 'Pendentes', value: mockTrabalhos.filter(t => t.status === 'PENDENTE').length, icon: ClipboardList, color: 'bg-warning/15 text-foreground' },
  { label: 'Em andamento', value: mockTrabalhos.filter(t => t.status === 'ANDAMENTO').length, icon: Clock, color: 'bg-primary/15 text-foreground' },
  { label: 'Concluídos', value: mockTrabalhos.filter(t => t.status === 'CONCLUIDO').length, icon: CheckCircle2, color: 'bg-success/15 text-foreground' },
  { label: 'Total', value: mockTrabalhos.length, icon: AlertTriangle, color: 'bg-secondary text-secondary-foreground' },
];

export default function Dashboard() {
  const trabalhosHoje = mockTrabalhos.filter(t => t.status !== 'CANCELADO');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral dos atendimentos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${kpi.color} rounded-xl p-4 flex items-center gap-3`}
          >
            <kpi.icon className="w-8 h-8 opacity-60" />
            <div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs opacity-70">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Trabalhos recentes</h2>
        <div className="space-y-3">
          {trabalhosHoje.map(t => (
            <WorkCard key={t.id} trabalho={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
