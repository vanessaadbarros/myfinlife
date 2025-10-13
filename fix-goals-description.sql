-- Script para adicionar coluna description à tabela goals
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna description se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'goals' 
        AND column_name = 'description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.goals ADD COLUMN description text;
    END IF;
END $$;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'goals' 
AND table_schema = 'public'
ORDER BY ordinal_position;
