import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const tiposTrabalho = ['Desmanche', 'Trabalho técnico', 'Suporte', 'Apresentação'];

export default function CriarTrabalho() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tecnicos, setTecnicos] = useState<(Tables<'profiles'> & { user_id: string })[]>([]);

  const [clienteNome, setClienteNome] = useState('');
  const [clienteEndereco, setClienteEndereco] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipoTrabalho, setTipoTrabalho] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [vendedor, setVendedor] = useState('');

  useEffect(() => {
    async function fetchData() {
      const rolesRes = await supabase.from('user_roles').select('user_id').eq('role', 'tecnico');
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
    if (!clienteNome || !clienteEndereco || !tecnicoId || !titulo || !descricao || !tipoTrabalho || !dataPrevista) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);

    // Create or find client
    const { data: existingClients } = await supabase
      .from('clientes')
      .select('id')
      .eq('nome', clienteNome)
      .limit(1);

    let clienteId: string;
    if (existingClients && existingClients.length > 0) {
      clienteId = existingClients[0].id;
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from('clientes')
        .insert({ nome: clienteNome, endereco: clienteEndereco, telefone: '-' })
        .select('id')
        .single();
      if (clientError || !newClient) {
        toast.error('Erro ao criar cliente: ' + (clientError?.message || ''));
        setLoading(false);
        return;
      }
      clienteId = newClient.id;
    }

    const { error } = await supabase.from('trabalhos').insert({
      cliente_id: clienteId,
      tecnico_id: tecnicoId,
      gestor_id: user!.id,
      titulo, descricao, tipo_servico: tipoTrabalho,
      data_prevista: dataPrevista,
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
          <label className="text-sm font-medium text-foreground">Nome do cliente *</label>
          <Input placeholder="Ex: Sorveteria do João" value={clienteNome} onChange={e => setClienteNome(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Endereço do cliente *</label>
          <Input placeholder="Ex: Rua das Flores, 123" value={clienteEndereco} onChange={e => setClienteEndereco(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Título *</label>
          <Input placeholder="Ex: Manutenção de forno" value={titulo} onChange={e => setTitulo(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tipo de trabalho *</label>
          <Select value={tipoTrabalho} onValueChange={setTipoTrabalho} required>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{tiposTrabalho.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Descrição *</label>
          <Textarea placeholder="Descreva o trabalho..." rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Data prevista *</label>
          <Input type="date" value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} required />
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
          <label className="text-sm font-medium text-foreground">Vendedor</label>
          <Input placeholder="Nome do vendedor" value={vendedor} onChange={e => setVendedor(e.target.value)} />
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
