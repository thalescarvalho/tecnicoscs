import { ReactNode, useState, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';
import { LayoutDashboard, ClipboardList, UserPlus, FileText, Wrench, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthContextType {
  role: UserRole;
  setRole: (r: UserRole) => void;
  userName: string;
}

const AuthContext = createContext<AuthContextType>({
  role: 'GESTOR',
  setRole: () => {},
  userName: 'Ana Silva',
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('demo_role') as UserRole) || 'GESTOR';
  });

  const handleSetRole = (r: UserRole) => {
    localStorage.setItem('demo_role', r);
    setRole(r);
  };

  const userName = role === 'GESTOR' ? 'Ana Silva' : 'Carlos Oliveira';

  return (
    <AuthContext.Provider value={{ role, setRole: handleSetRole, userName }}>
      {children}
    </AuthContext.Provider>
  );
}

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
  const { role, setRole, userName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = role === 'GESTOR' ? gestorLinks : tecnicoLinks;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors lg:hidden">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-heading text-lg font-bold text-foreground tracking-tight">
              PanTech
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{userName}</span>
            <button
              onClick={() => {
                const newRole = role === 'GESTOR' ? 'TECNICO' : 'GESTOR';
                setRole(newRole);
                navigate(newRole === 'GESTOR' ? '/dashboard' : '/meus-trabalhos');
              }}
              className="status-badge bg-primary/10 text-foreground border border-primary/20 text-[10px] cursor-pointer hover:bg-primary/20 transition-colors"
            >
              {role === 'GESTOR' ? '👔 Gestor' : '🔧 Técnico'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card border-b border-border overflow-hidden lg:hidden"
          >
            <div className="p-3 space-y-1 max-w-4xl mx-auto">
              {links.map(link => (
                <button
                  key={link.to}
                  onClick={() => { navigate(link.to); setMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
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
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
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
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <link.icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
                {link.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 pb-20 lg:pb-6">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {children}
        </div>
      </main>
    </div>
  );
}
