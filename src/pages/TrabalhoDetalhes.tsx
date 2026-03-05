import { useParams, useNavigate } from 'react-router-dom';
import { mockTrabalhos, mockItens, mockFotos } from '@/data/mock';
import { StatusBadge, PrioridadeBadge } from '@/components/StatusBadge';
import { useAuth } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Clock, Package, Camera, User, Phone, Navigation } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function TrabalhoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const trabalho = mockTrabalhos.find(t => t.id === id);
  const itens = mockItens.filter(i => i.trabalhoId === id);
  const fotos = mockFotos.filter(f => f.trabalhoId === id);

  const [localItens, setLocalItens] = useState(itens);
  const [novoProduto, setNovoProduto] = useState('');
  const [novoPeso, setNovoPeso] = useState('');

  if (!trabalho) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Trabalho não encontrado</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">Voltar</Button>
      </div>
    );
  }

  const handleIniciar = () => {
    toast.success('Trabalho iniciado! Geolocalização capturada.');
  };

  const handleFinalizar = () => {
    if (localItens.length === 0) {
      toast.error('Adicione pelo menos 1 item produzido antes de finalizar.');
      return;
    }
    toast.success('Trabalho finalizado! Relatório gerado.');
  };

  const addItem = () => {
    if (!novoProduto || !novoPeso) return;
    setLocalItens([...localItens, {
      id: `new-${Date.now()}`,
      trabalhoId: trabalho.id,
      nomeProduto: novoProduto,
      pesoValor: parseFloat(novoPeso),
      pesoUnidade: 'kg',
    }]);
    setNovoProduto('');
    setNovoPeso('');
  };

  const isTecnico = role === 'TECNICO';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-heading font-bold text-foreground truncate">{trabalho.titulo}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={trabalho.status} />
            <PrioridadeBadge prioridade={trabalho.prioridade} />
          </div>
        </div>
      </div>

      {/* Cliente info */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Cliente
        </h3>
        <p className="text-sm font-medium">{trabalho.cliente?.nome}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Phone className="w-3 h-3" /> {trabalho.cliente?.telefone}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {trabalho.cliente?.endereco}
        </p>
      </motion.div>

      {/* Descrição */}
      <div className="glass-card rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Descrição</h3>
        <p className="text-sm text-muted-foreground">{trabalho.descricao}</p>
        <p className="text-xs text-muted-foreground">
          Tipo: {trabalho.tipoServico} · Previsto: {new Date(trabalho.dataPrevista).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Timeline */}
      {(trabalho.startAt || trabalho.endAt) && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Linha do tempo
          </h3>
          {trabalho.startAt && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div>
                <p className="text-xs font-medium">Iniciado</p>
                <p className="text-xs text-muted-foreground">{new Date(trabalho.startAt).toLocaleString('pt-BR')}</p>
                {trabalho.startLat && (
                  <a
                    href={`https://www.google.com/maps?q=${trabalho.startLat},${trabalho.startLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 mt-0.5"
                  >
                    <Navigation className="w-3 h-3" /> Ver no mapa
                  </a>
                )}
              </div>
            </div>
          )}
          {trabalho.endAt && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-success mt-1.5" />
              <div>
                <p className="text-xs font-medium">Finalizado</p>
                <p className="text-xs text-muted-foreground">{new Date(trabalho.endAt).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          )}
          {trabalho.startAt && trabalho.endAt && (
            <p className="text-xs text-muted-foreground border-t border-border pt-2">
              Duração: {Math.round((new Date(trabalho.endAt).getTime() - new Date(trabalho.startAt).getTime()) / 3600000)}h {Math.round(((new Date(trabalho.endAt).getTime() - new Date(trabalho.startAt).getTime()) % 3600000) / 60000)}min
            </p>
          )}
        </div>
      )}

      {/* Itens produzidos */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" /> Itens produzidos ({localItens.length})
        </h3>
        {localItens.length > 0 ? (
          <div className="space-y-2">
            {localItens.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm">{item.nomeProduto}</span>
                <span className="text-sm font-medium text-primary">{item.pesoValor} {item.pesoUnidade}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nenhum item registrado</p>
        )}

        {isTecnico && trabalho.status === 'ANDAMENTO' && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Input
              placeholder="Produto"
              value={novoProduto}
              onChange={e => setNovoProduto(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Peso (kg)"
              value={novoPeso}
              onChange={e => setNovoPeso(e.target.value)}
              className="text-sm w-24"
              type="number"
              step="0.1"
            />
            <Button type="button" size="sm" onClick={addItem} disabled={!novoProduto || !novoPeso}>+</Button>
          </div>
        )}
      </div>

      {/* Fotos */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" /> Fotos ({fotos.length})
        </h3>
        {fotos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {fotos.map(foto => (
              <div key={foto.id} className="relative rounded-lg overflow-hidden aspect-square">
                <img src={foto.url} alt={foto.legenda || 'Foto'} className="w-full h-full object-cover" />
                {foto.legenda && (
                  <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-background text-[10px] px-2 py-1">
                    {foto.legenda}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nenhuma foto anexada</p>
        )}

        {isTecnico && trabalho.status === 'ANDAMENTO' && (
          <Button variant="outline" className="w-full mt-2" size="sm">
            <Camera className="w-4 h-4 mr-2" /> Adicionar foto
          </Button>
        )}
      </div>

      {/* Ações do técnico */}
      {isTecnico && (
        <div className="space-y-3 pt-2">
          {trabalho.status === 'PENDENTE' && (
            <Button onClick={handleIniciar} className="w-full h-14 text-base font-semibold">
              🚀 Iniciar Trabalho
            </Button>
          )}
          {trabalho.status === 'ANDAMENTO' && (
            <Button onClick={handleFinalizar} className="w-full h-14 text-base font-semibold bg-success hover:bg-success/90 text-success-foreground">
              ✅ Finalizar e Gerar Relatório
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
