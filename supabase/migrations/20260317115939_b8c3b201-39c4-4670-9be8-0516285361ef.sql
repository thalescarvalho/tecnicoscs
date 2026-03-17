
-- Add tecnico_id to avaliacoes for tracking evaluations per technician
ALTER TABLE public.avaliacoes ADD COLUMN tecnico_id uuid REFERENCES auth.users(id);

-- Backfill existing avaliacoes with tecnico_id from trabalhos
UPDATE public.avaliacoes a
SET tecnico_id = t.tecnico_id
FROM public.trabalhos t
WHERE a.trabalho_id = t.id AND a.tecnico_id IS NULL;

-- Allow tecnicos to view their own avaliacoes
CREATE POLICY "Tecnicos can view own avaliacoes"
ON public.avaliacoes
FOR SELECT
TO authenticated
USING (auth.uid() = tecnico_id);
