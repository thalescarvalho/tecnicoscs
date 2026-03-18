import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { WorkCard } from '@/components/WorkCard';
import { ClipboardList, Clock, CheckCircle2, Hourglass } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type TrabalhoWithRelations = Tables<'trabalhos'> & {
  clientes: Tables<'clientes'> | null;
  tecnico_profile: Tables<'profiles'> | null;
};

export default function MeusAgendamentos() {
  const { user } = useAuth();
  const [trabalhos, setTrabalhos] = useState<TrabalhoWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const { data } = await supabase
        .from('trabalhos')
        .select('*, clientes(*)')
        .eq('vendedor_id', user!.id)
        .order('created_at', { ascending: false });

      if (!data) { setLoading(false); return; }

      // Fetch tecnico profiles
      const tecnicoIds = [...new Set(data.map(t => t.tecnico_id).filter(Boolean))] as string[];
      let profileMap = new Map<string, Tables<'profiles'>>();
      if (tecnicoIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', tecnicoIds);
        profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      }

      setTrabalhos(data.map(t => ({
        ...t,
        tecnico_profile: t.tecnico_id ? profileMap.get(t.tecnico_id) || null : null,
      })));
      setLoading(false);
    }
    fetch();
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const aguardando = trabalhos.filter(t => t.status === 'AGUARDANDO_APROVACAO');
  const pendentes = trabalhos.filter(t => t.status === 'PENDENTE');
  const andamento = trabalhos.filter(t => t.status === 'ANDAMENTO');
  const concluidos = trabalhos.filter(t => t.status === 'CONCLUIDO');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Meus Agendamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">Trabalhos agendados por você</p>
      </div>

      {aguardando.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Hourglass className="w-4 h-4 text-violet-500" /> Aguardando aprovação</h2>
          {aguardando.map(t => <WorkCard key={t.id} trabalho={t} />)}
        </section>
      )}
      {pendentes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><ClipboardList className="w-4 h-4 text-warning" /> Aprovados (pendentes)</h2>
          {pendentes.map(t => <WorkCard key={t.id} trabalho={t} />)}
        </section>
      )}
      {andamento.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Em andamento</h2>
          {andamento.map(t => <WorkCard key={t.id} trabalho={t} />)}
        </section>
      )}
      {concluidos.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Concluídos</h2>
          {concluidos.map(t => <WorkCard key={t.id} trabalho={t} />)}
        </section>
      )}
      {trabalhos.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum agendamento encontrado</p>
        </div>
      )}
    </div>
  );
}
