
-- Table for work evaluations (client feedback)
CREATE TABLE public.avaliacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trabalho_id UUID NOT NULL REFERENCES public.trabalhos(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  cliente_nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public evaluation form)
CREATE POLICY "Anyone can insert avaliacao" ON public.avaliacoes FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only gestores can view
CREATE POLICY "Gestores can view avaliacoes" ON public.avaliacoes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'gestor'::app_role));

-- Gestores can delete
CREATE POLICY "Gestores can delete avaliacoes" ON public.avaliacoes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'gestor'::app_role));
