import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout, AuthProvider } from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/gestor/Dashboard";
import Trabalhos from "./pages/gestor/Trabalhos";
import CriarTrabalho from "./pages/gestor/CriarTrabalho";
import Relatorios from "./pages/gestor/Relatorios";
import MeusTrabalhos from "./pages/tecnico/MeusTrabalhos";
import TrabalhoDetalhes from "./pages/TrabalhoDetalhes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/trabalhos" element={<AppLayout><Trabalhos /></AppLayout>} />
            <Route path="/trabalhos/novo" element={<AppLayout><CriarTrabalho /></AppLayout>} />
            <Route path="/relatorios" element={<AppLayout><Relatorios /></AppLayout>} />
            <Route path="/meus-trabalhos" element={<AppLayout><MeusTrabalhos /></AppLayout>} />
            <Route path="/trabalho/:id" element={<AppLayout><TrabalhoDetalhes /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
