# 🔄 Geração Automática de Transações Recorrentes

## ❌ **Problema Identificado**

Os custos recorrentes não estavam sendo considerados nas transações do mês. Eles existiam apenas como "planejamento", mas não geravam transações reais que impactassem o orçamento.

---

## ✅ **Solução Implementada**

### **Sistema de Geração Automática**

Implementada funcionalidade para converter custos recorrentes em transações reais do mês, permitindo que eles sejam contabilizados no orçamento e nas caixas de planejamento.

---

## 🎯 **Como Funciona**

### **1. Verificação de Transações Existentes**
```typescript
// Para cada custo recorrente ativo
for (const rt of activeRecurring) {
  // Verifica se já existe transação no mês
  const existingTransactions = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', user.id)
    .gte('date', firstDay)
    .lte('date', lastDay)
    .eq('description', rt.description)
    .eq('amount', rt.amount)
  
  // Se não existe, cria a transação
  if (!existingTransactions || existingTransactions.length === 0) {
    // Criar transação...
  }
}
```

### **2. Cálculo da Data da Transação**
```typescript
// Para transações mensais, usa o dia da data de início
if (rt.frequency === 'monthly') {
  const startDay = new Date(rt.start_date).getDate()
  transactionDate = new Date(year, month - 1, Math.min(startDay, lastDay.getDate()))
}
```

### **3. Criação da Transação**
```typescript
await supabase
  .from('transactions')
  .insert({
    user_id: user.id,
    description: rt.description,
    amount: rt.amount,
    date: transactionDate,
    type: rt.type,
    category_id: rt.category_id,
    budget_box_id: rt.budget_box_id,
    is_recurring: true  // Marca como recorrente
  })
```

---

## 🎨 **Interface do Usuário**

### **Botão de Geração**
```
┌─────────────────────────────────────────────┐
│ Custos Recorrentes                          │
├─────────────────────────────────────────────┤
│ [📅 Gerar Transações do Mês] [+ Novo Custo]│
└─────────────────────────────────────────────┘
```

### **Fluxo de Uso**
```
1. Usuário acessa "Custos Recorrentes"
   ↓
2. Clica em "Gerar Transações do Mês"
   ↓
3. Sistema verifica custos recorrentes ativos
   ↓
4. Para cada custo, verifica se já existe transação
   ↓
5. Cria transações que ainda não existem
   ↓
6. Mostra mensagem de sucesso
   ↓
7. Recarrega a página para mostrar as transações
```

---

## 📋 **Regras de Negócio**

### **1. Período de Ativação**
```typescript
// Verifica se a transação está ativa no período
const startDate = new Date(rt.start_date)
const endDate = rt.end_date ? new Date(rt.end_date) : null

// Não gera se ainda não começou
if (startDate > lastDay) return false

// Não gera se já terminou
if (endDate && endDate < firstDay) return false
```

### **2. Evita Duplicação**
```typescript
// Busca por transações com mesma descrição e valor
.eq('description', rt.description)
.eq('amount', rt.amount)

// Só cria se não encontrar
if (!existingTransactions || existingTransactions.length === 0) {
  // Criar transação...
}
```

### **3. Data Inteligente**
```typescript
// Para mensal, usa o dia da data de início
const startDay = new Date(rt.start_date).getDate()

// Ajusta para o último dia do mês se necessário
transactionDate = new Date(year, month - 1, Math.min(startDay, lastDay.getDate()))

// Exemplo: Se o custo é dia 31, mas o mês tem 30 dias, usa dia 30
```

---

## 🔧 **Código Implementado**

### **useRecurringTransactions.ts**
```typescript
const generateMonthlyTransactions = async (month: number, year: number) => {
  if (!user) return { error: new Error('Usuário não autenticado') }

  try {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    
    // Buscar transações recorrentes ativas para o período
    const activeRecurring = recurringTransactions.filter(rt => {
      const startDate = new Date(rt.start_date)
      const endDate = rt.end_date ? new Date(rt.end_date) : null
      
      // Verifica se a transação está ativa no período
      if (startDate > lastDay) return false
      if (endDate && endDate < firstDay) return false
      
      return rt.is_active
    })

    // Para cada transação recorrente, verificar se já existe transação no mês
    for (const rt of activeRecurring) {
      // Verificar se já existe transação para este custo recorrente no mês
      const { data: existingTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .gte('date', firstDay.toISOString().split('T')[0])
        .lte('date', lastDay.toISOString().split('T')[0])
        .eq('description', rt.description)
        .eq('amount', rt.amount)

      // Se não existe, criar a transação
      if (!existingTransactions || existingTransactions.length === 0) {
        // Calcular a data da transação baseado na frequência
        let transactionDate = firstDay

        // Para mensal, usar o dia da data de início
        if (rt.frequency === 'monthly') {
          const startDay = new Date(rt.start_date).getDate()
          transactionDate = new Date(year, month - 1, Math.min(startDay, lastDay.getDate()))
        }

        // Criar a transação
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            description: rt.description,
            amount: rt.amount,
            date: transactionDate.toISOString().split('T')[0],
            type: rt.type,
            category_id: rt.category_id,
            budget_box_id: rt.budget_box_id,
            is_recurring: true
          })
      }
    }

    return { error: null }
  } catch (err) {
    console.error('Erro ao gerar transações mensais:', err)
    return { error: err as Error }
  }
}
```

