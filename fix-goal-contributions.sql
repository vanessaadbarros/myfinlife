-- Script para corrigir a tabela goal_contributions
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela goal_contributions tem as colunas corretas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'goal_contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Adicionar coluna description se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'goal_contributions' 
        AND column_name = 'description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.goal_contributions ADD COLUMN description text;
        RAISE NOTICE 'Coluna description adicionada à tabela goal_contributions!';
    ELSE
        RAISE NOTICE 'Coluna description já existe na tabela goal_contributions!';
    END IF;
END $$;

-- Verificar se a coluna source_type tem valor padrão
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'goal_contributions' 
        AND column_name = 'source_type'
        AND column_default IS NOT NULL
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.goal_contributions ALTER COLUMN source_type SET DEFAULT 'manual';
        RAISE NOTICE 'Valor padrão "manual" adicionado à coluna source_type!';
    ELSE
        RAISE NOTICE 'Coluna source_type já tem valor padrão!';
    END IF;
END $$;

-- Verificar estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'goal_contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Testar inserção de uma contribuição (comentado para não inserir dados de teste)
/*
INSERT INTO public.goal_contributions (goal_id, amount, description, source_type)
VALUES ('test-goal-id', 100.00, 'Teste de contribuição', 'manual');
*/
