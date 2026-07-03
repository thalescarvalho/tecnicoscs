DROP POLICY IF EXISTS "Anyone can insert avaliacao for concluido trabalho" ON public.avaliacoes;
REVOKE EXECUTE ON FUNCTION public.can_review_trabalho(uuid) FROM PUBLIC, anon, authenticated;