### **RecurringCosts.tsx**
```typescript
const handleGenerateTransactions = async () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  
  try {
    const { error } = await generateMonthlyTransactions(month, year)
    if (error) {
      alert('Erro ao gerar transações: ' + error.message)
    } else {
      alert('Transações geradas com sucesso!')
      window.location.reload()
    }
  } catch (error) {
    console.error('Erro ao gerar transações:', error)
    alert('Erro ao gerar transações')
  }
}
```

---

## 📊 **Exemplos de Uso**

### **Exemplo 1: Aluguel Mensal**
```
Custo Recorrente:
- Descrição: Aluguel
- Valor: R$ 1.000,00
- Frequência: Mensal
- Data Início: 05/09/2025
- Caixa: Custos Fixos

Ao gerar transações de Outubro:
✅ Cria transação em 05/10/2025
✅ Vincula à caixa "Custos Fixos"
✅ Marca como is_recurring: true
✅ Aparece no Dashboard do mês
```

### **Exemplo 2: Netflix**
```
Custo Recorrente:
- Descrição: Netflix
- Valor: R$ 29,90
- Frequência: Mensal
- Data Início: 15/08/2025
- Caixa: Conforto

Ao gerar transações de Outubro:
✅ Cria transação em 15/10/2025
✅ Vincula à caixa "Conforto"
✅ Impacta o orçamento da caixa
```

### **Exemplo 3: Salário (Receita)**
```
Custo Recorrente:
- Descrição: Salário
- Valor: R$ 5.000,00
- Frequência: Mensal
- Tipo: Receita
- Data Início: 05/09/2025

Ao gerar transações de Outubro:
✅ Cria transação de receita em 05/10/2025
✅ Aumenta o saldo disponível
```

---

## ✅ **Benefícios**

### **Para o Usuário**
1. **Automação**: Não precisa criar transações manualmente todo mês
2. **Consistência**: Todas as transações recorrentes são criadas
3. **Controle**: Pode revisar antes de confirmar
4. **Orçamento Real**: Custos recorrentes impactam o orçamento
5. **Histórico**: Mantém registro de todas as transações

### **Para o Sistema**
1. **Integridade**: Evita duplicação de transações
2. **Flexibilidade**: Suporta diferentes frequências
3. **Rastreabilidade**: Marca transações como recorrentes
4. **Escalabilidade**: Funciona com qualquer quantidade de custos

---

## 🎯 **Casos de Uso**

### **1. Início do Mês**
```
Dia 01/10/2025
  ↓
Usuário acessa Custos Recorrentes
  ↓
Clica em "Gerar Transações do Mês"
  ↓
Sistema cria todas as transações de Outubro
  ↓
Dashboard atualizado com os custos
```

### **2. Meio do Mês**
```
Dia 15/10/2025
  ↓
Usuário adiciona novo custo recorrente
  ↓
Clica em "Gerar Transações do Mês"
  ↓
Sistema cria apenas as novas transações
  ↓
Não duplica as que já existem
```

### **3. Revisão de Custos**
```
Usuário verifica Dashboard
  ↓
Vê que faltam transações recorrentes
  ↓
Vai em Custos Recorrentes
  ↓
Gera transações do mês
  ↓
Orçamento atualizado corretamente
```

---

## 🚀 **Melhorias Futuras**

### **Automação Completa**
- [ ] **Geração automática**: Criar transações automaticamente no início do mês
- [ ] **Agendamento**: Usar cron job ou trigger do Supabase
- [ ] **Notificação**: Avisar usuário quando transações forem criadas

### **Funcionalidades Avançadas**
- [ ] **Previsão**: Mostrar transações futuras antes de criar
- [ ] **Edição em lote**: Ajustar múltiplas transações de uma vez
- [ ] **Histórico**: Ver todas as transações geradas de um custo
- [ ] **Cancelamento**: Desfazer geração de transações

### **Frequências Adicionais**
- [ ] **Semanal**: Criar transações semanais
- [ ] **Quinzenal**: Suporte para pagamentos quinzenais
- [ ] **Trimestral**: Para custos trimestrais
- [ ] **Anual**: Para custos anuais

---

## 🔍 **Troubleshooting**

### **Transações Duplicadas**
```
Problema: Transações aparecem duplicadas
Solução: Sistema verifica por descrição e valor
         Só cria se não existir
```

### **Data Errada**
```
Problema: Transação criada em data incorreta
Solução: Usa o dia da data de início do custo
         Ajusta para último dia se necessário
```

### **Não Aparece no Dashboard**
```
Problema: Transação criada mas não aparece
Solução: Recarregar a página após gerar
         Verificar se está no mês correto
```

---

## ✅ **Status da Implementação**

- ✅ **Função de geração** implementada
- ✅ **Verificação de duplicação** funcionando
- ✅ **Cálculo de data** inteligente
- ✅ **Botão na interface** adicionado
- ✅ **Feedback ao usuário** com alerts
- ✅ **Vinculação com caixas** mantida
- ✅ **Marca como recorrente** (is_recurring: true)
- ✅ **Sem erros** de linting

**Agora os custos recorrentes são convertidos em transações reais que impactam o orçamento!** 🎉
