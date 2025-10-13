-- =====================================================
-- SCRIPT SEGURO: Adicionar Colunas Faltantes
-- =====================================================
-- Este script verifica e adiciona apenas as colunas que não existem
-- Pode ser executado múltiplas vezes sem erro

-- =====================================================
-- 1. VERIFICAR E ADICIONAR goal_id
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
            AND table_schema = 'public' 
            AND column_name = 'goal_id'
    ) THEN
        ALTER TABLE public.transactions 
        ADD COLUMN goal_id uuid REFERENCES public.goals(id) ON DELETE SET NULL;
        
        COMMENT ON COLUMN public.transactions.goal_id IS 
        'ID da meta vinculada (para transações de investimento)';
        
        RAISE NOTICE '✅ Coluna goal_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE '⏭️ Coluna goal_id já existe. Pulando...';
    END IF;
END $$;

-- =====================================================
-- 2. VERIFICAR E ATUALIZAR CONSTRAINT DO TIPO
-- =====================================================

DO $$ 
BEGIN
    -- Remover constraint antiga se existir
    ALTER TABLE public.transactions 
    DROP CONSTRAINT IF EXISTS transactions_type_check;
    
    -- Adicionar nova constraint com tipo 'investment'
    ALTER TABLE public.transactions 
    ADD CONSTRAINT transactions_type_check 
    CHECK (type = ANY (ARRAY['income'::text, 'expense'::text, 'investment'::text]));
    
    RAISE NOTICE '✅ Constraint de tipo atualizada com sucesso!';
END $$;

-- =====================================================
-- 3. VERIFICAR E ADICIONAR transaction_id EM goal_contributions
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'goal_contributions' 
            AND table_schema = 'public' 
            AND column_name = 'transaction_id'
    ) THEN
        ALTER TABLE public.goal_contributions 
        ADD COLUMN transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL;
        
        COMMENT ON COLUMN public.goal_contributions.transaction_id IS 
        'ID da transação de investimento vinculada';
        
        RAISE NOTICE '✅ Coluna transaction_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE '⏭️ Coluna transaction_id já existe. Pulando...';
    END IF;
END $$;

-- =====================================================
-- 4. VERIFICAR E ADICIONAR description EM goal_contributions
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'goal_contributions' 
            AND table_schema = 'public' 
            AND column_name = 'description'
    ) THEN
        ALTER TABLE public.goal_contributions 
        ADD COLUMN description text;
        
        COMMENT ON COLUMN public.goal_contributions.description IS 
        'Descrição da contribuição';
        
        RAISE NOTICE '✅ Coluna description adicionada com sucesso!';
    ELSE
        RAISE NOTICE '⏭️ Coluna description já existe. Pulando...';
    END IF;
END $$;

-- =====================================================
-- 5. CRIAR ÍNDICES (SE NÃO EXISTIREM)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_transactions_goal_id 
ON public.transactions(goal_id);

CREATE INDEX IF NOT EXISTS idx_transactions_type 
ON public.transactions(type);

CREATE INDEX IF NOT EXISTS idx_goal_contributions_transaction_id 
ON public.goal_contributions(transaction_id);

-- =====================================================
-- 6. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar colunas criadas
SELECT 
    'transactions.goal_id' as coluna,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'transactions' 
                AND table_schema = 'public' 
                AND column_name = 'goal_id'
        ) THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status
UNION ALL
SELECT 
    'goal_contributions.transaction_id' as coluna,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'goal_contributions' 
                AND table_schema = 'public' 
                AND column_name = 'transaction_id'
        ) THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status
UNION ALL
SELECT 
    'goal_contributions.description' as coluna,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'goal_contributions' 
                AND table_schema = 'public' 
                AND column_name = 'description'
        ) THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status;

-- Verificar constraint de tipo
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'transactions_type_check';

-- Verificar índices
SELECT 
    indexname, 
    tablename
FROM pg_indexes 
WHERE tablename IN ('transactions', 'goal_contributions')
    AND (indexname LIKE '%goal%' OR indexname LIKE '%type%')
ORDER BY tablename, indexname;

-- =====================================================
-- SCRIPT COMPLETO E SEGURO!
-- =====================================================
-- ✅ Pode ser executado múltiplas vezes
-- ✅ Verifica existência antes de criar
-- ✅ Não causa erros se já existir
-- ✅ Adiciona apenas o que está faltando
-- =====================================================
