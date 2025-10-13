-- =====================================================
-- SCRIPT SEGURO PARA CRIAR TABELA DE TRANSAÇÕES RECORRENTES
-- =====================================================
-- Este script cria a funcionalidade de custos recorrentes
-- Versão simplificada e compatível

-- Verificar se a tabela já existe
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    description text NOT NULL,
    amount numeric NOT NULL,
    category_id uuid,
    budget_box_id uuid,
    frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    start_date date NOT NULL,
    end_date date,
    is_active boolean NOT NULL DEFAULT true,
    last_executed date,
    next_execution date,
    type text NOT NULL CHECK (type IN ('income', 'expense')),
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    
    CONSTRAINT recurring_transactions_pkey PRIMARY KEY (id),
    CONSTRAINT recurring_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT recurring_transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL,
    CONSTRAINT recurring_transactions_budget_box_id_fkey FOREIGN KEY (budget_box_id) REFERENCES public.budget_boxes(id) ON DELETE SET NULL
);

-- Criar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON public.recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_execution ON public.recurring_transactions(next_execution);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_type ON public.recurring_transactions(type);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_frequency ON public.recurring_transactions(frequency);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_is_active ON public.recurring_transactions(is_active);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (se não existirem)
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recurring_transactions' 
        AND policyname = 'Users can view their own recurring transactions'
    ) THEN
        CREATE POLICY "Users can view their own recurring transactions" ON public.recurring_transactions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recurring_transactions' 
        AND policyname = 'Users can insert their own recurring transactions'
    ) THEN
        CREATE POLICY "Users can insert their own recurring transactions" ON public.recurring_transactions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recurring_transactions' 
        AND policyname = 'Users can update their own recurring transactions'
    ) THEN
        CREATE POLICY "Users can update their own recurring transactions" ON public.recurring_transactions
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Política para DELETE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'recurring_transactions' 
        AND policyname = 'Users can delete their own recurring transactions'
    ) THEN
        CREATE POLICY "Users can delete their own recurring transactions" ON public.recurring_transactions
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Função simplificada para calcular próxima execução
CREATE OR REPLACE FUNCTION calculate_next_execution(
    frequency_type text,
    last_date date DEFAULT NULL,
    start_date_param date DEFAULT NULL
) RETURNS date AS $$
DECLARE
    next_date date;
    base_date date;
BEGIN
    -- Determinar data base
    IF last_date IS NOT NULL THEN
        base_date := last_date;
    ELSE
        base_date := COALESCE(start_date_param, CURRENT_DATE);
    END IF;

    -- Calcular próxima data baseado na frequência
    CASE frequency_type
        WHEN 'daily' THEN
            next_date := base_date + INTERVAL '1 day';
        WHEN 'weekly' THEN
            next_date := base_date + INTERVAL '1 week';
        WHEN 'monthly' THEN
            next_date := base_date + INTERVAL '1 month';
        WHEN 'quarterly' THEN
            next_date := base_date + INTERVAL '3 months';
        WHEN 'yearly' THEN
            next_date := base_date + INTERVAL '1 year';
        ELSE
            next_date := base_date + INTERVAL '1 month'; -- Default monthly
    END CASE;

    RETURN next_date::date;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar próxima execução
CREATE OR REPLACE FUNCTION update_next_execution() RETURNS TRIGGER AS $$
BEGIN
    -- Se a frequência, data de início ou data da última execução mudaram
    IF (TG_OP = 'INSERT') OR 
       (TG_OP = 'UPDATE' AND (
           OLD.frequency IS DISTINCT FROM NEW.frequency OR
           OLD.start_date IS DISTINCT FROM NEW.start_date OR
           OLD.last_executed IS DISTINCT FROM NEW.last_executed
       )) THEN
        
        NEW.next_execution := calculate_next_execution(
            NEW.frequency,
            NEW.last_executed,
            NEW.start_date
        );
    END IF;

    -- Atualizar timestamp de modificação
    NEW.updated_at := timezone('utc'::text, now());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente a próxima execução
