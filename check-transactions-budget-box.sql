-- =====================================================
-- SCRIPT DE VERIFICAÇÃO: Status da coluna budget_box_id
-- =====================================================
-- Este script apenas verifica o status atual da implementação

-- 1. Verificar se a coluna budget_box_id existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'transactions' 
                AND table_schema = 'public' 
                AND column_name = 'budget_box_id'
        ) THEN '✅ Coluna budget_box_id EXISTE'
        ELSE '❌ Coluna budget_box_id NÃO EXISTE'
    END as status_coluna;

-- 2. Verificar detalhes da coluna (se existir)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
    AND table_schema = 'public' 
    AND column_name = 'budget_box_id';

-- 3. Verificar índices relacionados
SELECT 
    indexname, 
    tablename, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'transactions' 
    AND indexname LIKE '%budget_box%'
ORDER BY indexname;

-- 4. Verificar foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'transactions'
    AND kcu.column_name = 'budget_box_id';

-- 5. Verificar se há dados na coluna
SELECT 
    COUNT(*) as total_transactions,
    COUNT(budget_box_id) as transactions_with_budget_box,
    COUNT(*) - COUNT(budget_box_id) as transactions_without_budget_box
FROM public.transactions;

-- 6. Resumo do status
SELECT 
    'STATUS GERAL DA IMPLEMENTAÇÃO' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'transactions' 
                AND table_schema = 'public' 
                AND column_name = 'budget_box_id'
        ) THEN 'IMPLEMENTAÇÃO COMPLETA - Pronto para uso!'
        ELSE 'IMPLEMENTAÇÃO INCOMPLETA - Execute o script de migração'
    END as status;
