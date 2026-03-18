import { useEffect, useState } from 'react';
import { fetchTrabalhosWithRelations, TrabalhoWithRelations } from '@/lib/queries';
import { WorkCard } from '@/components/WorkCard';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, Hourglass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [trabalhos, setTrabalhos] = useState<TrabalhoWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrabalhosWithRelations().then(data => { setTrabalhos(data); setLoading(false); });
  }, []);

  const counts = {
    aguardando: trabalhos.filter(t => t.status === 'AGUARDANDO_APROVACAO').length,
    pendentes: trabalhos.filter(t => t.status === 'PENDENTE').length,
    andamento: trabalhos.filter(t => t.status === 'ANDAMENTO').length,
    concluidos: trabalhos.filter(t => t.status === 'CONCLUIDO').length,
    total: trabalhos.length,
  };

  const kpis = [
    { label: 'Aguardando', value: counts.aguardando, icon: Hourglass, color: 'bg-violet-500/15 text-foreground' },
    { label: 'Pendentes', value: counts.pendentes, icon: ClipboardList, color: 'bg-warning/15 text-foreground' },
    { label: 'Em andamento', value: counts.andamento, icon: Clock, color: 'bg-primary/15 text-foreground' },
    { label: 'Concluídos', value: counts.concluidos, icon: CheckCircle2, color: 'bg-success/15 text-foreground' },
    { label: 'Total', value: counts.total, icon: AlertTriangle, color: 'bg-secondary text-secondary-foreground' },
  ];

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral dos atendimentos</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`${kpi.color} rounded-xl p-4 flex items-center gap-3`}>
            <kpi.icon className="w-8 h-8 opacity-60" />
            <div><p className="text-2xl font-bold">{kpi.value}</p><p className="text-xs opacity-70">{kpi.label}</p></div>
          </motion.div>
        ))}
      </div>
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Trabalhos recentes</h2>
        <div className="space-y-3">
          {trabalhos.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nenhum trabalho cadastrado.</p>
            : trabalhos.slice(0, 10).map(t => <WorkCard key={t.id} trabalho={t} />)}
        </div>
      </div>
    </div>
  );
}
