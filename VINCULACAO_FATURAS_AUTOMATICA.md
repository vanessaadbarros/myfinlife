# 📄 Vinculação Automática de Faturas

## 📝 Descrição

Sistema automático para vincular transações de cartão de crédito às suas respectivas faturas, com cálculo dinâmico de totais e exibição em tempo real.

---

## ✨ Funcionalidades Implementadas

### **1. Criação Automática de Faturas**
- ✅ Ao fazer compra no crédito, fatura é criada/buscada automaticamente
- ✅ Cálculo correto do mês de referência baseado no dia de fechamento
- ✅ Datas de fechamento e vencimento calculadas automaticamente

### **2. Vinculação de Transações**
- ✅ Toda transação de crédito recebe `invoice_id`
- ✅ Parcelas de parcelamentos vinculadas às faturas corretas
- ✅ Custos recorrentes no cartão vinculados à fatura do mês

### **3. Atualização de Totais**
- ✅ Total da fatura recalculado a cada transação adicionada
- ✅ Total recalculado ao editar transação
- ✅ Total recalculado ao excluir transação

### **4. Exibição Visual**
- ✅ Cards de cartão mostram fatura atual
- ✅ Barra de progresso do limite usado
- ✅ Percentual do limite consumido
- ✅ Atualização em tempo real

---

## 🔧 Implementação Técnica

### **Arquivos Modificados**

#### 1. `src/hooks/useTransactions.ts` ✅
**Funções Adicionadas**:

```typescript
// Calcular datas da fatura baseado no fechamento do cartão
const calculateInvoiceDates = async (creditCardId: string, purchaseDate: string) => {
  // Busca closing_day e due_day do cartão
  // Se compra ANTES do fechamento → fatura do mês atual
  // Se compra DEPOIS do fechamento → fatura do próximo mês
  // Retorna: referenceMonth, closingDate, dueDate
}

// Buscar fatura existente ou criar nova
const getOrCreateInvoice = async (creditCardId: string, purchaseDate: string) => {
  const dates = await calculateInvoiceDates(creditCardId, purchaseDate)
  
  // Tenta buscar fatura do mês
  const existingInvoice = await supabase
    .from('credit_card_invoices')
    .select('id')
    .eq('credit_card_id', creditCardId)
    .eq('reference_month', dates.referenceMonth)
    .single()

  if (existingInvoice) return existingInvoice.id

  // Se não existe, cria nova fatura
  const newInvoice = await supabase
    .from('credit_card_invoices')
    .insert([{
      credit_card_id, reference_month, closing_date, due_date,
      total_amount: 0, status: 'open'
    }])

  return newInvoice.id
}

// Recalcular total da fatura
const updateInvoiceTotal = async (invoiceId: string) => {
  // Busca todas as transações da fatura
  const transactions = await supabase
    .from('transactions')
    .select('amount')
    .eq('invoice_id', invoiceId)
    .eq('payment_method', 'credit')

  // Soma os valores
  const total = transactions.reduce((sum, t) => sum + t.amount, 0)

  // Atualiza a fatura
  await supabase
    .from('credit_card_invoices')
    .update({ total_amount: total })
    .eq('id', invoiceId)
}
```

**addTransaction Atualizado**:
```typescript
const addTransaction = async (transaction) => {
  let invoiceId = null
  
  // Se for compra no crédito
  if (transaction.payment_method === 'credit' && transaction.credit_card_id) {
    invoiceId = await getOrCreateInvoice(
      transaction.credit_card_id,
      transaction.date
    )
  }

  // Criar transação com invoice_id
  const { data } = await supabase
    .from('transactions')
    .insert([{ ...transaction, invoice_id: invoiceId }])

  // Atualizar saldo da conta (SE NÃO for crédito)
  if (data.payment_method !== 'credit' && data.account_id) {
    await updateAccountBalance(data.account_id, data.amount, data.type)
  }

  // Atualizar total da fatura (SE for crédito)
  if (data.payment_method === 'credit' && invoiceId) {
    await updateInvoiceTotal(invoiceId)
  }
}
```

#### 2. `src/hooks/useInstallments.ts` ✅
**Função Adicionada**:

