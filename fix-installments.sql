-- =====================================================
-- SCRIPT: Sistema de Despesas Parceladas
-- =====================================================
-- Este script cria a estrutura completa para gerenciar despesas parceladas
-- que influenciam o orçamento dos próximos meses

-- =====================================================
-- 1. CRIAR TABELA DE GRUPOS DE PARCELAMENTO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.installment_groups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  total_installments integer NOT NULL CHECK (total_installments > 0 AND total_installments <= 120),
  installment_amount numeric NOT NULL CHECK (installment_amount > 0),
  start_date date NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  budget_box_id uuid REFERENCES public.budget_boxes(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Comentários da tabela
COMMENT ON TABLE public.installment_groups IS 'Grupos de parcelamento para controlar despesas divididas em múltiplas parcelas';
COMMENT ON COLUMN public.installment_groups.description IS 'Descrição da compra parcelada';
COMMENT ON COLUMN public.installment_groups.total_amount IS 'Valor total da compra';
COMMENT ON COLUMN public.installment_groups.total_installments IS 'Número total de parcelas (máximo 120 = 10 anos)';
COMMENT ON COLUMN public.installment_groups.installment_amount IS 'Valor de cada parcela';
COMMENT ON COLUMN public.installment_groups.start_date IS 'Data da primeira parcela';
COMMENT ON COLUMN public.installment_groups.status IS 'Status: active (em andamento), completed (pago), cancelled (cancelado)';

-- =====================================================
-- 2. ADICIONAR CAMPOS DE PARCELAMENTO NAS TRANSAÇÕES
-- =====================================================

-- Adicionar installment_group_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
            AND table_schema = 'public' 
            AND column_name = 'installment_group_id'
    ) THEN
        ALTER TABLE public.transactions 
        ADD COLUMN installment_group_id uuid REFERENCES public.installment_groups(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Coluna installment_group_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna installment_group_id já existe.';
    END IF;
END $$;

-- Adicionar installment_number
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
            AND table_schema = 'public' 
            AND column_name = 'installment_number'
    ) THEN
        ALTER TABLE public.transactions 
        ADD COLUMN installment_number integer CHECK (installment_number > 0);
        
        RAISE NOTICE 'Coluna installment_number adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna installment_number já existe.';
    END IF;
END $$;

-- Adicionar total_installments
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
            AND table_schema = 'public' 
            AND column_name = 'total_installments'
    ) THEN
        ALTER TABLE public.transactions 
        ADD COLUMN total_installments integer CHECK (total_installments > 0);
        
        RAISE NOTICE 'Coluna total_installments adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna total_installments já existe.';
    END IF;
END $$;

-- Comentários das colunas
COMMENT ON COLUMN public.transactions.installment_group_id IS 'ID do grupo de parcelamento ao qual esta transação pertence';
COMMENT ON COLUMN public.transactions.installment_number IS 'Número desta parcela (ex: 1, 2, 3...)';
COMMENT ON COLUMN public.transactions.total_installments IS 'Total de parcelas do grupo (ex: 12)';

-- =====================================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para installment_groups por usuário
CREATE INDEX IF NOT EXISTS idx_installment_groups_user_id 
ON public.installment_groups(user_id);

-- Índice para installment_groups por status
CREATE INDEX IF NOT EXISTS idx_installment_groups_status 
ON public.installment_groups(status);

-- Índice para installment_groups por data
CREATE INDEX IF NOT EXISTS idx_installment_groups_start_date 
ON public.installment_groups(start_date);

-- Índice para transactions por installment_group_id
CREATE INDEX IF NOT EXISTS idx_transactions_installment_group_id 
ON public.transactions(installment_group_id);

-- Índice composto para transactions parceladas
CREATE INDEX IF NOT EXISTS idx_transactions_installment_details 
ON public.transactions(installment_group_id, installment_number);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS na tabela installment_groups
ALTER TABLE public.installment_groups ENABLE ROW LEVEL SECURITY;

-- Política de SELECT
CREATE POLICY "Users can view their own installment groups"
ON public.installment_groups
FOR SELECT
USING (auth.uid() = user_id);

-- Política de INSERT
CREATE POLICY "Users can create their own installment groups"
ON public.installment_groups
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política de UPDATE
CREATE POLICY "Users can update their own installment groups"
ON public.installment_groups
FOR UPDATE
USING (auth.uid() = user_id);

