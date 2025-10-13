# 🐛 Debug: Impacto no Orçamento

## 🎯 **Problema Atual**

O sistema de Custos Recorrentes não está refletindo corretamente:
- ❌ **Renda mensal**: Mostra R$ 0,00
- ❌ **Percentual de impacto**: Mostra 0.0%
- ❌ **Orçamentos das caixas**: Mostra R$ 0,00

---

## 🔍 **Debug Implementado**

### **1. Logs Adicionados**

#### **Hook Principal** (`useRecurringTransactions`)
```typescript
console.log('🔍 Debug useRecurringTransactions stats:')
console.log('- monthlyIncome:', monthlyIncome)
console.log('- totalRecurringExpenses:', totalRecurringExpenses)
console.log('- budgetImpactPercentage:', budgetImpactPercentage)
console.log('- profile.settings:', profile?.settings)
```

#### **Hook de Impacto** (`useRecurringTransactionImpact`)
```typescript
console.log('🔍 Debug useRecurringTransactionImpact:')
console.log('- recurringTransactions:', recurringTransactions.length)
console.log('- budgetBoxes:', budgetBoxes.length)
console.log('- profile:', profile)
console.log('- monthlyIncome:', monthlyIncome)
console.log('- profile.settings:', profile?.settings)
```

#### **Página Principal** (`RecurringCosts`)
```typescript
console.log('🔍 Debug RecurringCosts:')
console.log('- profile:', profile)
console.log('- monthlyIncome:', monthlyIncome)
console.log('- stats:', stats)
console.log('- impactByBox:', impactByBox)
```

### **2. Botão de Debug**

**Localização**: Header da página Custos Recorrentes
**Aparece quando**: `monthlyIncome === 0`
**Função**: Define renda mensal como R$ 5.000 para teste

```typescript
const setMonthlyIncomeDebug = async () => {
  if (!profile) return
  try {
    const currentSettings = profile?.settings as any || {}
    await updateProfile({
      settings: {
        ...currentSettings,
        monthly_income: 5000
      }
    })
    alert('Renda mensal definida como R$ 5.000 para teste!')
  } catch (error) {
    console.error('Erro ao definir renda:', error)
  }
}
```

---

## 🧪 **Como Testar**

### **1. Acesse a Página**
1. Vá para Dashboard
2. Clique em "Ações Rápidas"
3. Selecione "Custos Recorrentes"

### **2. Verifique o Console**
1. Abra o Developer Tools (F12)
2. Vá para a aba "Console"
3. Procure pelos logs com 🔍

### **3. Use o Botão de Debug**
1. Se aparecer o botão "🐛 Debug: Definir Renda R$ 5.000"
2. Clique nele
3. Aguarde o alerta de confirmação
4. Recarregue a página
5. Verifique se os valores mudaram

### **4. Analise os Logs**

#### **Cenário 1: Profile NULL**
```
- profile: null
- monthlyIncome: 0
```
**Solução**: Usuário não está autenticado ou perfil não carregou

#### **Cenário 2: Settings NULL**
```
- profile: { id: "...", email: "...", settings: null }
- monthlyIncome: 0
```
**Solução**: Usuário não tem configurações salvas

#### **Cenário 3: Settings sem monthly_income**
```
- profile: { id: "...", settings: {} }
- monthlyIncome: 0
```
**Solução**: Usuário não completou onboarding ou renda não foi salva

#### **Cenário 4: Tudo OK mas não funciona**
```
- profile: { id: "...", settings: { monthly_income: 5000 } }
- monthlyIncome: 5000
- stats: { budgetImpactPercentage: 0 }
```
**Solução**: Problema no cálculo dos percentuais

---

## 📊 **Valores Esperados**

### **Com Renda R$ 5.000 e Despesas R$ 366,70**

```
🔍 Debug useRecurringTransactions stats:
- monthlyIncome: 5000
- totalRecurringExpenses: 366.7
- budgetImpactPercentage: 7.334
- profile.settings: { monthly_income: 5000 }

🔍 Debug useRecurringTransactionImpact:
- recurringTransactions: 6
- budgetBoxes: 6
- profile: { id: "...", settings: { monthly_income: 5000 } }
- monthlyIncome: 5000
```

### **Interface Esperada**
```
Impacto no Orçamento
Seus custos recorrentes representam 7.3% da sua renda mensal

Total Recorrente: R$ 366,70
███████░░░░░░░░░░░░░░░░ 7.3%
0%                    Renda: R$ 5.000,00

Custos fixos (4): R$ 346,80 69%
Orçamento: R$ 1.500,00, Disponível: R$ 1.153,20
```

---

## 🔧 **Possíveis Problemas**

### **1. Usuário não tem renda configurada**
- **Sintoma**: monthlyIncome = 0
- **Solução**: Use o botão de debug ou execute SQL

### **2. Transações não estão vinculadas às caixas**
- **Sintoma**: impactByBox vazio
- **Solução**: Verifique se `budget_box_id` está preenchido

### **3. Caixas de planejamento não carregaram**
- **Sintoma**: budgetBoxes.length = 0
- **Solução**: Verifique se o usuário tem caixas configuradas

### **4. Profile não carregou**
- **Sintoma**: profile = null
- **Solução**: Verifique autenticação

---

## 🗄️ **SQL para Verificar Usuário**

```sql
-- Verificar configurações do usuário atual
SELECT 
    id, email, name, 
    settings,
    CASE 
        WHEN settings IS NULL THEN 'NULL'
        WHEN NOT (settings ? 'monthly_income') THEN 'Sem monthly_income'
        ELSE 'Renda: R$ ' || (settings->>'monthly_income')::numeric
    END as renda_status
FROM public.users 
WHERE email = 'SEU_EMAIL_AQUI';

-- Verificar transações recorrentes
SELECT 
    rt.description,
    rt.amount,
    rt.type,
    rt.budget_box_id,
    bb.name as box_name,
    bb.percentage
FROM public.recurring_transactions rt
LEFT JOIN public.budget_boxes bb ON rt.budget_box_id = bb.id
WHERE rt.user_id = 'SEU_USER_ID_AQUI';
```

---

## 📋 **Próximos Passos**

1. **Execute o teste** com os logs de debug
2. **Analise os valores** no console
3. **Identifique o problema** baseado nos cenários
4. **Aplique a solução** correspondente
5. **Remova os logs** quando o problema for resolvido

---

## 🚨 **Importante**

- Os logs de debug são temporários
- Remova-os após identificar o problema
- O botão de debug deve ser removido em produção
- Use apenas para diagnóstico

---

## ✅ **Status**

- ✅ **Logs adicionados** - Para debug completo
- ✅ **Botão de debug** - Para definir renda temporariamente
- ✅ **Instruções claras** - Para identificar o problema
- 🔄 **Aguardando teste** - Para identificar a causa raiz
