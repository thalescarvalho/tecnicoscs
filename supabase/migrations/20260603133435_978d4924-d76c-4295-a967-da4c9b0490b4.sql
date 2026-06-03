
CREATE OR REPLACE FUNCTION public.can_review_trabalho(_trabalho_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trabalhos
    WHERE id = _trabalho_id AND status = 'CONCLUIDO'
  )
$$;

REVOKE EXECUTE ON FUNCTION public.can_review_trabalho(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_review_trabalho(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can insert avaliacao" ON public.avaliacoes;
DROP POLICY IF EXISTS "Anyone can insert avaliacao for finalizado trabalho" ON public.avaliacoes;
CREATE POLICY "Anyone can insert avaliacao for concluido trabalho"
  ON public.avaliacoes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    public.can_review_trabalho(trabalho_id)
    AND nota BETWEEN 1 AND 5
    AND (comentario IS NULL OR char_length(comentario) <= 1000)
    AND (cliente_nome IS NULL OR char_length(cliente_nome) <= 100)
  );

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and gestores view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()));

CREATE POLICY "Vendedor views tecnico of own trabalho"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'vendedor')
    AND EXISTS (
      SELECT 1 FROM public.trabalhos t
      WHERE t.vendedor_id = auth.uid() AND t.tecnico_id = profiles.user_id
    )
  );

CREATE POLICY "Tecnico views vendedor of own trabalho"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'tecnico')
    AND EXISTS (
      SELECT 1 FROM public.trabalhos t
      WHERE t.tecnico_id = auth.uid() AND t.vendedor_id = profiles.user_id
    )
  );

DROP POLICY IF EXISTS "Gestores can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Gestores can update roles" ON public.user_roles;

CREATE POLICY "Admins/Gestores can insert roles (no self-grant)"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin_or_gestor(auth.uid())
    AND user_id <> auth.uid()
    AND (role <> 'admin' OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admins/Gestores can update roles (no self-elevate)"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.is_admin_or_gestor(auth.uid()) AND user_id <> auth.uid())
  WITH CHECK (
    public.is_admin_or_gestor(auth.uid())
    AND user_id <> auth.uid()
    AND (role <> 'admin' OR public.has_role(auth.uid(), 'admin'))
  );

DROP POLICY IF EXISTS "Auth can upload trabalho photos" ON storage.objects;

CREATE POLICY "Users upload trabalho photos to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'trabalho-fotos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM public.trabalhos t
      WHERE t.id::text = (storage.foldername(name))[2]
        AND (t.tecnico_id = auth.uid() OR t.vendedor_id = auth.uid() OR public.is_admin_or_gestor(auth.uid()))
    )
  );

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_gestor(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_gestor(uuid) TO authenticated;
