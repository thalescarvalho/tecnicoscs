CREATE POLICY "Gestores can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Gestores can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Gestores can update clientes vendedor" ON public.clientes FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'gestor'::app_role));