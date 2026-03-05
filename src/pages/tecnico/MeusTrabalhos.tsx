import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WorkCard } from '@/components/WorkCard';
import { Wrench, Clock } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Trabalho = Tables<'trabalhos'> & {
  clientes: Tables<'clientes'> | null;
  tecnico_profile: Tables<'profiles'> | null;
};

export default function MeusTrabalhos() {
  const { user } = useAuth();
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const { data } = await supabase
        .from('trabalhos')
        .select('*, clientes(*), tecnico_profile:profiles!trabalhos_tecnico_id_fkey(*)')
        .eq('tecnico_id', user!.id)
        .order('created_at', { ascending: false });
      setTrabalhos((data as Trabalho[]) || []);
      setLoading(false);
    }
    fetch();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  const andamento = trabalhos.filter(t => t.status === 'ANDAMENTO');
  const pendentes = trabalhos.filter(t => t.status === 'PENDENTE');
  const concluidos = trabalhos.filter(t => t.status === 'CONCLUIDO');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Meus Trabalhos</h1>
        <p className="text-sm text-muted-foreground mt-1">Seus atendimentos atribuídos</p>
      </div>

      {andamento.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Em andamento</h2>
          {andamento.map(t => <WorkCard key={t.id} trabalho={t} showTecnico={false} />)}
        </section>
      )}

      {pendentes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><Wrench className="w-4 h-4 text-warning" /> Pendentes</h2>
          {pendentes.map(t => <WorkCard key={t.id} trabalho={t} showTecnico={false} />)}
        </section>
      )}

      {concluidos.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">✅ Concluídos</h2>
          {concluidos.map(t => <WorkCard key={t.id} trabalho={t} showTecnico={false} />)}
        </section>
      )}

      {trabalhos.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum trabalho atribuído</p>
        </div>
      )}
    </div>
  );
}