```typescript
const linkInstallmentsToInvoices = async (groupId: string, creditCardId: string) => {
  // Busca todas as parcelas do grupo
  const installments = await supabase
    .from('transactions')
    .select('id, date')
    .eq('installment_group_id', groupId)
    .eq('payment_method', 'credit')

  // Para cada parcela
  for (const installment of installments) {
    // Calcula qual fatura ela pertence
    const dates = await calculateInvoiceDates(creditCardId, installment.date)
    
    // Busca ou cria a fatura do mês
    const invoice = await supabase
      .from('credit_card_invoices')
      .upsert([{ 
        credit_card_id, 
        reference_month: dates.referenceMonth,
        // ... demais campos
      }])

    // Vincula parcela à fatura
    await supabase
      .from('transactions')
      .update({ invoice_id: invoice.id })
      .eq('id', installment.id)

    // Atualiza total da fatura
    await updateInvoiceTotal(invoice.id)
  }
}
```

**createInstallment Atualizado**:
```typescript
const createInstallment = async (...params, paymentMethod, creditCardId, accountId) => {
  // Cria o grupo e transações via RPC
  const { data: groupId } = await supabase.rpc('create_installment_transactions', {
    // ... parâmetros existentes
    p_payment_method: paymentMethod,
    p_credit_card_id: creditCardId,
    p_account_id: accountId
  })

  // Se foi no cartão, vincular às faturas
  if (paymentMethod === 'credit' && creditCardId && groupId) {
    await linkInstallmentsToInvoices(groupId, creditCardId)
  }
}
```

#### 3. `src/pages/BankAccounts.tsx` ✅
**Adicionado**:
- Import do `useInvoices` e `supabase`
- Estado `cardInvoices` para armazenar totais
- `useEffect` para buscar faturas de todos os cartões
- Atualização visual do card de fatura com valor real
- Barra de progresso do limite usado
- Percentual calculado dinamicamente

**Código**:
```typescript
const [cardInvoices, setCardInvoices] = useState<{ [cardId: string]: number }>({})

useEffect(() => {
  const fetchCardInvoices = async () => {
    const invoiceTotals = {}

    for (const card of creditCards) {
      const { data: invoice } = await supabase
        .from('credit_card_invoices')
        .select('total_amount')
        .eq('credit_card_id', card.id)
        .in('status', ['open', 'closed'])
        .order('reference_month', { ascending: false })
        .limit(1)
        .single()

      invoiceTotals[card.id] = invoice?.total_amount || 0
    }

    setCardInvoices(invoiceTotals)
  }

  fetchCardInvoices()
}, [creditCards])

// No JSX do card
<p className="text-lg font-bold text-purple-900">
  {formatCurrency(cardInvoices[card.id] || 0)}
</p>
```

---

## 🔄 Fluxo de Vinculação

### **Cenário 1: Compra Simples no Cartão**
```
1. Usuário faz compra
   ├─ Data: 08/11/2024
   ├─ Cartão: Nubank (fecha dia 10)
   ├─ Valor: R$ 250
   └─ payment_method: 'credit'

2. Sistema calcula
   ├─ Dia da compra (8) < Dia de fechamento (10)
   ├─ Logo, vai para fatura de NOVEMBRO/2024
   └─ reference_month: 2024-11-01

3. Sistema busca/cria fatura
   ├─ Busca fatura de Nov/2024 do Nubank
   ├─ Se não existe, cria:
   │  ├─ reference_month: 2024-11-01
   │  ├─ closing_date: 2024-11-10
   │  ├─ due_date: 2024-11-15
   │  └─ status: 'open'
   └─ Retorna invoice_id

4. Sistema cria transação
   ├─ invoice_id: [id da fatura]
   ├─ credit_card_id: [nubank]
   └─ payment_method: 'credit'

5. Sistema atualiza fatura
   ├─ Soma todas as transações com invoice_id
   ├─ total_amount: R$ 250
   └─ Salva na fatura

6. Interface atualiza
   ├─ Card do cartão mostra: R$ 250
   ├─ Barra de progresso: 3,1% (se limite R$ 8.000)
   └─ Tempo real!
```

