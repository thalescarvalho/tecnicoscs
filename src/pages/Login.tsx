import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import logo from '@/assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<string>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Bem-vindo(a) ao Finíssimo!');
    // Auth state change will redirect
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { toast.error('Informe seu nome'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { nome },
        emailRedirectTo: window.location.origin,
      }
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Conta criada! Verifique seu e-mail ou faça login.');
    setTab('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <img src={logo} alt="Finíssimo" className="h-16 w-auto mx-auto" />
          <h1 className="text-4xl font-heading font-bold text-amber-900">Finíssimo</h1>
          <p className="text-sm text-amber-700">Gestão de trabalhos técnicos<br />em panificação e confeitaria</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">E-mail</label>
                <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="h-12" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Senha</label>
                <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="h-12" required />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome completo</label>
                <Input placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} className="h-12" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">E-mail</label>
                <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="h-12" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Senha</label>
                <Input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} className="h-12" minLength={6} required />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                {loading ? 'Criando...' : 'Criar conta'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-[10px] text-center text-muted-foreground">
          Após criar a conta, peça ao gestor para atribuir seu papel (Gestor ou Técnico).
        </p>
      </motion.div>
    </div>
  );
}
