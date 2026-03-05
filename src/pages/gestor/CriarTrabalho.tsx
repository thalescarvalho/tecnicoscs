import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Tables, Enums } from '@/integrations/supabase/types';

const tiposServico = ['Manutenção', 'Instalação', 'Treinamento', 'Visita técnica', 'Produção sob demanda'];

export default function CriarTrabalho() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Tables<'clientes'>[]>([]);
  const [tecnicos, setTecnicos] = useState<(Tables<'profiles'> & { user_id: string })[]>([]);

  const [clienteId, setClienteId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipoServico, setTipoServico] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<Enums<'prioridade'>>('MEDIA');
  const [dataPrevista, setDataPrevista] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    async function fetchData() {
      const [clientesRes, rolesRes] = await Promise.all([
        supabase.from('clientes').select('*').order('nome'),
        supabase.from('user_roles').select('user_id').eq('role', 'tecnico'),
      ]);
      setClientes(clientesRes.data || []);

      if (rolesRes.data && rolesRes.data.length > 0) {
        const tecnicoIds = rolesRes.data.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', tecnicoIds)
          .eq('ativo', true);
        setTecnicos((profiles || []) as any);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !tecnicoId || !titulo || !descricao || !tipoServico || !dataPrevista) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('trabalhos').insert({
      cliente_id: clienteId,
      tecnico_id: tecnicoId,
      gestor_id: user!.id,
      titulo, descricao, tipo_servico: tipoServico,
      prioridade, data_prevista: dataPrevista,
      observacoes_gestor: observacoes || null,
    });
    setLoading(false);
    if (error) { toast.error('Erro ao criar trabalho: ' + error.message); return; }
    toast.success('Trabalho criado com sucesso!');
    navigate('/trabalhos');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-foreground">Novo Trabalho</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Cliente *</label>
          <Select value={clienteId} onValueChange={setClienteId} required>
            <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
            <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Título *</label>
          <Input placeholder="Ex: Manutenção de forno" value={titulo} onChange={e => setTitulo(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tipo de serviço *</label>
          <Select value={tipoServico} onValueChange={setTipoServico} required>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{tiposServico.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Descrição *</label>
          <Textarea placeholder="Descreva o trabalho..." rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Prioridade *</label>
            <Select value={prioridade} onValueChange={v => setPrioridade(v as Enums<'prioridade'>)} required>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BAIXA">Baixa</SelectItem>
                <SelectItem value="MEDIA">Média</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Data prevista *</label>
            <Input type="date" value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Técnico responsável *</label>
          <Select value={tecnicoId} onValueChange={setTecnicoId} required>
            <SelectTrigger><SelectValue placeholder="Selecione o técnico" /></SelectTrigger>
            <SelectContent>
              {tecnicos.length === 0 ? (
                <SelectItem value="_none" disabled>Nenhum técnico cadastrado</SelectItem>
              ) : tecnicos.map(t => <SelectItem key={t.user_id} value={t.user_id}>{t.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Observações</label>
          <Textarea placeholder="Observações adicionais..." rows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} />
        </div>
        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Trabalho'}
        </Button>
      </form>
    </div>
  );
}
