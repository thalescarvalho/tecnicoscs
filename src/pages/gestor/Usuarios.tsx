import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Users, Shield, Wrench, UserCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Tables, Enums } from '@/integrations/supabase/types';

type ProfileWithRole = Tables<'profiles'> & { role?: Enums<'app_role'> | null };

export default function Usuarios() {
  const [users, setUsers] = useState<ProfileWithRole[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Remove role
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
      if (error) { toast.error('Erro ao remover papel: ' + error.message); return; }
      toast.success('Papel removido');
    } else {
      // Upsert role
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                u.role === 'gestor' ? 'bg-primary/15 text-primary' : u.role === 'tecnico' ? 'bg-success/15 text-success' : 'bg-muted/30 text-muted-foreground'
              }`}>
                {u.role === 'gestor' ? <Shield className="w-5 h-5" /> : u.role === 'tecnico' ? <Wrench className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{u.nome}</p>
                <p className="text-xs text-muted-foreground">{u.ativo ? 'Ativo' : 'Inativo'}</p>
              </div>
            </div>
            <Select value={u.role || 'none'} onValueChange={v => handleRoleChange(u.user_id, v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem papel</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