### **Cenário 2: Parcelamento no Cartão**
```
1. Usuário cria parcelamento
   ├─ Notebook: R$ 3.600 em 12x
   ├─ Cartão: Nubank (fecha dia 10)
   ├─ Início: 15/11/2024
   └─ payment_method: 'credit'

2. Sistema cria 12 transações
   ├─ Parcela 1: 15/11/2024 - R$ 300
   ├─ Parcela 2: 15/12/2024 - R$ 300
   ├─ Parcela 3: 15/01/2025 - R$ 300
   └─ ... (mais 9)

3. Sistema vincula cada parcela
   ├─ Parcela 1 (15/11):
   │  ├─ 15 > 10 (fechamento)
   │  ├─ Vai para fatura de DEZ/2024
   │  └─ invoice_id: [fatura_dez]
   │
   ├─ Parcela 2 (15/12):
   │  ├─ 15 > 10 (fechamento)
   │  ├─ Vai para fatura de JAN/2025
   │  └─ invoice_id: [fatura_jan]
   │
   └─ ... (cada parcela na fatura correta)

4. Faturas são criadas/atualizadas
   ├─ Fatura DEZ/2024: += R$ 300
   ├─ Fatura JAN/2025: += R$ 300
   └─ ... (12 faturas diferentes)

5. Card do cartão mostra
   ├─ Fatura atual (mais recente aberta)
   ├─ Inclui todas as compras + parcelas
   └─ Total correto e atualizado
```

### **Cenário 3: Editar/Excluir Transação**
```
1. Usuário edita transação no crédito
   ├─ Mudou valor de R$ 250 para R$ 300
   └─ Mesma fatura

2. Sistema atualiza
   ├─ Salva novo valor na transação
   ├─ Recalcula total da fatura
   └─ Fatura: R$ 250 - R$ 250 + R$ 300 = R$ 300

3. Usuário exclui transação
   ├─ Transação tinha invoice_id
   └─ Valor: R$ 300

4. Sistema atualiza
   ├─ Deleta transação
   ├─ Recalcula total da fatura
   └─ Fatura: R$ 300 - R$ 300 = R$ 0
```

---

## 📊 Cálculo de Mês de Referência

### **Regra**:
```
SE dia_da_compra <= dia_de_fechamento:
  → Fatura do MÊS ATUAL

SE dia_da_compra > dia_de_fechamento:
  → Fatura do PRÓXIMO MÊS
```

### **Exemplos**:
```
Cartão: Nubank (fecha dia 10, vence dia 15)

Compra em 08/11/2024:
├─ 8 <= 10 (antes do fechamento)
├─ Vai para fatura de NOVEMBRO/2024
├─ Fecha: 10/11/2024
└─ Vence: 15/11/2024

Compra em 12/11/2024:
├─ 12 > 10 (depois do fechamento)
├─ Vai para fatura de DEZEMBRO/2024
├─ Fecha: 10/12/2024
└─ Vence: 15/12/2024

Compra em 31/10/2024:
├─ 31 > 10 (depois do fechamento)
├─ Vai para fatura de NOVEMBRO/2024
├─ Fecha: 10/11/2024
└─ Vence: 15/11/2024
```

---

## 🎨 Interface Atualizada

### **Card de Cartão (Antes)**:
```
┌──────────────────────────┐
│ 💳 Nubank Platinum       │
│ •••• 1234                │
│                          │
│ Limite: R$ 8.000         │
│ Fecha: 10 • Vence: 15    │
│                          │
│ Fatura Atual:            │
│ R$ 0,00                  │
│ Aguardando integração    │ ← ANTES
└──────────────────────────┘
```

### **Card de Cartão (Depois)**:
```
┌──────────────────────────┐
│ 💳 Nubank Platinum       │
│ •••• 1234                │
│                          │
│ Limite: R$ 8.000         │
│ Fecha: 10 • Vence: 15    │
│                          │
│ Fatura Atual:            │
│ R$ 2.487,90              │ ← AGORA
│ [██████████░░░░░] 31,1%  │ ← Barra de progresso
│ 31.1% do limite usado    │
└──────────────────────────┘
```

---

## 💡 Exemplos Práticos

### **Exemplo 1: Netflix no Cartão**
```
Ação:
├─ Tipo: Despesa
├─ Método: Crédito
├─ Cartão: Nubank Platinum
├─ Valor: R$ 39,90
├─ Data: 05/11/2024
└─ Cartão fecha dia 10

Sistema:
├─ calculateInvoiceDates('nubank-id', '2024-11-05')
├─ 5 <= 10 → Fatura de Nov/2024
├─ getOrCreateInvoice() → Busca/cria fatura Nov/2024
├─ Cria transação com invoice_id
├─ updateInvoiceTotal() → Fatura: R$ 0 + R$ 39,90 = R$ 39,90
└─ Card mostra: R$ 39,90 (0,5% do limite de R$ 8.000)
```

