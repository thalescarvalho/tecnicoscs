import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Star, CheckCircle2, Package, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

interface TrabalhoInfo {
  titulo: string;
  descricao: string;
  tipo_servico: string;
  observacoes_tecnico: string | null;
  end_at: string | null;
  tecnico_nome: string | null;
}
interface Item { id: string; nome_produto: string; quantidade: number | null; peso_valor: number | null; peso_unidade: string | null; }
interface Foto { id: string; url: string; legenda: string | null; }

export default function AvaliacaoPublica() {
  const [params] = useSearchParams();
  const trabalhoId = params.get('trabalho');
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<TrabalhoInfo | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    if (!trabalhoId) { setLoadingInfo(false); return; }
    supabase.functions.invoke('get-trabalho-review', { body: { trabalho_id: trabalhoId } })
      .then(({ data, error }) => {
        if (!error && data && !(data as any).error) {
          setInfo((data as any).trabalho);
          setItens((data as any).itens || []);
          setFotos((data as any).fotos || []);
        }
        setLoadingInfo(false);
      });
  }, [trabalhoId]);

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
    const { data, error } = await supabase.functions.invoke('submit-review', {
      body: {
        trabalho_id: trabalhoId,
        nota,
        comentario: comentario || null,
        cliente_nome: clienteNome || null,
      },
    });
    setLoading(false);
    if (error || (data as any)?.error) { toast.error('Erro ao enviar avaliação'); return; }
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
        {loadingInfo ? (
          <div className="text-center text-sm text-muted-foreground">Carregando informações...</div>
        ) : info && (
          <div className="bg-white/70 backdrop-blur rounded-xl p-4 space-y-3 border border-amber-200">
            <div>
              <h2 className="text-sm font-bold text-foreground">{info.titulo}</h2>
              <p className="text-xs text-muted-foreground mt-1">{info.descricao}</p>
              {info.tecnico_nome && <p className="text-xs text-foreground mt-1">Técnico: <span className="font-medium">{info.tecnico_nome}</span></p>}
            </div>

            {info.observacoes_tecnico && (
              <div className="border-t border-amber-200 pt-2">
                <p className="text-xs font-semibold text-foreground">Observações do técnico</p>
                <p className="text-xs text-muted-foreground">{info.observacoes_tecnico}</p>
              </div>
            )}

            {itens.length > 0 && (
              <div className="border-t border-amber-200 pt-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1"><Package className="w-3 h-3" /> Produtos ({itens.length})</p>
                <ul className="space-y-0.5">
                  {itens.map(i => (
                    <li key={i.id} className="text-xs text-muted-foreground flex justify-between">
                      <span>{i.nome_produto}{i.quantidade ? ` (${i.quantidade}x)` : ''}</span>
                      {i.peso_valor ? <span className="font-medium text-foreground">{i.peso_valor} {i.peso_unidade}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {fotos.length > 0 && (
              <div className="border-t border-amber-200 pt-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1 mb-2"><Camera className="w-3 h-3" /> Fotos ({fotos.length})</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {fotos.map(f => (
                    <button key={f.id} type="button" onClick={() => setFotoAmpliada(f.url)}
                      className="aspect-square rounded-lg overflow-hidden border border-amber-200">
                      <img src={f.url} alt={f.legenda || 'Foto'} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

      <Dialog open={!!fotoAmpliada} onOpenChange={(o) => { if (!o) setFotoAmpliada(null); }}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 flex items-center justify-center">
          {fotoAmpliada && <img src={fotoAmpliada} alt="Foto" className="max-w-full max-h-[85vh] object-contain rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
