import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Trabalho = Tables<'trabalhos'> & {
  clientes: Tables<'clientes'> | null;
  tecnico_profile: Tables<'profiles'> | null;
};

export default function Relatorios() {
  const navigate = useNavigate();
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('trabalhos')
        .select('*, clientes(*), tecnico_profile:profiles!trabalhos_tecnico_id_fkey(*)')
        .eq('status', 'CONCLUIDO')
        .order('end_at', { ascending: false });
      setTrabalhos((data as Trabalho[]) || []);
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold text-foreground">Relatórios</h1>
      <p className="text-sm text-muted-foreground">Relatórios dos trabalhos concluídos</p>

      {trabalhos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum relatório disponível</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trabalhos.map(t => (
            <div key={t.id} className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{t.titulo}</h3>
                  <p className="text-xs text-muted-foreground">{t.clientes?.nome} · {t.tecnico_profile?.nome}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
              {t.start_at && t.end_at && (
                <p className="text-xs text-muted-foreground">
                  {new Date(t.start_at).toLocaleDateString('pt-BR')} — Duração: {Math.round((new Date(t.end_at).getTime() - new Date(t.start_at).getTime()) / 3600000)}h
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => navigate(`/trabalho/${t.id}`)}><FileText className="w-3.5 h-3.5 mr-1" /> Ver detalhes</Button>
                <Button size="sm" variant="outline" onClick={() => toast.info('Exportação PDF em breve!')}><Download className="w-3.5 h-3.5 mr-1" /> PDF</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
