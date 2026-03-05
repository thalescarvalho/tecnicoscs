import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Demo: route based on email
      if (email.includes('tecnico') || email.includes('carlos')) {
        localStorage.setItem('demo_role', 'TECNICO');
        navigate('/meus-trabalhos');
      } else {
        localStorage.setItem('demo_role', 'GESTOR');
        navigate('/dashboard');
      }
      toast.success('Bem-vindo(a) ao PanTech!');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-heading font-bold text-foreground">PanTech</h1>
          <p className="text-sm text-muted-foreground">Gestão de trabalhos técnicos<br />em panificação e confeitaria</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">E-mail</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Senha</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-12"
              required
            />
          </div>
          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <button className="text-xs text-primary hover:underline">Esqueceu a senha?</button>
          <div className="glass-card rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium">DEMO — Para testar:</p>
            <p className="text-[10px] text-muted-foreground">Gestor: qualquer email · Técnico: email com "tecnico"</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
