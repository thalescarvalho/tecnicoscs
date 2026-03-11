CREATE POLICY "Gestores can delete fotos" ON public.fotos FOR DELETE TO authenticated USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Gestores can delete itens" ON public.itens_produzidos FOR DELETE TO authenticated USING (has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Gestores can delete audit" ON public.audit_log FOR DELETE TO authenticated USING (has_role(auth.uid(), 'gestor'::app_role));