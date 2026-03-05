
-- Enums
CREATE TYPE public.app_role AS ENUM ('gestor', 'tecnico');
CREATE TYPE public.trabalho_status AS ENUM ('PENDENTE', 'ANDAMENTO', 'CONCLUIDO', 'CANCELADO');
CREATE TYPE public.prioridade AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- user_roles table FIRST
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function (now user_roles exists)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Gestores can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestores can manage roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'gestor'));

-- profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT,
  avatar_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL, telefone TEXT NOT NULL, email TEXT, endereco TEXT NOT NULL, referencia TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestores can insert clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestores can update clientes" ON public.clientes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'gestor'));

-- trabalhos
CREATE TABLE public.trabalhos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id),
  tecnico_id UUID NOT NULL REFERENCES auth.users(id),
  gestor_id UUID NOT NULL REFERENCES auth.users(id),
  titulo TEXT NOT NULL, descricao TEXT NOT NULL, tipo_servico TEXT NOT NULL,
  prioridade prioridade NOT NULL DEFAULT 'MEDIA',
  data_prevista DATE NOT NULL,
  status trabalho_status NOT NULL DEFAULT 'PENDENTE',
  start_at TIMESTAMPTZ, start_lat DOUBLE PRECISION, start_lng DOUBLE PRECISION, start_accuracy DOUBLE PRECISION,
  end_at TIMESTAMPTZ, end_lat DOUBLE PRECISION, end_lng DOUBLE PRECISION,
  observacoes_gestor TEXT, observacoes_tecnico TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trabalhos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gestores can view all trabalhos" ON public.trabalhos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Tecnicos can view assigned trabalhos" ON public.trabalhos FOR SELECT TO authenticated USING (auth.uid() = tecnico_id);
CREATE POLICY "Gestores can create trabalhos" ON public.trabalhos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Gestores can update trabalhos" ON public.trabalhos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Tecnicos can update assigned trabalhos" ON public.trabalhos FOR UPDATE TO authenticated USING (auth.uid() = tecnico_id);
CREATE TRIGGER update_trabalhos_updated_at BEFORE UPDATE ON public.trabalhos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- itens_produzidos
CREATE TABLE public.itens_produzidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trabalho_id UUID NOT NULL REFERENCES public.trabalhos(id) ON DELETE CASCADE,
  nome_produto TEXT NOT NULL, peso_valor NUMERIC(10,3) NOT NULL,
  peso_unidade TEXT NOT NULL DEFAULT 'kg' CHECK (peso_unidade IN ('kg', 'g')),
  quantidade INTEGER, observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.itens_produzidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view itens" ON public.itens_produzidos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trabalhos t WHERE t.id = trabalho_id AND (t.tecnico_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))));
CREATE POLICY "Tecnicos can insert itens" ON public.itens_produzidos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trabalhos t WHERE t.id = trabalho_id AND t.tecnico_id = auth.uid() AND t.status = 'ANDAMENTO'));
CREATE POLICY "Tecnicos can delete itens" ON public.itens_produzidos FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trabalhos t WHERE t.id = trabalho_id AND t.tecnico_id = auth.uid() AND t.status = 'ANDAMENTO'));

-- fotos
CREATE TABLE public.fotos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trabalho_id UUID NOT NULL REFERENCES public.trabalhos(id) ON DELETE CASCADE,
  url TEXT NOT NULL, legenda TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view fotos" ON public.fotos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trabalhos t WHERE t.id = trabalho_id AND (t.tecnico_id = auth.uid() OR public.has_role(auth.uid(), 'gestor'))));
CREATE POLICY "Tecnicos can insert fotos" ON public.fotos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trabalhos t WHERE t.id = trabalho_id AND t.tecnico_id = auth.uid() AND t.status = 'ANDAMENTO'));
CREATE POLICY "Tecnicos can delete fotos" ON public.fotos FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trabalhos t WHERE t.id = trabalho_id AND t.tecnico_id = auth.uid() AND t.status = 'ANDAMENTO'));

-- audit_log
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trabalho_id UUID REFERENCES public.trabalhos(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  acao TEXT NOT NULL, payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gestores can view audit" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'gestor'));
CREATE POLICY "Users can insert audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('trabalho-fotos', 'trabalho-fotos', true);
CREATE POLICY "Anyone can view trabalho photos" ON storage.objects FOR SELECT USING (bucket_id = 'trabalho-fotos');
CREATE POLICY "Auth can upload trabalho photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'trabalho-fotos');
CREATE POLICY "Auth can delete own uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'trabalho-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Indexes
CREATE INDEX idx_trabalhos_tecnico ON public.trabalhos(tecnico_id);
CREATE INDEX idx_trabalhos_status ON public.trabalhos(status);
CREATE INDEX idx_trabalhos_data ON public.trabalhos(data_prevista);
CREATE INDEX idx_itens_trabalho ON public.itens_produzidos(trabalho_id);
CREATE INDEX idx_fotos_trabalho ON public.fotos(trabalho_id);
CREATE INDEX idx_audit_trabalho ON public.audit_log(trabalho_id);
