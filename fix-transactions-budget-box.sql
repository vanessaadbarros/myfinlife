-- =====================================================
-- SCRIPT: Adicionar campo budget_box_id nas transações
-- =====================================================
-- Este script adiciona o campo budget_box_id na tabela transactions
-- para vincular transações às caixas de planejamento financeiro

-- 1. Adicionar coluna budget_box_id na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN budget_box_id uuid REFERENCES public.budget_boxes(id) ON DELETE SET NULL;

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN public.transactions.budget_box_id IS 'ID da caixa de planejamento financeiro vinculada à transação';

-- 3. Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_transactions_budget_box_id 
ON public.transactions(budget_box_id);

-- 4. Criar índice composto para consultas por usuário e caixa
CREATE INDEX IF NOT EXISTS idx_transactions_user_budget_box 
ON public.transactions(user_id, budget_box_id);

-- 5. Criar índice composto para consultas por data e caixa
CREATE INDEX IF NOT EXISTS idx_transactions_date_budget_box 
ON public.transactions(date, budget_box_id);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Verificar se a coluna foi criada corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
    AND table_schema = 'public'
    AND column_name = 'budget_box_id';

-- Verificar se os índices foram criados
SELECT 
    indexname, 
    tablename, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'transactions' 
    AND indexname LIKE '%budget_box%';

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================
-- As políticas RLS existentes já cobrem o campo budget_box_id
-- pois ele é uma coluna da tabela transactions

-- =====================================================
-- MIGRAÇÃO DE DADOS (OPCIONAL)
-- =====================================================
-- Se você quiser vincular transações existentes a caixas baseado em categorias:
-- 
-- UPDATE public.transactions 
-- SET budget_box_id = (
--     SELECT bb.id 
--     FROM public.budget_boxes bb 
--     WHERE bb.user_id = transactions.user_id 
--     AND bb.name = 'Custos Fixos' -- ou lógica baseada na categoria
-- )
-- WHERE budget_box_id IS NULL;

-- =====================================================
-- FUNCIONALIDADES DISPONÍVEIS APÓS ESTA MIGRAÇÃO
-- =====================================================
-- 1. Vincular transações a caixas de planejamento
-- 2. Calcular gastos por caixa por mês
-- 3. Acompanhar progresso do orçamento por caixa
-- 4. Gerar relatórios de gastos por categoria de planejamento
-- 5. Alertas quando gastos excedem limites da caixa

-- =====================================================
-- EXEMPLO DE CONSULTAS ÚTEIS
-- =====================================================

-- Gastos por caixa no mês atual:
-- SELECT 
--     bb.name as caixa,
--     bb.color,
--     SUM(t.amount) as total_gasto,
--     bb.percentage * (SELECT monthly_income FROM users WHERE id = t.user_id) / 100 as limite_caixa
-- FROM transactions t
-- JOIN budget_boxes bb ON t.budget_box_id = bb.id
-- WHERE t.user_id = 'user_id_here'
--     AND t.type = 'expense'
--     AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
-- GROUP BY bb.id, bb.name, bb.color, bb.percentage;

-- Progresso das caixas (gasto vs limite):
-- SELECT 
--     bb.name,
--     bb.color,
--     COALESCE(SUM(t.amount), 0) as gasto_atual,
--     bb.percentage * ui.monthly_income / 100 as limite_caixa,
--     ROUND((COALESCE(SUM(t.amount), 0) / (bb.percentage * ui.monthly_income / 100)) * 100, 2) as percentual_usado
-- FROM budget_boxes bb
-- LEFT JOIN transactions t ON bb.id = t.budget_box_id 
--     AND t.type = 'expense'
--     AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
-- LEFT JOIN users ui ON bb.user_id = ui.id
-- WHERE bb.user_id = 'user_id_here'
-- GROUP BY bb.id, bb.name, bb.color, bb.percentage, ui.monthly_income;
