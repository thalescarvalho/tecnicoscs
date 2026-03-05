import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/gestor/Dashboard";
import Trabalhos from "./pages/gestor/Trabalhos";
import CriarTrabalho from "./pages/gestor/CriarTrabalho";
import Relatorios from "./pages/gestor/Relatorios";
import MeusTrabalhos from "./pages/tecnico/MeusTrabalhos";
import TrabalhoDetalhes from "./pages/TrabalhoDetalhes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'gestor' | 'tecnico' }) {
  const { role, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (role !== allowedRole) return <Navigate to={role === 'gestor' ? '/dashboard' : '/meus-trabalhos'} replace />;
  return <>{children}</>;
}

function AuthRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'tecnico' ? '/meus-trabalhos' : '/dashboard'} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><RoleRoute allowedRole="gestor"><AppLayout><Dashboard /></AppLayout></RoleRoute></ProtectedRoute>} />
            <Route path="/trabalhos" element={<ProtectedRoute><RoleRoute allowedRole="gestor"><AppLayout><Trabalhos /></AppLayout></RoleRoute></ProtectedRoute>} />
            <Route path="/trabalhos/novo" element={<ProtectedRoute><RoleRoute allowedRole="gestor"><AppLayout><CriarTrabalho /></AppLayout></RoleRoute></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><RoleRoute allowedRole="gestor"><AppLayout><Relatorios /></AppLayout></RoleRoute></ProtectedRoute>} />
            <Route path="/meus-trabalhos" element={<ProtectedRoute><RoleRoute allowedRole="tecnico"><AppLayout><MeusTrabalhos /></AppLayout></RoleRoute></ProtectedRoute>} />
            <Route path="/trabalho/:id" element={<ProtectedRoute><AppLayout><TrabalhoDetalhes /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
