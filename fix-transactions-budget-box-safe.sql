-- =====================================================
-- SCRIPT SEGURO: Adicionar campo budget_box_id nas transações
-- =====================================================
-- Este script verifica se a coluna já existe antes de tentar criá-la
-- Pode ser executado múltiplas vezes sem erro

-- 1. Verificar se a coluna budget_box_id já existe
DO $$ 
BEGIN
    -- Adicionar coluna budget_box_id apenas se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
            AND table_schema = 'public' 
            AND column_name = 'budget_box_id'
    ) THEN
        -- Adicionar coluna budget_box_id na tabela transactions
        ALTER TABLE public.transactions 
        ADD COLUMN budget_box_id uuid REFERENCES public.budget_boxes(id) ON DELETE SET NULL;
        
        -- Adicionar comentário explicativo
        COMMENT ON COLUMN public.transactions.budget_box_id IS 'ID da caixa de planejamento financeiro vinculada à transação';
        
        RAISE NOTICE 'Coluna budget_box_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna budget_box_id já existe. Pulando criação...';
    END IF;
END $$;

-- 2. Criar índices apenas se não existirem
CREATE INDEX IF NOT EXISTS idx_transactions_budget_box_id 
ON public.transactions(budget_box_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_budget_box 
ON public.transactions(user_id, budget_box_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date_budget_box 
ON public.transactions(date, budget_box_id);

-- 3. Verificação final
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'transactions' 
                AND table_schema = 'public' 
                AND column_name = 'budget_box_id'
        ) THEN '✅ Coluna budget_box_id existe'
        ELSE '❌ Coluna budget_box_id não existe'
    END as status_coluna;

-- 4. Verificar índices criados
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Índices criados: ' || string_agg(indexname, ', ')
        ELSE '❌ Nenhum índice encontrado'
    END as status_indices
FROM pg_indexes 
WHERE tablename = 'transactions' 
    AND indexname LIKE '%budget_box%';

-- =====================================================
-- SCRIPT COMPLETO - PODE SER EXECUTADO MÚLTIPLAS VEZES
-- =====================================================
