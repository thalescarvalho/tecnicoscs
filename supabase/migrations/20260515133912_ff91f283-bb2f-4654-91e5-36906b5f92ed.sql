
-- Add vendedor_id to clientes for ownership
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS vendedor_id uuid;
CREATE INDEX IF NOT EXISTS idx_clientes_vendedor_id ON public.clientes(vendedor_id);

-- Backfill: try matching by vendedor name to a profile
UPDATE public.clientes c
SET vendedor_id = p.user_id
FROM public.profiles p
WHERE c.vendedor_id IS NULL
  AND c.vendedor IS NOT NULL
  AND lower(trim(p.nome)) = lower(trim(c.vendedor));

-- Replace SELECT policy to be role-aware
DROP POLICY IF EXISTS "Authenticated can view clientes" ON public.clientes;

CREATE POLICY "Gestores and admins view all clientes"
  ON public.clientes FOR SELECT
  TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

CREATE POLICY "Vendedores view own clientes"
  ON public.clientes FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'vendedor'::app_role)
    AND vendedor_id = auth.uid()
  );

CREATE POLICY "Tecnicos view clientes of assigned trabalhos"
  ON public.clientes FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'tecnico'::app_role)
    AND EXISTS (SELECT 1 FROM public.trabalhos t WHERE t.cliente_id = clientes.id AND t.tecnico_id = auth.uid())
  );

-- Vendedor insert must set vendedor_id = auth.uid()
DROP POLICY IF EXISTS "Vendedores can insert clientes" ON public.clientes;
CREATE POLICY "Vendedores can insert clientes"
  ON public.clientes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'vendedor'::app_role) AND vendedor_id = auth.uid());

-- Vendedor can update own clientes
CREATE POLICY "Vendedores can update own clientes"
  ON public.clientes FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'vendedor'::app_role) AND vendedor_id = auth.uid());
