import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Tables } from '@/integrations/supabase/types';

interface TrabalhoComCusto {
  id: string;
  titulo: string;
  data_prevista: string;
  cidade_trabalho: string | null;
  custo_translado_cidade: number;
  custo_translado_cliente: number;
  custo_hospedagem: number;
  custo_alimentacao: number;
  cliente_nome: string;
  tecnico_nome: string;
}

export default function RelatorioCustos() {
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().split('T')[0]);
  const [tecnicos, setTecnicos] = useState<(Tables<'profiles'> & { user_id: string })[]>([]);
  const [selectedTecnico, setSelectedTecnico] = useState('todos');
  const [dados, setDados] = useState<TrabalhoComCusto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTecnicos() {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'tecnico');
      if (roles && roles.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', roles.map(r => r.user_id)).eq('ativo', true);
        setTecnicos((profiles || []) as any);
      }
    }
    fetchTecnicos();
  }, []);

  const fetchCustos = async () => {
    setLoading(true);
    let query = supabase.from('trabalhos')
      .select('id, titulo, data_prevista, cidade_trabalho, custo_translado_cidade, custo_translado_cliente, custo_hospedagem, custo_alimentacao, tecnico_id, clientes(nome)')
      .eq('tem_custos', true)
      .gte('data_prevista', dataInicio)
      .lte('data_prevista', dataFim);

    if (selectedTecnico !== 'todos') {
      query = query.eq('tecnico_id', selectedTecnico);
    }

    const { data: trabalhos } = await query;
    if (!trabalhos || trabalhos.length === 0) {
      setDados([]);
      setLoading(false);
      return;
    }

    const tecnicoIds = [...new Set(trabalhos.map(t => t.tecnico_id).filter(Boolean))] as string[];
    let profileMap = new Map<string, string>();
    if (tecnicoIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('user_id, nome').in('user_id', tecnicoIds);
      (profiles || []).forEach(p => profileMap.set(p.user_id, p.nome));
    }

    const result: TrabalhoComCusto[] = trabalhos.map((t: any) => ({
      id: t.id,
      titulo: t.titulo,
      data_prevista: t.data_prevista,
      cidade_trabalho: t.cidade_trabalho,
      custo_translado_cidade: Number(t.custo_translado_cidade || 0),
      custo_translado_cliente: Number(t.custo_translado_cliente || 0),
      custo_hospedagem: Number(t.custo_hospedagem || 0),
      custo_alimentacao: Number(t.custo_alimentacao || 0),
      cliente_nome: t.clientes?.nome || '—',
      tecnico_nome: t.tecnico_id ? profileMap.get(t.tecnico_id) || '—' : '—',
    }));

    setDados(result);
    setLoading(false);
  };

  useEffect(() => { fetchCustos(); }, [dataInicio, dataFim, selectedTecnico]);

  const totalGeral = (field: keyof TrabalhoComCusto) => dados.reduce((s, d) => s + Number(d[field] || 0), 0);
  const totalTrabalho = (d: TrabalhoComCusto) => d.custo_translado_cidade + d.custo_translado_cliente + d.custo_hospedagem + d.custo_alimentacao;
  const totalGeralAll = dados.reduce((s, d) => s + totalTrabalho(d), 0);

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pw = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Custos', pw / 2, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const tecnicoNome = selectedTecnico === 'todos' ? 'Todos' : tecnicos.find(t => t.user_id === selectedTecnico)?.nome || '';
    doc.text(`Período: ${formatDate(dataInicio)} a ${formatDate(dataFim)} | Técnico: ${tecnicoNome}`, pw / 2, 26, { align: 'center' });

    autoTable(doc, {
      startY: 34,
      head: [['Data', 'Trabalho', 'Cliente', 'Técnico', 'Cidade', 'Transl. Cidade', 'Transl. Cliente', 'Hospedagem', 'Alimentação', 'Total']],
      body: dados.map(d => [
        formatDate(d.data_prevista),
        d.titulo,
        d.cliente_nome,
        d.tecnico_nome,
        d.cidade_trabalho || '—',
        `R$ ${d.custo_translado_cidade.toFixed(2)}`,
        `R$ ${d.custo_translado_cliente.toFixed(2)}`,
        `R$ ${d.custo_hospedagem.toFixed(2)}`,
        `R$ ${d.custo_alimentacao.toFixed(2)}`,
        `R$ ${totalTrabalho(d).toFixed(2)}`,
      ]),
      foot: [['', '', '', '', 'TOTAL',
        `R$ ${totalGeral('custo_translado_cidade').toFixed(2)}`,
        `R$ ${totalGeral('custo_translado_cliente').toFixed(2)}`,
        `R$ ${totalGeral('custo_hospedagem').toFixed(2)}`,
        `R$ ${totalGeral('custo_alimentacao').toFixed(2)}`,
        `R$ ${totalGeralAll.toFixed(2)}`,
      ]],
      theme: 'grid',
      headStyles: { fillColor: [217, 119, 6], fontSize: 7 },
      footStyles: { fillColor: [255, 237, 213], fontStyle: 'bold', fontSize: 7 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 10, right: 10 },
    });

    doc.save(`custos-${dataInicio}-a-${dataFim}.pdf`);
    toast.success('PDF exportado!');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold text-foreground">Relatório de Custos</h1>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Data início</label>
            <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Data fim</label>
            <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Técnico</label>
            <Select value={selectedTecnico} onValueChange={setSelectedTecnico}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os técnicos</SelectItem>
                {tecnicos.map(t => <SelectItem key={t.user_id} value={t.user_id}>{t.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
      ) : dados.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum trabalho com custos no período selecionado</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto glass-card rounded-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Trabalho</TableHead>
                  <TableHead className="text-xs">Cliente</TableHead>
                  <TableHead className="text-xs">Técnico</TableHead>
                  <TableHead className="text-xs">Cidade</TableHead>
                  <TableHead className="text-xs text-right">Transl. Cidade</TableHead>
                  <TableHead className="text-xs text-right">Transl. Cliente</TableHead>
                  <TableHead className="text-xs text-right">Hospedagem</TableHead>
                  <TableHead className="text-xs text-right">Alimentação</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="text-xs">{formatDate(d.data_prevista)}</TableCell>
                    <TableCell className="text-xs font-medium">{d.titulo}</TableCell>
                    <TableCell className="text-xs">{d.cliente_nome}</TableCell>
                    <TableCell className="text-xs">{d.tecnico_nome}</TableCell>
                    <TableCell className="text-xs">{d.cidade_trabalho || '—'}</TableCell>
                    <TableCell className="text-xs text-right">R$ {d.custo_translado_cidade.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right">R$ {d.custo_translado_cliente.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right">R$ {d.custo_hospedagem.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right">R$ {d.custo_alimentacao.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-semibold">R$ {totalTrabalho(d).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
              <TableRow>
                  <TableCell colSpan={5} className="text-xs font-bold text-right text-foreground">TOTAL</TableCell>
                  <TableCell className="text-xs text-right font-bold text-foreground">R$ {totalGeral('custo_translado_cidade').toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-right font-bold text-foreground">R$ {totalGeral('custo_translado_cliente').toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-right font-bold text-foreground">R$ {totalGeral('custo_hospedagem').toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-right font-bold text-foreground">R$ {totalGeral('custo_alimentacao').toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-right font-bold text-foreground">R$ {totalGeralAll.toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <Button onClick={exportPDF} variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" /> Exportar PDF
          </Button>
        </>
      )}
    </div>
  );
}
