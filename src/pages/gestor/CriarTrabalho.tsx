import { useState, useEffect, useRef } from 'react';
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

  // Autocomplete state
  const [clientes, setClientes] = useState<Tables<'clientes'>[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Tables<'clientes'>[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      const [rolesRes, clientesRes] = await Promise.all([
        supabase.from('user_roles').select('user_id').eq('role', 'tecnico'),
        supabase.from('clientes').select('*').order('nome'),
      ]);

      if (rolesRes.data && rolesRes.data.length > 0) {
        const tecnicoIds = rolesRes.data.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', tecnicoIds)
          .eq('ativo', true);
        setTecnicos((profiles || []) as any);
      }

      setClientes(clientesRes.data || []);
    }
    fetchData();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClienteNomeChange = (value: string) => {
    setClienteNome(value);
    setSelectedClienteId(null);
    if (value.trim().length >= 2) {
      const filtered = clientes.filter(c =>
        c.nome.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredClientes(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCliente = (cliente: Tables<'clientes'>) => {
    setClienteNome(cliente.nome);
    setClienteEndereco(cliente.endereco);
    setVendedor(cliente.vendedor || '');
    setSelectedClienteId(cliente.id);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNome || !clienteEndereco || !tecnicoId || !titulo || !descricao || !tipoTrabalho || !dataPrevista) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);

    let clienteId: string;

    if (selectedClienteId) {
      clienteId = selectedClienteId;
    } else {
      // Create or find client
      const { data: existingClients } = await supabase
        .from('clientes')
        .select('id')
        .eq('nome', clienteNome)
        .limit(1);

      if (existingClients && existingClients.length > 0) {
        clienteId = existingClients[0].id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clientes')
          .insert({ nome: clienteNome, endereco: clienteEndereco, telefone: '-', vendedor: vendedor || null })
          .select('id')
          .single();
        if (clientError || !newClient) {
          toast.error('Erro ao criar cliente: ' + (clientError?.message || ''));
          setLoading(false);
          return;
        }
        clienteId = newClient.id;
      }
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
        <div className="space-y-2 relative">
          <label className="text-sm font-medium text-foreground">Nome do cliente *</label>
          <Input
            ref={inputRef}
            placeholder="Ex: Sorveteria do João"
            value={clienteNome}
            onChange={e => handleClienteNomeChange(e.target.value)}
            onFocus={() => {
              if (clienteNome.trim().length >= 2 && filteredClientes.length > 0 && !selectedClienteId) {
                setShowSuggestions(true);
              }
            }}
            autoComplete="off"
            required
          />
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {filteredClientes.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border/50 last:border-0"
                  onClick={() => selectCliente(c)}
                >
                  <p className="text-sm font-medium text-foreground">{c.nome}</p>
                  <p className="text-xs text-muted-foreground">{c.endereco}</p>
                </button>
              ))}
            </div>
          )}
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
