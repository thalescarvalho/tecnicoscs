import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

export default function AvaliacaoPublica() {
  const [params] = useSearchParams();
  const trabalhoId = params.get('trabalho');
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!trabalhoId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-100 px-6">
        <p className="text-muted-foreground">Link de avaliação inválido.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (nota === 0) { toast.error('Selecione uma nota de 1 a 5'); return; }
    setLoading(true);
    const { error } = await supabase.from('avaliacoes').insert({
      trabalho_id: trabalhoId,
      nota,
      comentario: comentario || null,
      cliente_nome: clienteNome || null,
    });
    setLoading(false);
    if (error) { toast.error('Erro ao enviar avaliação'); return; }
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-100 px-6 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h1 className="text-xl font-bold text-foreground">Obrigado pela sua avaliação!</h1>
        <p className="text-sm text-muted-foreground">Seu feedback é muito importante para nós.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center px-6 py-10">
      <img src={logo} alt="Finíssimo" className="h-10 mb-2" />
      <h1 className="text-xl font-heading font-bold text-foreground mb-1">Avalie nosso trabalho</h1>
      <p className="text-sm text-muted-foreground mb-6">Sua opinião nos ajuda a melhorar!</p>

      <div className="w-full max-w-md space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Seu nome (opcional)</label>
          <Input placeholder="Seu nome" value={clienteNome} onChange={e => setClienteNome(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Como você avalia o serviço? *</label>
          <div className="flex gap-2 justify-center py-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setNota(n)} className="transition-transform hover:scale-110">
                <Star className={`w-10 h-10 ${n <= nota ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Comentário (opcional)</label>
          <Textarea placeholder="Conte como foi sua experiência..." rows={3} value={comentario} onChange={e => setComentario(e.target.value)} />
        </div>

        <Button onClick={handleSubmit} className="w-full h-12 text-base font-semibold" disabled={loading || nota === 0}>
          {loading ? 'Enviando...' : 'Enviar Avaliação'}
        </Button>
      </div>
    </div>
  );
}
