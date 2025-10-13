-- ============================================================================
-- UPDATE: Adicionar Métodos de Pagamento aos Parcelamentos
-- Descrição: Atualiza a função create_installment_transactions para suportar
--            métodos de pagamento, contas bancárias e cartões de crédito
-- ============================================================================

-- Dropar função antiga
DROP FUNCTION IF EXISTS create_installment_transactions(UUID, TEXT, NUMERIC, INTEGER, DATE, UUID, UUID);

-- Criar nova função com parâmetros adicionais
CREATE OR REPLACE FUNCTION create_installment_transactions(
  p_user_id UUID,
  p_description TEXT,
  p_total_amount NUMERIC,
  p_total_installments INTEGER,
  p_start_date DATE,
  p_category_id UUID DEFAULT NULL,
  p_budget_box_id UUID DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'cash',
  p_credit_card_id UUID DEFAULT NULL,
  p_account_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_group_id UUID;
  v_installment_amount NUMERIC;
  v_current_date DATE;
  v_installment_number INTEGER;
BEGIN
  -- Calcular valor de cada parcela
  v_installment_amount := p_total_amount / p_total_installments;
  
  -- Criar grupo de parcelamento
  INSERT INTO installment_groups (
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
  FOR v_installment_number IN 1..p_total_installments LOOP
    -- Calcular data da parcela (adiciona meses)
    v_current_date := p_start_date + ((v_installment_number - 1) * INTERVAL '1 month');
    
    -- Criar transação
    -- Nota: invoice_id será NULL inicialmente, será preenchido pela aplicação
    INSERT INTO transactions (
      user_id,
      description,
      amount,
      date,
      type,
      category_id,
      budget_box_id,
      installment_group_id,
      installment_number,
      total_installments,
      is_recurring,
      payment_method,
      credit_card_id,
      account_id,
      invoice_id
    ) VALUES (
      p_user_id,
      p_description || ' (' || v_installment_number || '/' || p_total_installments || ')',
      v_installment_amount,
      v_current_date,
      'expense',
      p_category_id,
      p_budget_box_id,
      v_group_id,
      v_installment_number,
      p_total_installments,
      false,
      p_payment_method,
      p_credit_card_id,
      p_account_id,
      NULL -- invoice_id será preenchido posteriormente
    );
  END LOOP;
  
  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar comentário
COMMENT ON FUNCTION create_installment_transactions IS 
'Cria um grupo de parcelamento e todas as transações futuras com suporte a métodos de pagamento';

-- ============================================================================
-- Mensagem de Conclusão
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Função create_installment_transactions atualizada com sucesso!';
  RAISE NOTICE '📦 Agora suporta: payment_method, credit_card_id, account_id';
END $$;

