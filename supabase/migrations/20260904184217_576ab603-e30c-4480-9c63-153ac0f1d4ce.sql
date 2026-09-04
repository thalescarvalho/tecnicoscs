-- Allow vendedores to list active technicians (name only via profiles) so they can suggest a technician
CREATE POLICY "Vendedores can view tecnico profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'vendedor'::app_role)
  AND has_role(profiles.user_id, 'tecnico'::app_role)
);

CREATE POLICY "Vendedores can view tecnico roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'vendedor'::app_role)
  AND role = 'tecnico'::app_role
);