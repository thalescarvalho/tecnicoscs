import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Users, Shield, Wrench, Trash2, KeyRound, Crown, ShoppingBag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type { Tables, Enums } from '@/integrations/supabase/types';

type ProfileWithRole = Tables<'profiles'> & { role?: Enums<'app_role'> | null };

export default function Usuarios() {
  const { role: myRole } = useAuth();
  const isAdmin = myRole === 'admin';
  const [users, setUsers] = useState<ProfileWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [passwordDialog, setPasswordDialog] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: '', userName: '' });
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchUsers() {
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('nome'),
      supabase.from('user_roles').select('user_id, role'),
    ]);

    const roleMap = new Map((rolesRes.data || []).map(r => [r.user_id, r.role]));
    const merged: ProfileWithRole[] = (profilesRes.data || []).map(p => ({
      ...p,
      role: roleMap.get(p.user_id) || null,
    }));
    setUsers(merged);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (newRole === 'none') {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
      if (error) { toast.error('Erro ao remover papel: ' + error.message); return; }
      toast.success('Papel removido');
    } else {
      const { data: existing } = await supabase.from('user_roles').select('id').eq('user_id', userId).maybeSingle();
      if (existing) {
        const { error } = await supabase.from('user_roles').update({ role: newRole as Enums<'app_role'> }).eq('user_id', userId);
        if (error) { toast.error('Erro: ' + error.message); return; }
      } else {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: newRole as Enums<'app_role'> });
        if (error) { toast.error('Erro: ' + error.message); return; }
      }
      toast.success('Papel atualizado!');
    }
    fetchUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-user', {
        body: { action: 'delete_user', targetUserId: userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Usuário deletado com sucesso');
      fetchUsers();
    } catch (err: any) {
      toast.error('Erro ao deletar: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-user', {
        body: { action: 'change_password', targetUserId: passwordDialog.userId, newPassword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Senha alterada com sucesso');
      setPasswordDialog({ open: false, userId: '', userName: '' });
      setNewPassword('');
    } catch (err: any) {
      toast.error('Erro ao trocar senha: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleIcon = (role?: Enums<'app_role'> | null) => {
    if (role === 'admin') return <Crown className="w-5 h-5" />;
    if (role === 'gestor') return <Shield className="w-5 h-5" />;
    if (role === 'vendedor') return <ShoppingBag className="w-5 h-5" />;
    if (role === 'tecnico') return <Wrench className="w-5 h-5" />;
    return <Users className="w-5 h-5" />;
  };

  const getRoleColor = (role?: Enums<'app_role'> | null) => {
    if (role === 'admin') return 'bg-destructive/15 text-destructive';
    if (role === 'gestor') return 'bg-primary/15 text-primary';
    if (role === 'vendedor') return 'bg-violet-500/15 text-violet-600';
    if (role === 'tecnico') return 'bg-success/15 text-success';
    return 'bg-muted/30 text-muted-foreground';
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Gestão de Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os papéis dos usuários cadastrados</p>
      </div>

      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum usuário cadastrado.</p>
        ) : users.map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getRoleColor(u.role)}`}>
                {getRoleIcon(u.role)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{u.nome}</p>
                <p className="text-xs text-muted-foreground">{u.ativo ? 'Ativo' : 'Inativo'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={u.role || 'none'} onValueChange={v => handleRoleChange(u.user_id, v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem papel</SelectItem>
                  {isAdmin && <SelectItem value="admin">Admin</SelectItem>}
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                </SelectContent>
              </Select>

              {isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => setPasswordDialog({ open: true, userId: u.user_id, userName: u.nome })}
                    title="Trocar senha"
                  >
                    <KeyRound className="w-4 h-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" title="Deletar usuário">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar usuário</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja deletar <strong>{u.nome}</strong>? Esta ação é irreversível e removerá todos os dados do usuário.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(u.user_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Deletando...' : 'Deletar'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Change password dialog */}
      <Dialog open={passwordDialog.open} onOpenChange={(open) => { if (!open) { setPasswordDialog({ open: false, userId: '', userName: '' }); setNewPassword(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar senha de {passwordDialog.userName}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Nova senha (mín. 6 caracteres)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPasswordDialog({ open: false, userId: '', userName: '' }); setNewPassword(''); }}>
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={actionLoading}>
              {actionLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
