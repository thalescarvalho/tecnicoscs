import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { TrabalhoWithRelations } from './queries';
import type { Tables } from '@/integrations/supabase/types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function exportTrabalhoPDF(
  trabalho: TrabalhoWithRelations,
  itens: Tables<'itens_produzidos'>[],
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Finíssimo - Relatório de Trabalho', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 28, { align: 'center' });

  let y = 40;

  // Info do trabalho
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Trabalho', 14, y); y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const info = [
    ['Título', trabalho.titulo],
    ['Status', trabalho.status],
    ['Tipo', trabalho.tipo_servico],
    ['Data Prevista', new Date(trabalho.data_prevista).toLocaleDateString('pt-BR')],
    ['Cliente', trabalho.clientes?.nome || '—'],
    ['Endereço', trabalho.clientes?.endereco || '—'],
    ['Técnico', trabalho.tecnico_profile?.nome || '—'],
  ];

  info.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}: `, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 55, y);
    y += 6;
  });

  y += 4;

  // Timeline
  if (trabalho.start_at) {
    doc.setFont('helvetica', 'bold');
    doc.text('Início: ', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(trabalho.start_at).toLocaleString('pt-BR'), 55, y);
    if (trabalho.start_lat) doc.text(`(${trabalho.start_lat.toFixed(5)}, ${trabalho.start_lng?.toFixed(5)})`, 120, y);
    y += 6;
  }
  if (trabalho.end_at) {
    doc.setFont('helvetica', 'bold');
    doc.text('Término: ', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(trabalho.end_at).toLocaleString('pt-BR'), 55, y);
    if (trabalho.end_lat) doc.text(`(${trabalho.end_lat.toFixed(5)}, ${trabalho.end_lng?.toFixed(5)})`, 120, y);
    y += 6;
  }
  if (trabalho.start_at && trabalho.end_at) {
    const durMs = new Date(trabalho.end_at).getTime() - new Date(trabalho.start_at).getTime();
    const h = Math.floor(durMs / 3600000);
    const m = Math.round((durMs % 3600000) / 60000);
    doc.setFont('helvetica', 'bold');
    doc.text('Duração: ', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${h}h ${m}min`, 55, y);
    y += 6;
  }

  y += 6;

  // Observações
  if (trabalho.observacoes_gestor) {
    doc.setFont('helvetica', 'bold');
    doc.text('Obs. Gestor: ', 14, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(trabalho.observacoes_gestor, pageWidth - 70);
    doc.text(lines, 55, y);
    y += lines.length * 5 + 4;
  }
  if (trabalho.observacoes_tecnico) {
    doc.setFont('helvetica', 'bold');
    doc.text('Obs. Técnico: ', 14, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(trabalho.observacoes_tecnico, pageWidth - 70);
    doc.text(lines, 55, y);
    y += lines.length * 5 + 4;
  }

  y += 4;

  // Itens produzidos
  if (itens.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Itens Produzidos', 14, y); y += 4;

    const totalPeso = itens.reduce((s, i) => s + Number(i.peso_valor), 0);

    doc.autoTable({
      startY: y,
      head: [['Produto', 'Peso', 'Unidade', 'Qtd']],
      body: itens.map(i => [i.nome_produto, i.peso_valor, i.peso_unidade, i.quantidade || 1]),
      foot: [['Total', totalPeso.toFixed(2), 'kg', '']],
      theme: 'grid',
      headStyles: { fillColor: [217, 119, 6] },
      footStyles: { fillColor: [255, 237, 213] },
      margin: { left: 14 },
    });
  }

  doc.save(`relatorio-${trabalho.titulo.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