-- Política de DELETE
CREATE POLICY "Users can delete their own installment groups"
ON public.installment_groups
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 5. FUNÇÃO PARA CRIAR PARCELAMENTO AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION create_installment_transactions(
  p_user_id uuid,
  p_description text,
  p_total_amount numeric,
  p_total_installments integer,
  p_start_date date,
  p_category_id uuid DEFAULT NULL,
  p_budget_box_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_id uuid;
  v_installment_amount numeric;
  v_current_date date;
  v_i integer;
BEGIN
  -- Calcular valor de cada parcela
  v_installment_amount := ROUND(p_total_amount / p_total_installments, 2);
  
  -- Criar grupo de parcelamento
  INSERT INTO public.installment_groups (
    user_id,
    description,
    total_amount,
    total_installments,
    installment_amount,
    start_date,
    category_id,
    budget_box_id,
    status
  ) VALUES (
    p_user_id,
    p_description,
    p_total_amount,
    p_total_installments,
    v_installment_amount,
    p_start_date,
    p_category_id,
    p_budget_box_id,
    'active'
  ) RETURNING id INTO v_group_id;
  
  -- Criar transações para cada parcela
  FOR v_i IN 1..p_total_installments LOOP
    v_current_date := p_start_date + ((v_i - 1) * INTERVAL '1 month');
    
    -- Ajustar última parcela para cobrir diferenças de arredondamento
    IF v_i = p_total_installments THEN
      v_installment_amount := p_total_amount - (v_installment_amount * (p_total_installments - 1));
    END IF;
    
    INSERT INTO public.transactions (
      user_id,
      amount,
      description,
      category_id,
      budget_box_id,
      date,
      type,
      is_recurring,
      installment_group_id,
      installment_number,
      total_installments
    ) VALUES (
      p_user_id,
      v_installment_amount,
      p_description || ' (parcela ' || v_i || '/' || p_total_installments || ')',
      p_category_id,
      p_budget_box_id,
      v_current_date,
      'expense',
      false,
      v_group_id,
      v_i,
      p_total_installments
    );
  END LOOP;
  
  RETURN v_group_id;
END;
$$;

COMMENT ON FUNCTION create_installment_transactions IS 
'Cria um grupo de parcelamento e todas as transações de parcelas automaticamente';

-- =====================================================
-- 6. FUNÇÃO PARA CANCELAR PARCELAMENTO
-- =====================================================

CREATE OR REPLACE FUNCTION cancel_installment_group(
  p_group_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o grupo pertence ao usuário
  IF NOT EXISTS (
    SELECT 1 FROM public.installment_groups 
    WHERE id = p_group_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Grupo de parcelamento não encontrado';
  END IF;
  
  -- Marcar grupo como cancelado
  UPDATE public.installment_groups
  SET status = 'cancelled', updated_at = now()
  WHERE id = p_group_id;
  
  -- Deletar apenas parcelas futuras (meses futuros)
  DELETE FROM public.transactions
  WHERE installment_group_id = p_group_id
    AND date > CURRENT_DATE;
    
  RAISE NOTICE 'Parcelamento cancelado. Parcelas futuras removidas.';
END;
$$;

COMMENT ON FUNCTION cancel_installment_group IS 
'Cancela um parcelamento, removendo apenas parcelas futuras e mantendo as já pagas';

-- =====================================================
-- 7. FUNÇÃO PARA ATUALIZAR TODAS AS PARCELAS
-- =====================================================

CREATE OR REPLACE FUNCTION update_all_installments(
  p_group_id uuid,
  p_user_id uuid,
  p_category_id uuid DEFAULT NULL,
  p_budget_box_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o grupo pertence ao usuário
  IF NOT EXISTS (
    SELECT 1 FROM public.installment_groups 
    WHERE id = p_group_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Grupo de parcelamento não encontrado';
  END IF;
  
  -- Atualizar grupo
  UPDATE public.installment_groups
  SET 
    category_id = COALESCE(p_category_id, category_id),
    budget_box_id = COALESCE(p_budget_box_id, budget_box_id),
    updated_at = now()
  WHERE id = p_group_id;
  
  -- Atualizar todas as transações do grupo
  UPDATE public.transactions
  SET 
    category_id = COALESCE(p_category_id, category_id),
    budget_box_id = COALESCE(p_budget_box_id, budget_box_id)
  WHERE installment_group_id = p_group_id;
    
  RAISE NOTICE 'Todas as parcelas atualizadas com sucesso!';
END;
$$;

COMMENT ON FUNCTION update_all_installments IS 
'Atualiza categoria e/ou caixa de todas as parcelas de um parcelamento';

-- =====================================================
-- 8. VERIFICAÇÃO
-- =====================================================

-- Verificar se a tabela foi criada
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'installment_groups' AND table_schema = 'public'
        ) THEN '✅ Tabela installment_groups criada'
        ELSE '❌ Tabela installment_groups não existe'
    END as status_tabela;

-- Verificar colunas nas transações
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'transactions' 
    AND table_schema = 'public' 
    AND column_name IN ('installment_group_id', 'installment_number', 'total_installments')
ORDER BY column_name;

-- Verificar índices
SELECT indexname, tablename
FROM pg_indexes 
WHERE tablename IN ('installment_groups', 'transactions')
    AND indexname LIKE '%installment%'
ORDER BY tablename, indexname;

-- Verificar funções criadas
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc
WHERE proname LIKE '%installment%'
ORDER BY proname;

-- =====================================================
-- 9. EXEMPLOS DE USO
-- =====================================================

-- Exemplo 1: Criar parcelamento de notebook (12x R$ 250)
-- SELECT create_installment_transactions(
--   'user_id_here'::uuid,
--   'Notebook Dell',
--   3000.00,
--   12,
--   '2025-02-01'::date,
--   'category_id_here'::uuid,
--   'budget_box_id_here'::uuid
-- );

-- Exemplo 2: Cancelar parcelamento
-- SELECT cancel_installment_group(
--   'group_id_here'::uuid,
--   'user_id_here'::uuid
-- );

-- Exemplo 3: Atualizar categoria de todas as parcelas
-- SELECT update_all_installments(
--   'group_id_here'::uuid,
--   'user_id_here'::uuid,
--   'new_category_id'::uuid,
--   NULL
-- );

-- =====================================================
-- MIGRAÇÃO COMPLETA!
-- =====================================================
