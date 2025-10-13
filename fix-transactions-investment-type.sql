-- =====================================================
-- SCRIPT: Adicionar Tipo 'investment' nas Transações
-- =====================================================
-- Este script adiciona o tipo 'investment' para transações que:
-- - Consomem o orçamento mensal das caixas
-- - NÃO diminuem o saldo da carteira (dinheiro continua com você)
-- - São vinculadas a metas financeiras

-- =====================================================
-- 1. ATUALIZAR CONSTRAINT DO TIPO DE TRANSAÇÃO
-- =====================================================

-- Remover constraint antiga
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Adicionar nova constraint com tipo 'investment'
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type = ANY (ARRAY['income'::text, 'expense'::text, 'investment'::text]));

-- =====================================================
-- 2. ADICIONAR CAMPO goal_id NAS TRANSAÇÕES
-- =====================================================

-- Adicionar coluna goal_id para vincular transações de investimento às metas
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
        
        RAISE NOTICE 'Coluna goal_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna goal_id já existe. Pulando criação...';
    END IF;
END $$;

-- =====================================================
-- 3. ADICIONAR CAMPO transaction_id NAS CONTRIBUIÇÕES
-- =====================================================

-- Adicionar coluna transaction_id para vincular contribuições às transações
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
        
        RAISE NOTICE 'Coluna transaction_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna transaction_id já existe. Pulando criação...';
    END IF;
END $$;

-- =====================================================
-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para goal_id nas transações
CREATE INDEX IF NOT EXISTS idx_transactions_goal_id 
ON public.transactions(goal_id);

-- Índice para tipo de transação (facilita filtros)
CREATE INDEX IF NOT EXISTS idx_transactions_type 
ON public.transactions(type);

-- Índice composto para transações de investimento por usuário
CREATE INDEX IF NOT EXISTS idx_transactions_user_type 
ON public.transactions(user_id, type);

-- Índice para transaction_id nas contribuições
CREATE INDEX IF NOT EXISTS idx_goal_contributions_transaction_id 
ON public.goal_contributions(transaction_id);

-- =====================================================
-- 5. ADICIONAR COMENTÁRIOS EXPLICATIVOS
-- =====================================================

COMMENT ON COLUMN public.transactions.goal_id IS 
'ID da meta vinculada (para transações de investimento)';

COMMENT ON COLUMN public.transactions.type IS 
'Tipo de transação:
- income: Aumenta o saldo da carteira
- expense: Diminui o saldo da carteira E consome orçamento
- investment: Consome orçamento mas NÃO diminui saldo da carteira';

COMMENT ON COLUMN public.goal_contributions.transaction_id IS 
'ID da transação de investimento vinculada (quando criada automaticamente)';

-- =====================================================
-- 6. VERIFICAÇÃO
-- =====================================================

-- Verificar se as colunas foram criadas
SELECT 
    'transactions.goal_id' as coluna,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
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
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'goal_contributions' 
                AND table_schema = 'public' 
                AND column_name = 'transaction_id'
        ) THEN '✅ Existe'
        ELSE '❌ Não existe'
    END as status;

-- Verificar constraint do tipo
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'transactions_type_check';

-- Verificar índices criados
SELECT 
    indexname, 
    tablename
FROM pg_indexes 
WHERE tablename IN ('transactions', 'goal_contributions')
    AND (indexname LIKE '%goal%' OR indexname LIKE '%type%')
ORDER BY tablename, indexname;

-- =====================================================
-- 7. EXEMPLOS DE CONSULTAS ÚTEIS
-- =====================================================

-- Exemplo 1: Buscar todas as transações de investimento
-- SELECT * FROM transactions WHERE type = 'investment';

-- Exemplo 2: Buscar transações de investimento vinculadas a uma meta
-- SELECT t.*, g.name as goal_name
-- FROM transactions t
-- JOIN goals g ON t.goal_id = g.id
-- WHERE t.type = 'investment'
-- ORDER BY t.date DESC;

-- Exemplo 3: Buscar contribuições com suas transações vinculadas
-- SELECT 
--     gc.*,
--     t.amount as transaction_amount,
--     t.date as transaction_date
-- FROM goal_contributions gc
-- LEFT JOIN transactions t ON gc.transaction_id = t.id
-- WHERE gc.goal_id = 'goal_id_here';

-- Exemplo 4: Calcular saldo da carteira vs orçamento consumido
-- SELECT 
--     SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as receitas,
--     SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as despesas,
--     SUM(CASE WHEN type = 'investment' THEN amount ELSE 0 END) as investimentos,
--     SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
--     SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as saldo_carteira,
--     SUM(CASE WHEN type = 'expense' OR type = 'investment' THEN amount ELSE 0 END) as orcamento_consumido
-- FROM transactions
-- WHERE user_id = 'user_id_here'
--     AND DATE_TRUNC('month', date::date) = DATE_TRUNC('month', CURRENT_DATE);

-- =====================================================
-- MIGRAÇÃO COMPLETA!
-- =====================================================
-- Após executar este script:
-- ✅ Transações podem ser do tipo 'investment'
-- ✅ Transações de investimento podem ser vinculadas a metas
-- ✅ Contribuições podem ser vinculadas a transações
-- ✅ Índices otimizados para consultas rápidas
-- ✅ Sistema pronto para rastreamento completo do fluxo de dinheiro
