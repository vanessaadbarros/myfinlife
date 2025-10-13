-- ============================================================================
-- DEBUG: Verificar Faturas e Transações
-- Execute este script no Supabase SQL Editor para diagnosticar o problema
-- ============================================================================

-- 1. Verificar se as tabelas existem
SELECT 'Verificando existência das tabelas...' as status;

SELECT 
  table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_cards') 
    THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as credit_cards_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_card_invoices') 
    THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as invoices_status
FROM information_schema.tables
WHERE table_schema = 'public'
LIMIT 1;

-- 2. Verificar transações com payment_method = 'credit'
SELECT 'Transações com método crédito:' as status;

SELECT 
  COUNT(*) as total_credit_transactions,
  COUNT(CASE WHEN credit_card_id IS NOT NULL THEN 1 END) as with_card,
  COUNT(CASE WHEN invoice_id IS NOT NULL THEN 1 END) as with_invoice,
  COUNT(CASE WHEN credit_card_id IS NOT NULL AND invoice_id IS NULL THEN 1 END) as card_sem_invoice
FROM transactions
WHERE payment_method = 'credit';

-- 3. Listar transações de outubro/2024 no crédito
SELECT 'Transações de Outubro/2024 no crédito:' as status;

SELECT 
  id,
  description,
  amount,
  date,
  payment_method,
  credit_card_id,
  invoice_id,
  CASE 
    WHEN credit_card_id IS NULL THEN '⚠️ SEM CARTÃO'
    WHEN invoice_id IS NULL THEN '⚠️ SEM FATURA'
    ELSE '✅ OK'
  END as status
FROM transactions
WHERE DATE_TRUNC('month', date) = '2024-10-01'
  AND payment_method = 'credit'
ORDER BY date DESC;

-- 4. Verificar cartões cadastrados
SELECT 'Cartões cadastrados:' as status;

SELECT 
  id,
  card_name,
  closing_day,
  due_day,
  is_active
FROM credit_cards
WHERE is_active = true;

-- 5. Verificar faturas existentes
SELECT 'Faturas existentes:' as status;

SELECT 
  inv.id,
  cc.card_name,
  inv.reference_month,
  inv.total_amount,
  inv.status,
  inv.closing_date,
  inv.due_date
FROM credit_card_invoices inv
JOIN credit_cards cc ON cc.id = inv.credit_card_id
ORDER BY inv.reference_month DESC;

-- 6. Verificar se há transações sem invoice_id que deveriam ter
SELECT 'Transações no crédito SEM invoice_id:' as status;

SELECT 
  t.id,
  t.description,
  t.amount,
  t.date,
  cc.card_name,
  cc.closing_day,
  CASE 
    WHEN EXTRACT(DAY FROM t.date) <= cc.closing_day 
    THEN DATE_TRUNC('month', t.date)::date
    ELSE (DATE_TRUNC('month', t.date) + INTERVAL '1 month')::date
  END as should_be_in_invoice
FROM transactions t
JOIN credit_cards cc ON cc.id = t.credit_card_id
WHERE t.payment_method = 'credit'
  AND t.invoice_id IS NULL
ORDER BY t.date DESC;

-- 7. AÇÃO: Contar quantas transações precisam ser vinculadas
SELECT 
  COUNT(*) as transacoes_para_vincular,
  SUM(amount) as valor_total
FROM transactions
WHERE payment_method = 'credit'
  AND credit_card_id IS NOT NULL
  AND invoice_id IS NULL;