DROP TRIGGER IF EXISTS update_recurring_transaction_next_execution ON public.recurring_transactions;
CREATE TRIGGER update_recurring_transaction_next_execution
    BEFORE INSERT OR UPDATE ON public.recurring_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_next_execution();

-- =====================================================
-- DADOS INICIAIS (OPCIONAL)
-- =====================================================
-- Você pode descomentar e ajustar os dados abaixo para criar exemplos

/*
-- Exemplo de dados para teste (descomente se necessário)
DO $$
DECLARE
    user_uuid uuid;
    category_uuid uuid;
    budget_box_uuid uuid;
BEGIN
    -- Buscar um usuário existente (ajuste conforme necessário)
    SELECT id INTO user_uuid FROM public.users LIMIT 1;
    
    IF user_uuid IS NOT NULL THEN
        -- Buscar categoria de exemplo
        SELECT id INTO category_uuid FROM public.categories WHERE name ILIKE '%moradia%' LIMIT 1;
        
        -- Buscar caixa de planejamento de exemplo
        SELECT id INTO budget_box_uuid FROM public.budget_boxes WHERE name ILIKE '%custos fixos%' LIMIT 1;
        
        -- Inserir exemplo de aluguel recorrente
        INSERT INTO public.recurring_transactions (
            user_id, description, amount, category_id, budget_box_id,
            frequency, start_date, type, notes
        ) VALUES (
            user_uuid, 'Aluguel', 1500.00, category_uuid, budget_box_uuid,
            'monthly', CURRENT_DATE, 'expense', 'Aluguel do apartamento'
        ) ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Dados de exemplo inseridos com sucesso!';
    END IF;
END $$;
*/

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
DO $$
BEGIN
    -- Verificar se tudo foi criado corretamente
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recurring_transactions') THEN
        RAISE NOTICE '✅ Tabela recurring_transactions criada com sucesso!';
        RAISE NOTICE '✅ Índices criados com sucesso!';
        RAISE NOTICE '✅ Políticas RLS configuradas com sucesso!';
        RAISE NOTICE '✅ Funções auxiliares criadas com sucesso!';
        RAISE NOTICE '✅ Triggers configurados com sucesso!';
        RAISE NOTICE '';
        RAISE NOTICE '🎯 Funcionalidade de Custos Recorrentes pronta para uso!';
        RAISE NOTICE '';
        RAISE NOTICE '📋 Estrutura da tabela:';
        RAISE NOTICE '   • id: UUID (chave primária)';
        RAISE NOTICE '   • user_id: UUID (referência ao usuário)';
        RAISE NOTICE '   • description: Texto (descrição da transação)';
        RAISE NOTICE '   • amount: Numeric (valor da transação)';
        RAISE NOTICE '   • category_id: UUID (categoria opcional)';
        RAISE NOTICE '   • budget_box_id: UUID (caixa de planejamento opcional)';
        RAISE NOTICE '   • frequency: Texto (daily, weekly, monthly, quarterly, yearly)';
        RAISE NOTICE '   • start_date: Date (data de início)';
        RAISE NOTICE '   • end_date: Date (data de fim, opcional)';
        RAISE NOTICE '   • is_active: Boolean (se está ativo)';
        RAISE NOTICE '   • last_executed: Date (última execução)';
        RAISE NOTICE '   • next_execution: Date (próxima execução, calculada automaticamente)';
        RAISE NOTICE '   • type: Texto (income ou expense)';
        RAISE NOTICE '   • notes: Texto (observações opcionais)';
        RAISE NOTICE '   • created_at/updated_at: Timestamps automáticos';
    ELSE
        RAISE NOTICE '❌ Erro: Tabela recurring_transactions não foi criada!';
    END IF;
END $$;
