import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockClientes, mockUsers } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const tiposServico = ['Manutenção', 'Instalação', 'Treinamento', 'Visita técnica', 'Produção sob demanda'];

export default function CriarTrabalho() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const tecnicos = mockUsers.filter(u => u.role === 'TECNICO' && u.ativo);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Trabalho criado com sucesso!');
      navigate('/trabalhos');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-foreground">Novo Trabalho</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cliente */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Cliente *</label>
          <Select required>
            <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
            <SelectContent>
              {mockClientes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Título *</label>
          <Input placeholder="Ex: Manutenção de forno" required />
        </div>

        {/* Tipo de serviço */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tipo de serviço *</label>
          <Select required>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {tiposServico.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Descrição *</label>
          <Textarea placeholder="Descreva o trabalho..." rows={3} required />
        </div>

        {/* Prioridade + Data */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Prioridade *</label>
            <Select required>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
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
            <Input type="date" required />
          </div>
        </div>

        {/* Técnico */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Técnico responsável *</label>
          <Select required>
            <SelectTrigger><SelectValue placeholder="Selecione o técnico" /></SelectTrigger>
            <SelectContent>
              {tecnicos.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Observações do gestor</label>
          <Textarea placeholder="Observações adicionais..." rows={2} />
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Trabalho'}
        </Button>
      </form>
    </div>
  );
}
