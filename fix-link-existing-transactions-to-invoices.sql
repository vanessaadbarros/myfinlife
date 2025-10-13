-- ============================================================================
-- FIX: Vincular Transações Existentes às Faturas
-- Descrição: Vincula todas as transações de crédito existentes que ainda
--            não têm invoice_id às suas respectivas faturas
-- ============================================================================

-- Função para vincular transações existentes
CREATE OR REPLACE FUNCTION link_existing_credit_transactions()
RETURNS TABLE(
  transactions_updated INTEGER,
  invoices_created INTEGER
) AS $$
DECLARE
  v_transaction RECORD;
  v_card RECORD;
  v_reference_month DATE;
  v_closing_date DATE;
  v_due_date DATE;
  v_invoice_id UUID;
  v_transactions_count INTEGER := 0;
  v_invoices_count INTEGER := 0;
  v_existing_invoices INTEGER := 0;
BEGIN
  -- Para cada transação de crédito sem invoice_id
  FOR v_transaction IN 
    SELECT t.id, t.date, t.credit_card_id, t.user_id, t.amount
    FROM transactions t
    WHERE t.payment_method = 'credit'
      AND t.credit_card_id IS NOT NULL
      AND t.invoice_id IS NULL
  LOOP
    -- Buscar informações do cartão
    SELECT closing_day, due_day, user_id
    INTO v_card
    FROM credit_cards
    WHERE id = v_transaction.credit_card_id;

    IF NOT FOUND THEN
      RAISE NOTICE 'Cartão não encontrado para transação %', v_transaction.id;
      CONTINUE;
    END IF;

    -- Calcular mês de referência da fatura
    IF EXTRACT(DAY FROM v_transaction.date) <= v_card.closing_day THEN
      -- Vai para fatura do mês atual
      v_reference_month := DATE_TRUNC('month', v_transaction.date)::date;
    ELSE
      -- Vai para fatura do próximo mês
      v_reference_month := (DATE_TRUNC('month', v_transaction.date) + INTERVAL '1 month')::date;
    END IF;

    -- Calcular datas de fechamento e vencimento
    v_closing_date := (v_reference_month + (v_card.closing_day - 1) * INTERVAL '1 day')::date;
    v_due_date := (v_reference_month + (v_card.due_day - 1) * INTERVAL '1 day')::date;

    -- Se vencimento antes do fechamento, é no mês seguinte
    IF v_due_date < v_closing_date THEN
      v_due_date := (v_due_date + INTERVAL '1 month')::date;
    END IF;

    -- Buscar ou criar fatura
    SELECT id INTO v_invoice_id
    FROM credit_card_invoices
    WHERE credit_card_id = v_transaction.credit_card_id
      AND reference_month = v_reference_month;

    IF NOT FOUND THEN
      -- Criar nova fatura
      INSERT INTO credit_card_invoices (
        user_id,
        credit_card_id,
        reference_month,
        closing_date,
        due_date,
        total_amount,
        paid_amount,
        status
      ) VALUES (
        v_transaction.user_id,
        v_transaction.credit_card_id,
        v_reference_month,
        v_closing_date,
        v_due_date,
        0,
        0,
        'open'
      ) RETURNING id INTO v_invoice_id;

      v_invoices_count := v_invoices_count + 1;
      RAISE NOTICE 'Fatura criada: % para cartão % (mês %)', 
        v_invoice_id, v_transaction.credit_card_id, v_reference_month;
    ELSE
      v_existing_invoices := v_existing_invoices + 1;
    END IF;

    -- Vincular transação à fatura
    UPDATE transactions
    SET invoice_id = v_invoice_id
    WHERE id = v_transaction.id;

    v_transactions_count := v_transactions_count + 1;
  END LOOP;

  RAISE NOTICE '✅ % transações vinculadas', v_transactions_count;
  RAISE NOTICE '✅ % faturas criadas', v_invoices_count;
  RAISE NOTICE 'ℹ️  % faturas já existiam', v_existing_invoices;

  -- Retornar resultado
  RETURN QUERY SELECT v_transactions_count, v_invoices_count;
END;
$$ LANGUAGE plpgsql;

-- Executar a função
SELECT * FROM link_existing_credit_transactions();

-- Atualizar totais de todas as faturas
DO $$
DECLARE
  v_invoice RECORD;
  v_total NUMERIC;
BEGIN
  FOR v_invoice IN 
    SELECT id FROM credit_card_invoices
  LOOP
    -- Calcular total da fatura
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total
    FROM transactions
    WHERE invoice_id = v_invoice.id
      AND payment_method = 'credit';

    -- Atualizar fatura
    UPDATE credit_card_invoices
    SET total_amount = v_total
    WHERE id = v_invoice.id;

    RAISE NOTICE 'Fatura % atualizada: R$ %', v_invoice.id, v_total;
  END LOOP;

  RAISE NOTICE '✅ Todos os totais das faturas foram recalculados!';
END $$;

-- Verificar resultado final
SELECT 
  cc.card_name,
  inv.reference_month,
  inv.total_amount,
  inv.status,
  COUNT(t.id) as num_transacoes
FROM credit_card_invoices inv
JOIN credit_cards cc ON cc.id = inv.credit_card_id
LEFT JOIN transactions t ON t.invoice_id = inv.id
GROUP BY cc.card_name, inv.reference_month, inv.total_amount, inv.status
ORDER BY inv.reference_month DESC;

-- ============================================================================
-- Mensagem Final
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ CORREÇÃO CONCLUÍDA!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Verifique acima:';
  RAISE NOTICE '   • Quantas transações foram vinculadas';
  RAISE NOTICE '   • Quantas faturas foram criadas';
  RAISE NOTICE '   • Totais de cada fatura';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Recarregue a página "Contas e Cartões" para ver os valores atualizados';
  RAISE NOTICE '';
END $$;

