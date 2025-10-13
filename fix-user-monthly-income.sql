-- =====================================================
-- SCRIPT PARA CORRIGIR RENDA MENSAL DOS USUÁRIOS
-- =====================================================
-- Este script ajuda a identificar e corrigir usuários que não têm monthly_income configurado

-- Verificar usuários sem renda mensal configurada
DO $$
DECLARE
    user_record RECORD;
    current_settings jsonb;
BEGIN
    -- Buscar usuários que não têm monthly_income nas configurações
    FOR user_record IN 
        SELECT id, email, name, settings 
        FROM public.users 
        WHERE settings IS NULL 
           OR NOT (settings ? 'monthly_income')
           OR (settings->>'monthly_income')::numeric = 0
    LOOP
        RAISE NOTICE 'Usuário sem renda mensal: % (%)', user_record.name, user_record.email;
        
        -- Mostrar configurações atuais
        RAISE NOTICE 'Configurações atuais: %', COALESCE(user_record.settings::text, 'NULL');
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 Para corrigir manualmente, execute:';
    RAISE NOTICE 'UPDATE public.users SET settings = jsonb_set(COALESCE(settings, ''{}''), ''{monthly_income}'', ''5000'') WHERE id = ''USER_ID_AQUI'';';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Ou configure via interface do usuário no onboarding';
END $$;

-- Função auxiliar para definir renda mensal de um usuário específico
CREATE OR REPLACE FUNCTION set_user_monthly_income(
    user_uuid uuid,
    monthly_income_value numeric
) RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET settings = jsonb_set(
        COALESCE(settings, '{}'), 
        '{monthly_income}', 
        to_jsonb(monthly_income_value)
    )
    WHERE id = user_uuid;
    
    RAISE NOTICE 'Renda mensal de R$ % definida para o usuário %', monthly_income_value, user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Exemplo de uso da função (descomente e ajuste conforme necessário):
/*
-- Definir renda mensal de R$ 5000 para um usuário específico
SELECT set_user_monthly_income(
    'SEU_USER_ID_AQUI'::uuid, 
    5000.00
);
*/

-- Verificar quantos usuários têm renda mensal configurada
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN settings ? 'monthly_income' AND (settings->>'monthly_income')::numeric > 0 THEN 1 END) as com_renda_mensal,
    COUNT(CASE WHEN settings IS NULL OR NOT (settings ? 'monthly_income') OR (settings->>'monthly_income')::numeric = 0 THEN 1 END) as sem_renda_mensal
FROM public.users;

-- Mostrar detalhes dos usuários
SELECT 
    id,
    email,
    name,
    CASE 
        WHEN settings IS NULL THEN 'Configurações NULL'
        WHEN NOT (settings ? 'monthly_income') THEN 'Sem monthly_income'
        WHEN (settings->>'monthly_income')::numeric = 0 THEN 'Renda = 0'
        ELSE 'Renda: R$ ' || (settings->>'monthly_income')::numeric
    END as status_renda,
    settings
FROM public.users
ORDER BY created_at DESC;
