
ALTER TABLE public.trabalhos
  ADD COLUMN tem_custos boolean NOT NULL DEFAULT false,
  ADD COLUMN cidade_trabalho text,
  ADD COLUMN custo_translado_cidade numeric DEFAULT 0,
  ADD COLUMN custo_translado_cliente numeric DEFAULT 0,
  ADD COLUMN custo_hospedagem numeric DEFAULT 0,
  ADD COLUMN custo_alimentacao numeric DEFAULT 0;
