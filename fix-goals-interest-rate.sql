-- Script para adicionar coluna annual_interest_rate à tabela goals
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna annual_interest_rate se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'goals' 
        AND column_name = 'annual_interest_rate'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.goals ADD COLUMN annual_interest_rate numeric(5, 2) DEFAULT 0.00;
        
        -- Adicionar constraint de verificação
        ALTER TABLE public.goals ADD CONSTRAINT goals_annual_interest_rate_check 
        CHECK (annual_interest_rate >= 0 AND annual_interest_rate <= 100);
        
        RAISE NOTICE 'Coluna annual_interest_rate adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna annual_interest_rate já existe!';
    END IF;
END $$;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'goals' 
AND table_schema = 'public'
AND column_name = 'annual_interest_rate';

-- Mostrar algumas metas existentes para verificar
SELECT id, name, target_amount, annual_interest_rate 
FROM public.goals 
LIMIT 5;
