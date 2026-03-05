import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, ClipboardList, UserPlus, FileText, Wrench, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const gestorLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trabalhos', label: 'Trabalhos', icon: ClipboardList },
  { to: '/trabalhos/novo', label: 'Novo Trabalho', icon: UserPlus },
  { to: '/relatorios', label: 'Relatórios', icon: FileText },
];

const tecnicoLinks = [
  { to: '/meus-trabalhos', label: 'Meus Trabalhos', icon: Wrench },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = role === 'gestor' ? gestorLinks : tecnicoLinks;
  const roleLabel = role === 'gestor' ? '👔 Gestor' : '🔧 Técnico';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors lg:hidden">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-heading text-lg font-bold text-foreground tracking-tight">PanTech</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{profile?.nome}</span>
            <span className="status-badge bg-primary/10 text-foreground border border-primary/20 text-[10px]">{roleLabel}</span>
            <button onClick={handleSignOut} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-card border-b border-border overflow-hidden lg:hidden">
            <div className="p-3 space-y-1 max-w-4xl mx-auto">
              {links.map(link => (
                <button key={link.to} onClick={() => { navigate(link.to); setMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-secondary'}`}>
                  <link.icon className="w-4 h-4" />{link.label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Desktop nav */}
      <nav className="hidden lg:block border-b border-border bg-card/50">
        <div className="flex gap-1 max-w-4xl mx-auto px-4 py-1">
          {links.map(link => (
            <button key={link.to} onClick={() => navigate(link.to)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-secondary'}`}>
              <link.icon className="w-4 h-4" />{link.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border lg:hidden">
        <div className="flex justify-around py-2 px-2 max-w-md mx-auto">
          {links.map(link => {
            const active = location.pathname.startsWith(link.to);
            return (
              <button key={link.to} onClick={() => navigate(link.to)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                <link.icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />{link.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 pb-20 lg:pb-6">
        <div className="max-w-4xl mx-auto px-4 py-4">{children}</div>
      </main>
    </div>
  );
}