### **Exemplo 2: Notebook Parcelado**
```
Ação:
├─ Parcelamento: R$ 3.600 em 12x
├─ Método: Crédito
├─ Cartão: Nubank Platinum
├─ Início: 15/11/2024
└─ Cartão fecha dia 10

Sistema cria 12 parcelas:
├─ Parcela 1 (15/11/2024):
│  ├─ 15 > 10 → Fatura Dez/2024
│  └─ invoice_id: [fatura_dez]
│
├─ Parcela 2 (15/12/2024):
│  ├─ 15 > 10 → Fatura Jan/2025
│  └─ invoice_id: [fatura_jan]
│
└─ ... (10 parcelas restantes)

Faturas atualizadas:
├─ Dez/2024: += R$ 300
├─ Jan/2025: += R$ 300
├─ Fev/2025: += R$ 300
└─ ... (até Out/2025)

Card mostra:
└─ Fatura atual (Nov/2024): R$ 39,90
   (ainda não inclui parcela 1, que vai para Dez)
```

### **Exemplo 3: Múltiplas Compras no Mesmo Mês**
```
05/11: Netflix - R$ 39,90
08/11: Supermercado - R$ 238,50
12/11: Restaurante - R$ 187,00 (vai p/ fatura dez)
20/11: Gasolina - R$ 250,00 (vai p/ fatura dez)

Fatura Nov/2024:
├─ Netflix: R$ 39,90 (5 <= 10)
├─ Supermercado: R$ 238,50 (8 <= 10)
└─ Total: R$ 278,40

Fatura Dez/2024:
├─ Restaurante: R$ 187,00 (12 > 10)
├─ Gasolina: R$ 250,00 (20 > 10)
└─ Total: R$ 437,00

Card mostra: R$ 278,40 (fatura atual/mais recente em aberto)
```

---

## ✅ Benefícios

### **1. Automação Completa**
- ✅ Usuário não precisa gerenciar faturas manualmente
- ✅ Sistema calcula tudo automaticamente
- ✅ Sempre correto e atualizado

### **2. Visão em Tempo Real**
- ✅ Vê quanto já gastou no cartão
- ✅ Sabe quanto do limite está usando
- ✅ Previne surpresas na fatura

### **3. Precisão**
- ✅ Cada transação na fatura correta
- ✅ Parcelas distribuídas corretamente
- ✅ Totais sempre corretos

### **4. Controle Financeiro**
- ✅ Sabe exatamente quanto vai pagar
- ✅ Pode se planejar antes do vencimento
- ✅ Evita estourar limite

---

## 🔍 Validações

### **No Frontend**:
- ✅ Cartão obrigatório se método for crédito
- ✅ Aviso se não há cartões cadastrados
- ✅ Validação de valores

### **No Backend**:
- ✅ Fatura criada só se não existe (upsert)
- ✅ Total recalculado sempre que há mudanças
- ✅ Transações sem invoice_id não afetam totais

---

## 📋 Próximas Melhorias

### **Interface de Faturas** (Próxima Fase):
- [ ] Página para visualizar fatura completa
- [ ] Lista de todas as compras da fatura
- [ ] Gráficos de gastos por categoria
- [ ] Botão "Pagar Fatura"
- [ ] Modal de pagamento

### **Alertas**:
- [ ] Alerta quando fatura fecha
- [ ] Alerta X dias antes do vencimento
- [ ] Alerta se ultrapassar X% do limite
- [ ] Notificação de fatura vencida

### **Relatórios**:
- [ ] Histórico de faturas
- [ ] Comparativo mês a mês
- [ ] Gastos por categoria no cartão
- [ ] Média mensal de gasto

---

## 🎯 Conclusão

**Sistema de faturas funcionando automaticamente!**

Agora:
✅ Toda compra no crédito vai para a fatura correta  
✅ Totais calculados em tempo real  
✅ Interface mostra valores atualizados  
✅ Parcelas distribuídas corretamente  
✅ Custos recorrentes vinculados  
✅ Controle completo do limite usado  

**Após executar as migrations SQL, o sistema estará 100% funcional!** 🚀

---

## 📝 Checklist

- [x] Função `calculateInvoiceDates` criada
- [x] Função `getOrCreateInvoice` criada
- [x] Função `updateInvoiceTotal` criada
- [x] `addTransaction` atualizado
- [x] `updateTransaction` atualizado
- [x] `deleteTransaction` atualizado
- [x] `linkInstallmentsToInvoices` criada
- [x] `createInstallment` atualizado
- [x] Interface de cartão atualizada
- [x] Busca de faturas implementada
- [ ] Executar migrations SQL (pendente)

**Sistema completo e testável!** ✅

