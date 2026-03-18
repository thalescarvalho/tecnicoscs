
-- Add vendedor_id to trabalhos
ALTER TABLE public.trabalhos ADD COLUMN IF NOT EXISTS vendedor_id uuid;

-- Make tecnico_id nullable
ALTER TABLE public.trabalhos ALTER COLUMN tecnico_id DROP NOT NULL;

-- Make gestor_id nullable
ALTER TABLE public.trabalhos ALTER COLUMN gestor_id DROP NOT NULL;

-- Make peso_valor default 0
ALTER TABLE public.itens_produzidos ALTER COLUMN peso_valor SET DEFAULT 0;

-- RLS: Vendedores can create trabalhos
CREATE POLICY "Vendedores can create trabalhos" ON public.trabalhos
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'vendedor'));

-- RLS: Vendedores can view their trabalhos
CREATE POLICY "Vendedores can view own trabalhos" ON public.trabalhos
FOR SELECT TO authenticated
USING (vendedor_id = auth.uid());

-- RLS: Vendedores can insert clientes
CREATE POLICY "Vendedores can insert clientes" ON public.clientes
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'vendedor'));

-- RLS: Vendedores can insert itens for their AGUARDANDO trabalhos
CREATE POLICY "Vendedores can insert itens" ON public.itens_produzidos
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM trabalhos t 
  WHERE t.id = itens_produzidos.trabalho_id 
  AND t.vendedor_id = auth.uid()
  AND t.status = 'AGUARDANDO_APROVACAO'));

-- RLS: Vendedores can view itens of their trabalhos
CREATE POLICY "Vendedores can view itens" ON public.itens_produzidos
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM trabalhos t 
  WHERE t.id = itens_produzidos.trabalho_id 
  AND t.vendedor_id = auth.uid()));

-- RLS: Vendedores can view fotos of their trabalhos
CREATE POLICY "Vendedores can view fotos" ON public.fotos
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM trabalhos t 
  WHERE t.id = fotos.trabalho_id 
  AND t.vendedor_id = auth.uid()));

-- RLS: Tecnicos can update itens (to fill in weights)
CREATE POLICY "Tecnicos can update itens" ON public.itens_produzidos
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM trabalhos t 
  WHERE t.id = itens_produzidos.trabalho_id 
  AND t.tecnico_id = auth.uid()
  AND t.status = 'ANDAMENTO'));

-- RLS: Vendedores can delete itens from their AGUARDANDO trabalhos
CREATE POLICY "Vendedores can delete own itens" ON public.itens_produzidos
FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM trabalhos t 
  WHERE t.id = itens_produzidos.trabalho_id 
  AND t.vendedor_id = auth.uid()
  AND t.status = 'AGUARDANDO_APROVACAO'));
