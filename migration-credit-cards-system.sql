-- ============================================================================
-- MIGRATION: Sistema Completo de Cartões de Crédito e Contas Bancárias
-- Versão: 1.0
-- Data: 2024
-- Descrição: Adiciona suporte completo para cartões de crédito, faturas,
--            transferências entre contas e métodos de pagamento
-- ============================================================================

-- ============================================================================
-- 1. ATUALIZAR TABELA: bank_accounts
-- ============================================================================

-- Adicionar novos campos para melhor identificação e categorização
DO $$ 
BEGIN
  -- Adicionar account_type se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bank_accounts' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE bank_accounts 
    ADD COLUMN account_type TEXT DEFAULT 'checking';
    
    COMMENT ON COLUMN bank_accounts.account_type IS 
    'Tipo de conta: checking (corrente), savings (poupança), investment (investimento)';
  END IF;

  -- Adicionar color se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bank_accounts' AND column_name = 'color'
  ) THEN
    ALTER TABLE bank_accounts 
    ADD COLUMN color TEXT DEFAULT '#6366f1';
    
    COMMENT ON COLUMN bank_accounts.color IS 
    'Cor para identificação visual da conta na interface';
  END IF;

  -- Adicionar icon se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bank_accounts' AND column_name = 'icon'
  ) THEN
    ALTER TABLE bank_accounts 
    ADD COLUMN icon TEXT DEFAULT '🏦';
    
    COMMENT ON COLUMN bank_accounts.icon IS 
    'Ícone emoji para identificação visual da conta';
  END IF;
END $$;

-- ============================================================================
-- 2. CRIAR TABELA: credit_cards
-- ============================================================================

CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  card_name TEXT NOT NULL,
  last_four_digits TEXT,
  card_network TEXT, -- 'visa', 'mastercard', 'elo', 'amex', etc.
  credit_limit NUMERIC DEFAULT 0,
  closing_day INTEGER CHECK (closing_day BETWEEN 1 AND 31),
  due_day INTEGER CHECK (due_day BETWEEN 1 AND 31),
  is_active BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#8b5cf6',
  icon TEXT DEFAULT '💳',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_bank_account_id ON credit_cards(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_is_active ON credit_cards(is_active);

-- Comentários
COMMENT ON TABLE credit_cards IS 'Cartões de crédito dos usuários';
COMMENT ON COLUMN credit_cards.bank_account_id IS 'Conta bancária onde a fatura é paga';
COMMENT ON COLUMN credit_cards.closing_day IS 'Dia do mês em que a fatura fecha';
COMMENT ON COLUMN credit_cards.due_day IS 'Dia do mês em que a fatura vence';
COMMENT ON COLUMN credit_cards.credit_limit IS 'Limite total do cartão';

-- ============================================================================
-- 3. CRIAR TABELA: credit_card_invoices
-- ============================================================================

CREATE TABLE IF NOT EXISTS credit_card_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credit_card_id UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
  reference_month DATE NOT NULL, -- Primeiro dia do mês de referência
  closing_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open', -- 'open', 'closed', 'paid', 'overdue', 'partial'
  payment_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Garantir uma fatura por cartão por mês
  UNIQUE(credit_card_id, reference_month)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON credit_card_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_card_id ON credit_card_invoices(credit_card_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON credit_card_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON credit_card_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_reference_month ON credit_card_invoices(reference_month);

-- Comentários
COMMENT ON TABLE credit_card_invoices IS 'Faturas mensais dos cartões de crédito';
COMMENT ON COLUMN credit_card_invoices.reference_month IS 'Mês de referência da fatura (sempre dia 1)';
COMMENT ON COLUMN credit_card_invoices.status IS 'Status: open (aberta), closed (fechada), paid (paga), overdue (atrasada), partial (paga parcialmente)';

-- ============================================================================
-- 4. ATUALIZAR TABELA: transactions
-- ============================================================================

DO $$ 
BEGIN
  -- Adicionar credit_card_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'credit_card_id'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_transactions_credit_card_id 
    ON transactions(credit_card_id);
  END IF;

  -- Adicionar payment_method se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN payment_method TEXT DEFAULT 'cash';
    
    COMMENT ON COLUMN transactions.payment_method IS 
    'Método de pagamento: cash, debit, credit, pix, transfer, bank_slip';
  END IF;

  -- Adicionar invoice_date se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'invoice_date'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN invoice_date DATE;
    
    COMMENT ON COLUMN transactions.invoice_date IS 
    'Data da fatura onde a compra no crédito será cobrada';
  END IF;

  -- Adicionar is_transfer se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'is_transfer'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN is_transfer BOOLEAN DEFAULT false;
    
    CREATE INDEX IF NOT EXISTS idx_transactions_is_transfer 
    ON transactions(is_transfer);
  END IF;

  -- Adicionar transfer_to_account_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'transfer_to_account_id'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN transfer_to_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL;
    
    COMMENT ON COLUMN transactions.transfer_to_account_id IS 
    'Conta destino em caso de transferência';
  END IF;

  -- Adicionar linked_transaction_id se não existir (para vincular transferências)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'linked_transaction_id'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN linked_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
    
    COMMENT ON COLUMN transactions.linked_transaction_id IS 
    'ID da transação vinculada (ex: outra parte de uma transferência)';
  END IF;

  -- Adicionar invoice_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'invoice_id'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN invoice_id UUID REFERENCES credit_card_invoices(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_transactions_invoice_id 
    ON transactions(invoice_id);
    
    COMMENT ON COLUMN transactions.invoice_id IS 
    'Fatura do cartão onde a transação está incluída';
  END IF;
END $$;

-- ============================================================================
-- 5. ATUALIZAR TABELA: recurring_transactions
-- ============================================================================

DO $$ 
BEGIN
  -- Adicionar credit_card_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recurring_transactions' AND column_name = 'credit_card_id'
  ) THEN
    ALTER TABLE recurring_transactions 
    ADD COLUMN credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL;
  END IF;

  -- Adicionar payment_method se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recurring_transactions' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE recurring_transactions 
    ADD COLUMN payment_method TEXT DEFAULT 'cash';
  END IF;

  -- Adicionar account_id se não estiver referenciado corretamente
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recurring_transactions' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE recurring_transactions 
    ADD COLUMN account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_invoices ENABLE ROW LEVEL SECURITY;

-- Políticas para credit_cards
DROP POLICY IF EXISTS "Users can view their own credit cards" ON credit_cards;
CREATE POLICY "Users can view their own credit cards"
  ON credit_cards FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own credit cards" ON credit_cards;
CREATE POLICY "Users can insert their own credit cards"
  ON credit_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own credit cards" ON credit_cards;
CREATE POLICY "Users can update their own credit cards"
  ON credit_cards FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own credit cards" ON credit_cards;
CREATE POLICY "Users can delete their own credit cards"
  ON credit_cards FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para credit_card_invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON credit_card_invoices;
CREATE POLICY "Users can view their own invoices"
  ON credit_card_invoices FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own invoices" ON credit_card_invoices;
CREATE POLICY "Users can insert their own invoices"
  ON credit_card_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own invoices" ON credit_card_invoices;
CREATE POLICY "Users can update their own invoices"
  ON credit_card_invoices FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own invoices" ON credit_card_invoices;
CREATE POLICY "Users can delete their own invoices"
  ON credit_card_invoices FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para calcular o total de uma fatura
CREATE OR REPLACE FUNCTION calculate_invoice_total(invoice_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total
  FROM transactions
  WHERE invoice_id = invoice_id_param
    AND payment_method = 'credit';
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular data da próxima fatura
CREATE OR REPLACE FUNCTION calculate_next_invoice_date(
  card_id_param UUID,
  reference_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  reference_month DATE,
  closing_date DATE,
  due_date DATE
) AS $$
DECLARE
  card_record RECORD;
  current_month DATE;
  next_month DATE;
BEGIN
  -- Buscar informações do cartão
  SELECT closing_day, due_day
  INTO card_record
  FROM credit_cards
  WHERE id = card_id_param;

  -- Calcular mês de referência
  current_month := date_trunc('month', reference_date);
  
  -- Se já passou do fechamento, próxima fatura é mês seguinte
  IF EXTRACT(DAY FROM reference_date) >= card_record.closing_day THEN
    next_month := current_month + interval '1 month';
  ELSE
    next_month := current_month;
  END IF;

  RETURN QUERY SELECT
    next_month::DATE,
    (next_month + (card_record.closing_day - 1) * interval '1 day')::DATE,
    (next_month + (card_record.due_day - 1) * interval '1 day')::DATE;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar status de faturas vencidas
CREATE OR REPLACE FUNCTION update_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE credit_card_invoices
  SET status = 'overdue',
      updated_at = NOW()
  WHERE status IN ('closed', 'open')
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- Trigger para atualizar updated_at em credit_cards
CREATE OR REPLACE FUNCTION update_credit_card_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_credit_cards_timestamp ON credit_cards;
CREATE TRIGGER update_credit_cards_timestamp
  BEFORE UPDATE ON credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_card_timestamp();

-- Trigger para atualizar updated_at em credit_card_invoices
DROP TRIGGER IF EXISTS update_invoices_timestamp ON credit_card_invoices;
CREATE TRIGGER update_invoices_timestamp
  BEFORE UPDATE ON credit_card_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_card_timestamp();

-- ============================================================================
-- 9. VIEWS ÚTEIS
-- ============================================================================

-- View: Resumo de cartões com limite disponível
CREATE OR REPLACE VIEW credit_cards_summary AS
SELECT 
  cc.id,
  cc.user_id,
  cc.card_name,
  cc.last_four_digits,
  cc.credit_limit,
  cc.is_active,
  COALESCE(current_invoice.total_amount, 0) as current_invoice_amount,
  COALESCE(next_invoice.total_amount, 0) as next_invoice_amount,
  cc.credit_limit - COALESCE(current_invoice.total_amount, 0) as available_limit,
  current_invoice.due_date as next_due_date,
  ba.bank_name as payment_account_name
FROM credit_cards cc
LEFT JOIN bank_accounts ba ON cc.bank_account_id = ba.id
LEFT JOIN LATERAL (
  SELECT total_amount, due_date
  FROM credit_card_invoices
  WHERE credit_card_id = cc.id
    AND status IN ('open', 'closed')
  ORDER BY reference_month DESC
  LIMIT 1
) current_invoice ON true
LEFT JOIN LATERAL (
  SELECT SUM(t.amount) as total_amount
  FROM transactions t
  WHERE t.credit_card_id = cc.id
    AND t.payment_method = 'credit'
    AND t.date >= date_trunc('month', CURRENT_DATE + interval '1 month')
    AND t.date < date_trunc('month', CURRENT_DATE + interval '2 months')
) next_invoice ON true;

-- View: Patrimônio consolidado do usuário
CREATE OR REPLACE VIEW user_net_worth AS
SELECT 
  u.id as user_id,
  COALESCE(accounts.total_balance, 0) as total_in_accounts,
  COALESCE(invoices.total_pending, 0) as total_pending_invoices,
  COALESCE(accounts.total_balance, 0) - COALESCE(invoices.total_pending, 0) as net_worth
FROM users u
LEFT JOIN (
  SELECT 
    user_id,
    SUM(balance) as total_balance
  FROM bank_accounts
  WHERE is_active = true
  GROUP BY user_id
) accounts ON u.id = accounts.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(total_amount - paid_amount) as total_pending
  FROM credit_card_invoices
  WHERE status IN ('open', 'closed', 'overdue')
  GROUP BY user_id
) invoices ON u.id = invoices.user_id;

-- ============================================================================
-- 10. DADOS DE EXEMPLO (OPCIONAL - COMENTADO)
-- ============================================================================

/*
-- Exemplo de cartão de crédito
INSERT INTO credit_cards (user_id, card_name, last_four_digits, credit_limit, closing_day, due_day, color, icon)
VALUES (
  'seu-user-id-aqui',
  'Nubank Platinum',
  '1234',
  8000.00,
  10,
  15,
  '#8b5cf6',
  '💳'
);
*/

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Mensagem de conclusão
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration concluída com sucesso!';
  RAISE NOTICE '📦 Tabelas criadas: credit_cards, credit_card_invoices';
  RAISE NOTICE '🔄 Tabelas atualizadas: transactions, recurring_transactions, bank_accounts';
  RAISE NOTICE '🔒 RLS configurado para todas as novas tabelas';
  RAISE NOTICE '⚙️  Funções e triggers criados';
  RAISE NOTICE '📊 Views criadas: credit_cards_summary, user_net_worth';
END $$;

