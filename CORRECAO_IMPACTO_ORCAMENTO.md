# 🔧 Correção: Impacto no Orçamento não Refletindo Dados

## 🎯 **Problema Identificado**

A seção "Impacto no Orçamento" estava mostrando:
- ❌ **Renda: R$ 0,00**
- ❌ **0.0%** de impacto
- ❌ **Orçamento: R$ 0,00** para todas as caixas
- ⚠️ **"2 caixas excedidas"** (contraditório)

Mesmo com transações recorrentes cadastradas (R$ 366,70), o sistema não conseguia calcular o impacto real.

---

## 🔍 **Causa Raiz**

### **1. Renda Mensal Não Salva**
- ❌ **Onboarding**: Renda mensal não estava sendo salva no banco
- ❌ **Comentário TODO**: "implementar quando tivermos tabela de rendas"
- ❌ **Resultado**: `user.settings.monthly_income` sempre retornava `0`

### **2. Acesso Incorreto aos Dados**
- ❌ **Hook**: Tentava acessar `user.settings.monthly_income`
- ❌ **Realidade**: Dados estão em `profile.settings.monthly_income`
- ❌ **Resultado**: Sempre retornava `undefined` ou `0`

---

## ✅ **Correções Implementadas**

### **1. Salvamento da Renda Mensal no Onboarding**

**Arquivo**: `src/components/OnboardingWizard.tsx`

```typescript
// ANTES (linha 94)
// TODO: Salvar renda mensal (implementar quando tivermos tabela de rendas)

// DEPOIS (linhas 86-96)
// Salvar renda mensal nas configurações do usuário
const incomeAmount = parseIncome()
if (incomeAmount > 0) {
  const currentSettings = profile?.settings as any || {}
  await updateProfile({
    settings: {
      ...currentSettings,
      monthly_income: incomeAmount
    }
  })
}
```

### **2. Correção dos Hooks**

**Arquivo**: `src/hooks/useRecurringTransactions.ts`

```typescript
// ANTES
const { user } = useAuth()
const monthlyIncome = user?.settings?.monthly_income || 0

// DEPOIS
const { user, profile } = useAuth()
const monthlyIncome = (profile?.settings as any)?.monthly_income || 0
```

### **3. Correção da Página Principal**

**Arquivo**: `src/pages/RecurringCosts.tsx`

```typescript
// ANTES
const { user } = useAuth()
const monthlyIncome = user?.settings?.monthly_income || 0

// DEPOIS
const { profile } = useAuth()
const monthlyIncome = (profile?.settings as any)?.monthly_income || 0
```

---

## 🗄️ **Script para Usuários Existentes**

**Arquivo**: `fix-user-monthly-income.sql`

### **Verificar Usuários sem Renda**
```sql
-- Ver usuários que precisam de correção
SELECT 
    id, email, name,
    CASE 
        WHEN settings IS NULL THEN 'Configurações NULL'
        WHEN NOT (settings ? 'monthly_income') THEN 'Sem monthly_income'
        WHEN (settings->>'monthly_income')::numeric = 0 THEN 'Renda = 0'
        ELSE 'Renda: R$ ' || (settings->>'monthly_income')::numeric
    END as status_renda
FROM public.users;
```

### **Definir Renda Manualmente**
```sql
-- Função auxiliar criada
SELECT set_user_monthly_income('USER_ID_AQUI'::uuid, 5000.00);
```

### **Ou Atualizar Diretamente**
```sql
UPDATE public.users 
SET settings = jsonb_set(
    COALESCE(settings, '{}'), 
    '{monthly_income}', 
    '5000'::jsonb
) 
WHERE id = 'USER_ID_AQUI';
```

---

## 🧪 **Como Testar**

### **1. Usuário Novo**
1. Faça logout/login
2. Complete o onboarding
3. Verifique se a renda mensal foi salva
4. Acesse Custos Recorrentes
5. Verifique se o impacto aparece corretamente

### **2. Usuário Existente**
1. Execute o script `fix-user-monthly-income.sql`
2. Defina a renda mensal manualmente
3. Acesse Custos Recorrentes
4. Verifique se o impacto aparece corretamente

---

## 📊 **Resultado Esperado**

### **Antes da Correção**
```
Impacto no Orçamento
Seus custos recorrentes representam 0.0% da sua renda mensal

Total Recorrente: R$ 366,70
████████████████████████ 0% (vazio)
0%                    Renda: R$ 0,00

Custos fixos (4): R$ 346,80 0%
Orçamento: R$ 0,00, Disponível: R$ 0,00

Conforto (1): R$ 19,90 0%
Orçamento: R$ 0,00, Disponível: R$ 0,00
```

### **Depois da Correção**
```
Impacto no Orçamento
Seus custos recorrentes representam 12.2% da sua renda mensal

Total Recorrente: R$ 366,70
██████░░░░░░░░░░░░░░░░ 12.2%
0%                    Renda: R$ 3.000,00

Custos fixos (4): R$ 346,80 69%
Orçamento: R$ 1.500,00, Disponível: R$ 1.153,20

Conforto (1): R$ 19,90 8%
Orçamento: R$ 250,00, Disponível: R$ 230,10
```

---

## 🔄 **Fluxo Corrigido**

### **1. Onboarding**
```
Usuário insere renda → Salva em profile.settings.monthly_income → Banco atualizado
```

### **2. Cálculo de Impacto**
```
Hook lê profile.settings.monthly_income → Calcula percentuais → Exibe corretamente
```

### **3. Dados Consistentes**
```
Renda salva ✅ → Percentuais corretos ✅ → Alertas precisos ✅
```

---

## 📋 **Arquivos Modificados**

1. **`src/components/OnboardingWizard.tsx`** - Salvar renda mensal
2. **`src/hooks/useRecurringTransactions.ts`** - Acessar profile.settings
3. **`src/pages/RecurringCosts.tsx`** - Acessar profile.settings
4. **`fix-user-monthly-income.sql`** - Script para usuários existentes

---

## ✅ **Status da Correção**

- ✅ **Onboarding corrigido** - Renda mensal é salva
- ✅ **Hooks corrigidos** - Acesso aos dados correto
- ✅ **Interface corrigida** - Percentuais calculados corretamente
- ✅ **Script criado** - Para corrigir usuários existentes
- ✅ **Documentação completa** - Processo explicado

---

## 🎯 **Próximos Passos**

1. **Execute o SQL**: `fix-user-monthly-income.sql` para verificar usuários
2. **Configure renda**: Para usuários existentes sem renda mensal
3. **Teste a funcionalidade**: Crie transações recorrentes e verifique o impacto
4. **Valide cálculos**: Confirme se os percentuais estão corretos

A funcionalidade de **Custos Recorrentes** agora reflete corretamente o impacto no orçamento! 🎉
