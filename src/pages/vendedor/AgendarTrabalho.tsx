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

export default function AgendarTrabalho() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [clienteNome, setClienteNome] = useState('');
  const [clienteEndereco, setClienteEndereco] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipoTrabalho, setTipoTrabalho] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Autocomplete
  const [clientes, setClientes] = useState<Tables<'clientes'>[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Tables<'clientes'>[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Products
  const [produtos, setProdutos] = useState<{ nome: string; quantidade: string }[]>([]);
  const [novoProdutoNome, setNovoProdutoNome] = useState('');
  const [novoProdutoQtd, setNovoProdutoQtd] = useState('');

  useEffect(() => {
    supabase.from('clientes').select('*').order('nome').then(({ data }) => setClientes(data || []));
  }, []);

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
      const filtered = clientes.filter(c => c.nome.toLowerCase().includes(value.toLowerCase()));
      setFilteredClientes(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCliente = (cliente: Tables<'clientes'>) => {
    setClienteNome(cliente.nome);
    setClienteEndereco(cliente.endereco);
    setSelectedClienteId(cliente.id);
    setShowSuggestions(false);
  };

  const addProduto = () => {
    if (!novoProdutoNome.trim()) return;
    setProdutos([...produtos, { nome: novoProdutoNome.trim(), quantidade: novoProdutoQtd || '1' }]);
    setNovoProdutoNome('');
    setNovoProdutoQtd('');
  };

  const removeProduto = (index: number) => {
    setProdutos(produtos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNome || !clienteEndereco || !titulo || !descricao || !tipoTrabalho || !dataPrevista) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);

    let clienteId: string;
    if (selectedClienteId) {
      clienteId = selectedClienteId;
    } else {
      const { data: existing } = await supabase.from('clientes').select('id').eq('nome', clienteNome).limit(1);
      if (existing && existing.length > 0) {
        clienteId = existing[0].id;
      } else {
        const { data: newC, error: cErr } = await supabase.from('clientes')
          .insert({ nome: clienteNome, endereco: clienteEndereco, telefone: '-', vendedor: user?.user_metadata?.nome || null })
          .select('id').single();
        if (cErr || !newC) { toast.error('Erro ao criar cliente: ' + (cErr?.message || '')); setLoading(false); return; }
        clienteId = newC.id;
      }
    }

    const { data: trabalho, error } = await supabase.from('trabalhos').insert({
      cliente_id: clienteId,
      vendedor_id: user!.id,
      titulo, descricao,
      tipo_servico: tipoTrabalho,
      data_prevista: dataPrevista,
      status: 'AGUARDANDO_APROVACAO' as any,
      observacoes_gestor: observacoes || null,
    } as any).select('id').single();

    if (error) { toast.error('Erro ao agendar: ' + error.message); setLoading(false); return; }

    // Insert products
    if (trabalho && produtos.length > 0) {
      const itensPayload = produtos.map(p => ({
        trabalho_id: trabalho.id,
        nome_produto: p.nome,
        quantidade: parseInt(p.quantidade) || 1,
        peso_valor: 0,
        peso_unidade: 'kg',
      }));
      await supabase.from('itens_produzidos').insert(itensPayload);
    }

    setLoading(false);
    toast.success('Trabalho agendado! Aguardando aprovação do gestor.');
    navigate('/vendedor/trabalhos');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-foreground">Agendar Trabalho</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2 relative">
          <label className="text-sm font-medium text-foreground">Nome do cliente *</label>
          <Input ref={inputRef} placeholder="Ex: Sorveteria do João" value={clienteNome}
            onChange={e => handleClienteNomeChange(e.target.value)}
            onFocus={() => { if (clienteNome.trim().length >= 2 && filteredClientes.length > 0 && !selectedClienteId) setShowSuggestions(true); }}
            autoComplete="off" required />
          {showSuggestions && (
            <div ref={suggestionsRef} className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredClientes.map(c => (
                <button key={c.id} type="button" className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border/50 last:border-0"
                  onClick={() => selectCliente(c)}>
                  <p className="text-sm font-medium text-foreground">{c.nome}</p>
                  <p className="text-xs text-muted-foreground">{c.endereco}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Endereço do cliente *</label>
          <Input placeholder="Rua, número, bairro" value={clienteEndereco} onChange={e => setClienteEndereco(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Título *</label>
          <Input placeholder="Ex: Desmanche padaria centro" value={titulo} onChange={e => setTitulo(e.target.value)} required />
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
          <label className="text-sm font-medium text-foreground">Observações</label>
          <Textarea placeholder="Informações adicionais..." rows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} />
        </div>

        {/* Products section */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Produtos a serem trabalhados</h3>
          {produtos.length > 0 && (
            <div className="space-y-2">
              {produtos.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{p.nome} {p.quantidade !== '1' && `(${p.quantidade}x)`}</span>
                  <button type="button" onClick={() => removeProduto(i)} className="text-xs text-destructive hover:underline">remover</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input placeholder="Nome do produto" value={novoProdutoNome} onChange={e => setNovoProdutoNome(e.target.value)} className="text-sm" />
            <Input placeholder="Qtd" value={novoProdutoQtd} onChange={e => setNovoProdutoQtd(e.target.value)} className="text-sm w-20" type="number" min="1" />
            <Button type="button" size="sm" onClick={addProduto} disabled={!novoProdutoNome.trim()}>+</Button>
          </div>
          <p className="text-[10px] text-muted-foreground">O peso será preenchido pelo técnico na finalização.</p>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
          {loading ? 'Agendando...' : 'Agendar Trabalho'}
        </Button>
      </form>
    </div>
  );
}
