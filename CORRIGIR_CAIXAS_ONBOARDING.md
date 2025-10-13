# 🔧 Correção: Caixas de Planejamento no Onboarding

## 🚨 Problema Identificado
O passo 2 do onboarding não está mostrando as 6 caixas de planejamento porque elas não foram criadas para o usuário atual.

## 🛠️ Soluções Implementadas

### 1. **Solução Automática** ✅
- O sistema agora detecta automaticamente quando as caixas não existem
- Tenta criá-las automaticamente usando as funções do banco de dados
- Se não conseguir, mostra uma interface para criação manual

### 2. **Solução Manual via SQL** 📋
Execute este script no **SQL Editor do Supabase**:

```sql
-- Script para criar caixas de planejamento para usuários existentes
do $$
declare
  user_record record;
begin
  -- Para cada usuário que não tem caixas de planejamento
  for user_record in 
    select u.id
    from public.users u
    left join public.budget_boxes bb on u.id = bb.user_id
    group by u.id
    having count(bb.id) = 0
  loop
    -- Criar as caixas de planejamento para este usuário
    perform public.create_default_budget_boxes(user_record.id);
    
    -- Criar as categorias padrão para este usuário
    perform public.create_default_categories(user_record.id);
    
    raise notice 'Criadas caixas e categorias para usuário: %', user_record.id;
  end loop;
end $$;
```

### 3. **Verificação** 🔍
Após executar o script, verifique se as caixas foram criadas:

```sql
-- Verificar se as caixas foram criadas
select 
  u.email,
  u.name,
  bb.name as box_name,
  bb.percentage,
  bb.icon
from public.users u
join public.budget_boxes bb on u.id = bb.user_id
order by u.email, bb.order_index;
```

## 🎯 Como Testar

1. **Execute o script SQL** no Supabase
2. **Recarregue a página** do onboarding
3. **Vá para o passo 2** - agora deve mostrar as 6 caixas:
   - 🏠 Custos fixos (35%)
   - ✨ Conforto (15%)
   - 🎯 Metas (10%)
   - 🎉 Prazeres (10%)
   - 💎 Liberdade financeira (25%)
   - 📚 Conhecimento (5%)

## 🔄 Componentes Atualizados

### `BudgetBoxesManager`
- Gerencia automaticamente a criação das caixas
- Mostra loading enquanto cria
- Exibe erro se não conseguir criar

### `OnboardingWizard`
- Agora usa o `BudgetBoxesManager`
- Interface mais robusta para lidar com caixas ausentes
- Logs de debug para identificar problemas

## 🚀 Próximos Passos

1. Execute o script SQL
2. Teste o onboarding completo
3. Verifique se as caixas aparecem corretamente
4. Teste a alteração de percentuais
5. Verifique se o passo 3 funciona corretamente

## 📝 Notas Técnicas

- O trigger `on_auth_user_created` só funciona para **novos usuários**
- Usuários existentes precisam das caixas criadas manualmente
- O script SQL resolve isso para todos os usuários existentes
- Futuros usuários terão as caixas criadas automaticamente
