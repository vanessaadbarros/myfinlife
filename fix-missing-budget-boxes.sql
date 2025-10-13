-- Script para criar caixas de planejamento para usuários existentes que não têm
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar quais usuários não têm caixas de planejamento
select 
  u.id,
  u.email,
  u.name,
  count(bb.id) as budget_boxes_count
from public.users u
left join public.budget_boxes bb on u.id = bb.user_id
group by u.id, u.email, u.name
having count(bb.id) = 0;

-- Agora vamos criar as caixas para esses usuários
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
