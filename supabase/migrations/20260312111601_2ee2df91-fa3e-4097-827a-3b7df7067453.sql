
-- Create a helper function to check if user is admin or gestor
CREATE OR REPLACE FUNCTION public.is_admin_or_gestor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'gestor')
  )
$$;

-- audit_log
DROP POLICY IF EXISTS "Gestores can delete audit" ON public.audit_log;
CREATE POLICY "Gestores can delete audit" ON public.audit_log FOR DELETE TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Gestores can view audit" ON public.audit_log;
CREATE POLICY "Gestores can view audit" ON public.audit_log FOR SELECT TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

-- avaliacoes
DROP POLICY IF EXISTS "Gestores can delete avaliacoes" ON public.avaliacoes;
CREATE POLICY "Gestores can delete avaliacoes" ON public.avaliacoes FOR DELETE TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Gestores can view avaliacoes" ON public.avaliacoes;
CREATE POLICY "Gestores can view avaliacoes" ON public.avaliacoes FOR SELECT TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

-- clientes
DROP POLICY IF EXISTS "Gestores can insert clientes" ON public.clientes;
CREATE POLICY "Gestores can insert clientes" ON public.clientes FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Gestores can update clientes" ON public.clientes;
CREATE POLICY "Gestores can update clientes" ON public.clientes FOR UPDATE TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Gestores can update clientes vendedor" ON public.clientes;

-- fotos
DROP POLICY IF EXISTS "Gestores can delete fotos" ON public.fotos;
CREATE POLICY "Gestores can delete fotos" ON public.fotos FOR DELETE TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Users can view fotos" ON public.fotos;
CREATE POLICY "Users can view fotos" ON public.fotos FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trabalhos t
    WHERE t.id = fotos.trabalho_id
      AND (t.tecnico_id = auth.uid() OR public.is_admin_or_gestor(auth.uid()))
  ));

-- itens_produzidos
DROP POLICY IF EXISTS "Gestores can delete itens" ON public.itens_produzidos;
CREATE POLICY "Gestores can delete itens" ON public.itens_produzidos FOR DELETE TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Users can view itens" ON public.itens_produzidos;
CREATE POLICY "Users can view itens" ON public.itens_produzidos FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trabalhos t
    WHERE t.id = itens_produzidos.trabalho_id
      AND (t.tecnico_id = auth.uid() OR public.is_admin_or_gestor(auth.uid()))
  ));

-- trabalhos
DROP POLICY IF EXISTS "Gestores can create trabalhos" ON public.trabalhos;
CREATE POLICY "Gestores can create trabalhos" ON public.trabalhos FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Gestores can delete trabalhos" ON public.trabalhos;
CREATE POLICY "Gestores can delete trabalhos" ON public.trabalhos FOR DELETE TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Gestores can update trabalhos" ON public.trabalhos;
CREATE POLICY "Gestores can update trabalhos" ON public.trabalhos FOR UPDATE TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Gestores can view all trabalhos" ON public.trabalhos;
CREATE POLICY "Gestores can view all trabalhos" ON public.trabalhos FOR SELECT TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Gestores can delete roles" ON public.user_roles;
CREATE POLICY "Gestores can delete roles" ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Gestores can manage roles" ON public.user_roles;
CREATE POLICY "Gestores can manage roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Gestores can update roles" ON public.user_roles;
CREATE POLICY "Gestores can update roles" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

DROP POLICY IF EXISTS "Gestores can view all roles" ON public.user_roles;
CREATE POLICY "Gestores can view all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

-- profiles: add delete policy for admin only
CREATE POLICY "Admin can delete profiles" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
