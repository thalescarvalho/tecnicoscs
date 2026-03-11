import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { fetchTrabalhoById, TrabalhoWithRelations } from '@/lib/queries';
import { StatusBadge, PrioridadeBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Clock, Package, Camera, User, Phone, Navigation, Trash2, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { exportTrabalhoPDF } from '@/lib/pdfExport';
import type { Tables } from '@/integrations/supabase/types';

export default function TrabalhoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [trabalho, setTrabalho] = useState<TrabalhoWithRelations | null>(null);
  const [itens, setItens] = useState<Tables<'itens_produzidos'>[]>([]);
  const [fotos, setFotos] = useState<Tables<'fotos'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoProduto, setNovoProduto] = useState('');
  const [novoPeso, setNovoPeso] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [observacaoTecnico, setObservacaoTecnico] = useState('');

  async function fetchData() {
    const [t, iRes, fRes] = await Promise.all([
      fetchTrabalhoById(id!),
      supabase.from('itens_produzidos').select('*').eq('trabalho_id', id!),
      supabase.from('fotos').select('*').eq('trabalho_id', id!),
    ]);
    setTrabalho(t);
    setObservacaoTecnico(t?.observacoes_tecnico || '');
    setItens(iRes.data || []);
    setFotos(fRes.data || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [id]);

  const handleIniciar = async () => {
    setActionLoading(true);
    let lat: number | null = null, lng: number | null = null, accuracy: number | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      lat = pos.coords.latitude; lng = pos.coords.longitude; accuracy = pos.coords.accuracy;
    } catch { /* ok */ }
    const { error } = await supabase.from('trabalhos').update({
      status: 'ANDAMENTO' as const, start_at: new Date().toISOString(),
      start_lat: lat, start_lng: lng, start_accuracy: accuracy,
    }).eq('id', id!);
    setActionLoading(false);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Trabalho iniciado!' + (lat ? ' Localização capturada.' : ' Localização indisponível.'));
    fetchData();
  };

  const handleFinalizar = async () => {
    if (itens.length === 0) { toast.error('Adicione pelo menos 1 item produzido.'); return; }
    setActionLoading(true);
    let lat: number | null = null, lng: number | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      lat = pos.coords.latitude; lng = pos.coords.longitude;
    } catch { /* ok */ }
    // Save observation before finalizing
    if (observacaoTecnico) {
      await supabase.from('trabalhos').update({ observacoes_tecnico: observacaoTecnico }).eq('id', id!);
    }
    const { error } = await supabase.from('trabalhos').update({
      status: 'CONCLUIDO' as const, end_at: new Date().toISOString(), end_lat: lat, end_lng: lng,
    }).eq('id', id!);
    setActionLoading(false);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Trabalho finalizado! Relatório gerado.');
    fetchData();
  };

  const addItem = async () => {
    if (!novoProduto || !novoPeso) return;
    const { error } = await supabase.from('itens_produzidos').insert({
      trabalho_id: id!, nome_produto: novoProduto, peso_valor: parseFloat(novoPeso), peso_unidade: 'kg',
    });
    if (error) { toast.error('Erro: ' + error.message); return; }
    setNovoProduto(''); setNovoPeso('');
    const { data } = await supabase.from('itens_produzidos').select('*').eq('trabalho_id', id!);
    setItens(data || []);
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/${id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from('trabalho-fotos').upload(path, file);
    if (upErr) { toast.error('Erro no upload: ' + upErr.message); return; }
    const { data: urlData } = supabase.storage.from('trabalho-fotos').getPublicUrl(path);
    await supabase.from('fotos').insert({ trabalho_id: id!, url: urlData.publicUrl });
    const { data } = await supabase.from('fotos').select('*').eq('trabalho_id', id!);
    setFotos(data || []);
    toast.success('Foto adicionada!');
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!trabalho) return <div className="text-center py-12"><p className="text-muted-foreground">Trabalho não encontrado</p><Button variant="outline" onClick={() => navigate(-1)} className="mt-4">Voltar</Button></div>;

  const isTecnico = role === 'tecnico';
  const isGestor = role === 'gestor';

  const handleSaveObs = async () => {
    const { error } = await supabase.from('trabalhos').update({ observacoes_tecnico: observacaoTecnico }).eq('id', id!);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Observação salva!');
  };

  const handleExportPDF = () => exportTrabalhoPDF(trabalho, itens);

  const handleShareWhatsApp = () => {
    const baseUrl = window.location.origin;
    const avaliacaoUrl = `${baseUrl}/avaliacao?trabalho=${trabalho.id}`;
    const msg = `Olá! Gostaríamos que você avaliasse o serviço "${trabalho.titulo}" realizado pela Finíssimo. Clique no link: ${avaliacaoUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDelete = async () => {
    setActionLoading(true);
    // Delete related records first
    await Promise.all([
      supabase.from('itens_produzidos').delete().eq('trabalho_id', id!),
      supabase.from('fotos').delete().eq('trabalho_id', id!),
      supabase.from('audit_log').delete().eq('trabalho_id', id!),
    ]);
    const { error } = await supabase.from('trabalhos').delete().eq('id', id!);
    setActionLoading(false);
    if (error) { toast.error('Erro ao excluir: ' + error.message); return; }
    toast.success('Trabalho excluído com sucesso.');
    navigate(-1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-heading font-bold text-foreground truncate">{trabalho.titulo}</h1>
          <div className="flex items-center gap-2 mt-1"><StatusBadge status={trabalho.status} /><PrioridadeBadge prioridade={trabalho.prioridade} /></div>
        </div>
        {isGestor && (
          <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="glass-card rounded-xl p-4 border border-destructive/30 bg-destructive/5 space-y-3">
          <p className="text-sm font-semibold text-destructive">Tem certeza que deseja excluir este trabalho?</p>
          <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita. Todos os itens, fotos e registros associados serão removidos.</p>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={actionLoading}>Excluir</Button>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Cliente</h3>
        <p className="text-sm font-medium">{trabalho.clientes?.nome}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {trabalho.clientes?.telefone}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {trabalho.clientes?.endereco}</p>
      </motion.div>

      <div className="glass-card rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Descrição</h3>
        <p className="text-sm text-muted-foreground">{trabalho.descricao}</p>
        <p className="text-xs text-muted-foreground">Tipo: {trabalho.tipo_servico} · Previsto: {new Date(trabalho.data_prevista).toLocaleDateString('pt-BR')}</p>
      </div>

      {(trabalho.start_at || trabalho.end_at) && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Linha do tempo</h3>
          {trabalho.start_at && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div>
                <p className="text-xs font-medium">Iniciado</p>
                <p className="text-xs text-muted-foreground">{new Date(trabalho.start_at).toLocaleString('pt-BR')}</p>
                {trabalho.start_lat && (
                  <a href={`https://www.google.com/maps?q=${trabalho.start_lat},${trabalho.start_lng}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-0.5">
                    <Navigation className="w-3 h-3" /> Ver no mapa
                  </a>
                )}
              </div>
            </div>
          )}
          {trabalho.end_at && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-success mt-1.5" />
              <div>
                <p className="text-xs font-medium">Finalizado</p>
                <p className="text-xs text-muted-foreground">{new Date(trabalho.end_at).toLocaleString('pt-BR')}</p>
                {trabalho.end_lat && (
                  <a href={`https://www.google.com/maps?q=${trabalho.end_lat},${trabalho.end_lng}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-0.5">
                    <Navigation className="w-3 h-3" /> Ver no mapa (fim)
                  </a>
                )}
              </div>
            </div>
          )}
          {trabalho.start_at && trabalho.end_at && (
            <p className="text-xs text-muted-foreground border-t border-border pt-2">
              Duração: {Math.round((new Date(trabalho.end_at).getTime() - new Date(trabalho.start_at).getTime()) / 3600000)}h {Math.round(((new Date(trabalho.end_at).getTime() - new Date(trabalho.start_at).getTime()) % 3600000) / 60000)}min
            </p>
          )}
        </div>
      )}

      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Itens produzidos ({itens.length})</h3>
        {itens.length > 0 ? (
          <div className="space-y-2">
            {itens.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm">{item.nome_produto}</span>
                <span className="text-sm font-medium text-primary">{item.peso_valor} {item.peso_unidade}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-muted-foreground">Nenhum item registrado</p>}
        {isTecnico && trabalho.status === 'ANDAMENTO' && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Input placeholder="Produto" value={novoProduto} onChange={e => setNovoProduto(e.target.value)} className="text-sm" />
            <Input placeholder="Peso (kg)" value={novoPeso} onChange={e => setNovoPeso(e.target.value)} className="text-sm w-24" type="number" step="0.1" />
            <Button type="button" size="sm" onClick={addItem} disabled={!novoProduto || !novoPeso}>+</Button>
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Camera className="w-4 h-4 text-primary" /> Fotos ({fotos.length})</h3>
        {fotos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {fotos.map(foto => (
              <div key={foto.id} className="relative rounded-lg overflow-hidden aspect-square">
                <img src={foto.url} alt={foto.legenda || 'Foto'} className="w-full h-full object-cover" />
                {foto.legenda && <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-background text-[10px] px-2 py-1">{foto.legenda}</div>}
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-muted-foreground">Nenhuma foto anexada</p>}
        {isTecnico && trabalho.status === 'ANDAMENTO' && (
          <label className="block">
            <input type="file" accept="image/*" capture="environment" onChange={handleFotoUpload} className="hidden" />
            <Button variant="outline" className="w-full" size="sm" asChild>
              <span><Camera className="w-4 h-4 mr-2" /> Adicionar foto</span>
            </Button>
          </label>
        )}
      </div>

      {isTecnico && (
        <div className="space-y-3 pt-2">
          {trabalho.status === 'PENDENTE' && (
            <Button onClick={handleIniciar} className="w-full h-14 text-base font-semibold" disabled={actionLoading}>🚀 Iniciar Trabalho</Button>
          )}
          {trabalho.status === 'ANDAMENTO' && (
            <Button onClick={handleFinalizar} className="w-full h-14 text-base font-semibold bg-success hover:bg-success/90 text-success-foreground" disabled={actionLoading}>✅ Finalizar e Gerar Relatório</Button>
          )}
        </div>
      )}
    </div>
  );
}
