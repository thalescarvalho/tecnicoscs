import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Plus, Store, MapPin, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

type Cliente = Tables<'clientes'> & { vendedor?: string | null };

export default function Clientes() {
  const { role } = useAuth();
  const canDelete = role === 'gestor' || role === 'admin';
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  // Form state
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  async function fetchClientes() {
    const { data } = await supabase.from('clientes').select('*').order('nome');
    setClientes((data || []) as Cliente[]);
    setLoading(false);
  }

  useEffect(() => { fetchClientes(); }, []);

  const resetForm = () => {
    setNome(''); setEndereco(''); setTelefone(''); setEmail(''); setVendedor('');
    setEditingId(null);
  };

  const openNew = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (c: Cliente) => {
    setNome(c.nome);
    setEndereco(c.endereco);
    setTelefone(c.telefone);
    setEmail(c.email || '');
    setVendedor(c.vendedor || '');
    setEditingId(c.id);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !endereco.trim() || !telefone.trim()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    setSaving(true);

    const payload = {
      nome: nome.trim(),
      endereco: endereco.trim(),
      telefone: telefone.trim(),
      email: email.trim() || null,
      vendedor: vendedor.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase.from('clientes').update(payload).eq('id', editingId);
      if (error) { toast.error('Erro: ' + error.message); setSaving(false); return; }
      toast.success('Cliente atualizado!');
    } else {
      const { error } = await supabase.from('clientes').insert(payload);
      if (error) { toast.error('Erro: ' + error.message); setSaving(false); return; }
      toast.success('Cliente cadastrado!');
    }

    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchClientes();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('clientes').delete().eq('id', deleteTarget.id);
    if (error) {
      toast.error(error.message.includes('violates foreign key') ? 'Este cliente possui trabalhos vinculados e não pode ser excluído.' : 'Erro: ' + error.message);
    } else {
      toast.success('Cliente excluído!');
      fetchClientes();
    }
    setDeleteTarget(null);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os clientes cadastrados</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Novo
        </Button>
      </div>

      <div className="space-y-3">
        {clientes.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Store className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
            <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
            <Button onClick={openNew} variant="outline" size="sm">Cadastrar primeiro cliente</Button>
          </div>
        ) : clientes.map((c, i) => (
          <motion.button key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => openEdit(c)}
            className="glass-card rounded-xl p-4 w-full text-left hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-semibold text-foreground truncate">{c.nome}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{c.endereco}</span>
                </div>
                {c.vendedor && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="w-3 h-3 shrink-0" />
                    <span className="truncate">{c.vendedor}</span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.button>
        ))}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome Fantasia *</label>
              <Input placeholder="Ex: Padaria Bom Pão" value={nome} onChange={e => setNome(e.target.value)} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Endereço *</label>
              <Input placeholder="Rua, número, bairro, cidade" value={endereco} onChange={e => setEndereco(e.target.value)} required maxLength={200} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Telefone *</label>
              <Input placeholder="(00) 00000-0000" value={telefone} onChange={e => setTelefone(e.target.value)} required maxLength={20} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <Input type="email" placeholder="email@cliente.com" value={email} onChange={e => setEmail(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Vendedor</label>
              <Input placeholder="Nome do vendedor responsável" value={vendedor} onChange={e => setVendedor(e.target.value)} maxLength={100} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
