import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { dateKeyToLocalDate, localDateToDateKey, useTecnicoDatasOcupadas } from '@/hooks/useTecnicoDatasOcupadas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [temCustos, setTemCustos] = useState(false);
  const [cidadeTrabalho, setCidadeTrabalho] = useState('');
  const [custoTransladoCidade, setCustoTransladoCidade] = useState('');
  const [custoTransladoCliente, setCustoTransladoCliente] = useState('');
  const [custoHospedagem, setCustoHospedagem] = useState('');
  const [custoAlimentacao, setCustoAlimentacao] = useState('');
  const { datasOcupadas, isDateOccupied } = useTecnicoDatasOcupadas(tecnicoId);

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
    if (datasOcupadas.has(dataPrevista)) {
      toast.error('O técnico selecionado já possui um trabalho nessa data');
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
      tem_custos: temCustos,
      ...(temCustos ? {
        cidade_trabalho: cidadeTrabalho || null,
        custo_translado_cidade: parseFloat(custoTransladoCidade) || 0,
        custo_translado_cliente: parseFloat(custoTransladoCliente) || 0,
        custo_hospedagem: parseFloat(custoHospedagem) || 0,
        custo_alimentacao: parseFloat(custoAlimentacao) || 0,
      } : {}),
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dataPrevista && 'text-muted-foreground',
                  dataPrevista && datasOcupadas.has(dataPrevista) && 'border-destructive/40 text-destructive'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataPrevista ? format(dateKeyToLocalDate(dataPrevista), 'dd/MM/yyyy', { locale: ptBR }) : <span>Selecione a data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dataPrevista ? dateKeyToLocalDate(dataPrevista) : undefined}
                onSelect={(date) => setDataPrevista(date ? localDateToDateKey(date) : '')}
                disabled={(date) => isDateOccupied(date)}
                modifiers={{ ocupado: (date) => isDateOccupied(date) }}
                modifiersStyles={{
                  ocupado: {
                    color: 'hsl(var(--destructive))',
                    backgroundColor: 'hsl(var(--destructive) / 0.12)',
                    fontWeight: 600,
                    opacity: 1,
                  },
                }}
                locale={ptBR}
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
          {tecnicoId && datasOcupadas.size > 0 && (
            <p className="text-xs text-muted-foreground">Datas em vermelho já estão ocupadas para este técnico.</p>
          )}
          {dataPrevista && datasOcupadas.has(dataPrevista) && (
            <p className="text-xs font-medium text-destructive">O técnico selecionado já possui um trabalho nesta data.</p>
          )}
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

        {/* Custos */}
        <div className="flex items-center gap-2 pt-1">
          <Checkbox id="temCustosCriar" checked={temCustos} onCheckedChange={(v) => setTemCustos(!!v)} />
          <label htmlFor="temCustosCriar" className="text-sm font-medium cursor-pointer">Este trabalho terá custos</label>
        </div>
        {temCustos && (
          <div className="space-y-2 pl-3 border-l-2 border-primary/30">
            <div>
              <label className="text-xs text-muted-foreground">Cidade do trabalho</label>
              <Input placeholder="Ex: São Paulo" value={cidadeTrabalho} onChange={e => setCidadeTrabalho(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Translado cidade (R$)</label>
                <Input type="number" step="0.01" placeholder="0,00" value={custoTransladoCidade} onChange={e => setCustoTransladoCidade(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Translado cliente (R$)</label>
                <Input type="number" step="0.01" placeholder="0,00" value={custoTransladoCliente} onChange={e => setCustoTransladoCliente(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Hospedagem (R$)</label>
                <Input type="number" step="0.01" placeholder="0,00" value={custoHospedagem} onChange={e => setCustoHospedagem(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Alimentação (R$)</label>
                <Input type="number" step="0.01" placeholder="0,00" value={custoAlimentacao} onChange={e => setCustoAlimentacao(e.target.value)} />
              </div>
            </div>
          </div>
        )}
        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Trabalho'}
        </Button>
      </form>
    </div>
  );
}
