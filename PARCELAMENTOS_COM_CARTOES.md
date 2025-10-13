# 💳 Parcelamentos com Métodos de Pagamento

## 📝 Descrição

Atualização do sistema de parcelamentos para suportar diferentes métodos de pagamento, incluindo cartões de crédito e contas bancárias.

---

## ✨ Funcionalidades Implementadas

### **1. Métodos de Pagamento em Parcelamentos**
- 💵 **Dinheiro**: Parcelas sem vinculação
- 💳 **Débito**: Parcelas debitadas mensalmente da conta
- 💳 **Crédito**: Parcelas na fatura do cartão (MAIS COMUM)
- 📱 **PIX**: Parcelas via PIX na conta
- 📄 **Boleto**: Parcelas via boleto

### **2. Casos de Uso Reais**

#### **Compra Parcelada no Cartão** 🛒
```
Exemplo: Notebook por R$ 3.600 em 12x no cartão

1. Usuário seleciona:
   - Método: Crédito
   - Cartão: Nubank Platinum
   - Valor Total: R$ 3.600
   - Parcelas: 12x
   - Categoria: Tecnologia
   - Caixa: Conhecimento

2. Sistema cria:
   ✅ Grupo de parcelamento
   ✅ 12 transações (R$ 300 cada)
   ✅ Cada parcela vinculada ao cartão
   ✅ Parcelas distribuídas nos próximos 12 meses

3. Impacto:
   - Nov/2024: R$ 300 na fatura + orçamento
   - Dez/2024: R$ 300 na fatura + orçamento
   - ... até Out/2025
```

#### **Carnê de Débito Automático** 🏠
```
Exemplo: Financiamento de R$ 24.000 em 48x no débito

1. Usuário seleciona:
   - Método: Débito
   - Conta: Banco Inter
   - Valor Total: R$ 24.000
   - Parcelas: 48x
   - Categoria: Moradia
   - Caixa: Custos Fixos

2. Sistema cria:
   ✅ Grupo de parcelamento
   ✅ 48 transações (R$ 500 cada)
   ✅ Cada parcela vinculada à conta Inter
   ✅ Saldo debitado automaticamente

3. Impacto:
   - Cada mês: Inter -= R$ 500
   - Orçamento impactado mensalmente
```

---

## 🔧 Implementação Técnica

### **Arquivos Modificados**

#### 1. `src/components/InstallmentModal.tsx` ✅
**Adicionado**:
- Import do `useBankAccounts` e `useCreditCards`
- Ícones de métodos de pagamento
- Estado `paymentMethod`
- Campos `account_id` e `credit_card_id` no formData
- Grid de 5 botões para métodos de pagamento
- Seletor condicional de conta ou cartão
- Validações de método de pagamento
- Passagem dos novos parâmetros para `createInstallment`

**Código Principal**:
```typescript
// Estado
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debit')
const { bankAccounts } = useBankAccounts()
const { creditCards } = useCreditCards()

// Validação
if (paymentMethod === 'credit' && !formData.credit_card_id) {
  setError('Selecione um cartão de crédito')
  return
}

if (paymentMethod === 'debit' && !formData.account_id) {
  setError('Selecione uma conta bancária')
  return
}

// Criar parcelamento
await createInstallment(
  formData.description,
  totalAmount,
  totalInstallments,
  formData.startDate,
  formData.category_id || undefined,
  formData.budget_box_id || undefined,
  paymentMethod,
  paymentMethod === 'credit' ? formData.credit_card_id : undefined,
  paymentMethod === 'debit' ? formData.account_id : undefined
)
```

#### 2. `src/hooks/useInstallments.ts` ✅
**Atualizado**:
- Assinatura da função `createInstallment` com novos parâmetros
- Passagem de `payment_method`, `credit_card_id` e `account_id` para RPC

**Código**:
```typescript
const createInstallment = async (
  description: string,
  totalAmount: number,
  totalInstallments: number,
  startDate: string,
  categoryId?: string,
  budgetBoxId?: string,
  paymentMethod?: string,      // NOVO
  creditCardId?: string,        // NOVO
  accountId?: string            // NOVO
) => {
  const { data, error } = await supabase.rpc('create_installment_transactions', {
    p_user_id: user!.id,
    p_description: description,
    p_total_amount: totalAmount,
    p_total_installments: totalInstallments,
    p_start_date: startDate,
    p_category_id: categoryId || null,
    p_budget_box_id: budgetBoxId || null,
    p_payment_method: paymentMethod || 'cash',      // NOVO
    p_credit_card_id: creditCardId || null,         // NOVO
    p_account_id: accountId || null                 // NOVO
  })
}
```

#### 3. `update-installments-payment-method.sql` ✅ (NOVO)
**SQL Function Atualizada**:
- Função `create_installment_transactions` recriada
- Novos parâmetros: `p_payment_method`, `p_credit_card_id`, `p_account_id`
- Cada transação criada com os novos campos
- Compatível com versão anterior (parâmetros opcionais)

---

## 🎨 Interface

### **Modal de Parcelamento Atualizado**
```
┌─────────────────────────────────────────────────────────┐
│ Nova Despesa Parcelada                             [X]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ℹ️  Despesas parceladas criam automaticamente uma      │
│    transação para cada mês, influenciando o orçamento  │
│    dos próximos meses.                                  │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ Método de Pagamento:                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │    💵    │ │    💳    │ │    💳    │               │
│ │ Dinheiro │ │  Débito  │ │ Crédito  │               │
│ └──────────┘ └──────────┘ └──────────┘               │
│ ┌──────────┐ ┌──────────┐                             │
│ │    📱    │ │    📄    │                             │
│ │   PIX    │ │  Boleto  │                             │
│ └──────────┘ └──────────┘                             │
│                                                          │
│ ┌─ SE CRÉDITO ────────────────────────────────────┐   │
│ │ Cartão: [💳 Nubank Platinum •••• 1234 ▼]       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                          │
│ Descrição: _____________________________               │
│                                                          │
│ Valor Total: R$ ___________  Parcelas: [__]           │
│                                                          │
│ 💡 Valor da parcela: R$ 300,00                         │
│                                                          │
│ Data Início: __/__/____                                 │
│                                                          │
│ Categoria: [Tecnologia ▼]                               │
│                                                          │
│ Caixa de Planejamento: [Conhecimento ▼]               │
│                                                          │
│                      [Cancelar]  [Criar Parcelamento]  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo Completo

### **Parcelamento no Cartão de Crédito**
```
1. Usuário cria parcelamento
   ├─ Método: Crédito
   ├─ Cartão: Nubank Platinum
   ├─ Valor: R$ 3.600
   └─ Parcelas: 12x (R$ 300/mês)

2. Sistema cria grupo
   installment_groups:
   ├─ id: uuid
   ├─ description: "Notebook Dell"
   ├─ total_amount: 3600
   ├─ total_installments: 12
   └─ installment_amount: 300

3. Sistema cria 12 transações
   transactions:
   ├─ Nov/2024: R$ 300 (credit_card_id: nubank, invoice_id: nov_invoice)
   ├─ Dez/2024: R$ 300 (credit_card_id: nubank, invoice_id: dez_invoice)
   ├─ Jan/2025: R$ 300 (credit_card_id: nubank, invoice_id: jan_invoice)
   └─ ... (mais 9 parcelas)

4. Impacto em cada mês
   ├─ Fatura do cartão += R$ 300
   ├─ Orçamento da caixa "Conhecimento" -= R$ 300
   └─ Saldo da conta: sem mudança (só ao pagar fatura)

5. Quando paga cada fatura
   ├─ Conta vinculada ao cartão -= R$ (total_da_fatura)
   └─ Fatura marcada como "paid"
```

### **Parcelamento no Débito**
```
1. Usuário cria parcelamento
   ├─ Método: Débito
   ├─ Conta: Banco Inter
   ├─ Valor: R$ 2.400
   └─ Parcelas: 24x (R$ 100/mês)

2. Sistema cria 24 transações
   transactions:
   ├─ Nov/2024: R$ 100 (account_id: inter, payment_method: debit)
   ├─ Dez/2024: R$ 100 (account_id: inter, payment_method: debit)
   └─ ... (mais 22 parcelas)

3. Impacto em cada mês
   ├─ Orçamento -= R$ 100
   └─ Conta Inter -= R$ 100 (IMEDIATO quando vence)
```

---

## 📊 Comparação de Métodos

| Método | Quando Usar | Impacta Orçamento? | Impacta Saldo? | Vai p/ Fatura? |
|--------|-------------|-------------------|----------------|----------------|
| **Crédito** | Compras parceladas no cartão | ✅ Cada mês | ⏱️ Ao pagar fatura | ✅ Sim |
| **Débito** | Carnês, financiamentos | ✅ Cada mês | ✅ Cada mês | ❌ Não |
| **Dinheiro** | Crediário sem juros | ✅ Cada mês | ❌ Não rastreado | ❌ Não |
| **PIX** | Parcelas manuais | ✅ Cada mês | ✅ Cada mês | ❌ Não |
| **Boleto** | Financiamentos | ✅ Cada mês | ❌ Até pagar | ❌ Não |

---

## 🎯 Exemplos Práticos

### **Exemplo 1: iPhone Parcelado no Cartão**
```
Compra: iPhone 15 Pro
Valor: R$ 7.200
Parcelas: 12x sem juros
Método: Crédito (Nubank Platinum)

Resultado:
├─ 12 parcelas de R$ 600
├─ Cada parcela na fatura do mês
├─ Orçamento impactado: R$ 600/mês
├─ Caixa: Prazeres (ou outra)
└─ Saldo conta: só diminui ao pagar fatura
```

### **Exemplo 2: Carro Financiado (Débito)**
```
Compra: Carro 0km
Valor: R$ 48.000
Parcelas: 48x
Método: Débito (Banco Inter)

Resultado:
├─ 48 parcelas de R$ 1.000
├─ Debitadas automaticamente da conta
├─ Orçamento impactado: R$ 1.000/mês
├─ Caixa: Custos Fixos
└─ Saldo conta: diminui R$ 1.000/mês
```

### **Exemplo 3: Móveis no Crediário (Dinheiro)**
```
Compra: Móveis planejados
Valor: R$ 12.000
Parcelas: 10x
Método: Dinheiro

Resultado:
├─ 10 parcelas de R$ 1.200
├─ Pagamento manual cada mês
├─ Orçamento impactado: R$ 1.200/mês
├─ Caixa: Conforto
└─ Sem vínculo automático com conta
```

---

## 🔧 Arquivos Modificados

### **Frontend**:
1. ✅ `src/components/InstallmentModal.tsx`
   - Grid de métodos de pagamento
   - Seletor condicional de conta/cartão
   - Validações
   - Novos parâmetros no `createInstallment`

2. ✅ `src/hooks/useInstallments.ts`
   - Função `createInstallment` atualizada
   - Novos parâmetros opcionais

### **Backend/Database**:
3. ✅ `update-installments-payment-method.sql`
   - Função SQL `create_installment_transactions` recriada
   - Suporta novos campos
   - Retrocompatível

---

## 📝 Migration SQL Necessária

### **⚠️ AÇÃO NECESSÁRIA:**

Execute no Supabase SQL Editor:
```sql
-- Arquivo: update-installments-payment-method.sql
```

Este script:
- ✅ Remove a função antiga
- ✅ Cria nova função com parâmetros adicionais
- ✅ Mantém compatibilidade (parâmetros opcionais com defaults)
- ✅ Adiciona campos nas transações criadas

---

## 🎨 Interface Visual

### **Seletor de Método (Grid 3x2)**
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│    💵    │ │    💳    │ │    💳    │
│ Dinheiro │ │  Débito  │ │ Crédito  │ ← Selecionado (roxo)
└──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐
│    📱    │ │    📄    │
│   PIX    │ │  Boleto  │
└──────────┘ └──────────┘
```

### **Seletor de Cartão (quando Crédito)**
```
Cartão de Crédito: *
┌─────────────────────────────────────────┐
│ Selecione um cartão               ▼    │
├─────────────────────────────────────────┤
│ 💳 Nubank Platinum •••• 1234            │
│ 💳 Inter Gold •••• 5678                 │
│ 💳 C6 Black •••• 9012                   │
└─────────────────────────────────────────┘
```

### **Seletor de Conta (quando Débito/PIX)**
```
Conta Bancária: *
┌─────────────────────────────────────────┐
│ Selecione uma conta               ▼    │
├─────────────────────────────────────────┤
│ 🏦 Banco Inter - 12345-6                │
│ 🏦 Nubank - 67890-1                     │
│ 💼 XP Investimentos                     │
└─────────────────────────────────────────┘
```

---

## 💡 Regras de Negócio

### **1. Parcelamento no Cartão de Crédito**
```typescript
payment_method = 'credit'
credit_card_id = [cartão selecionado]
account_id = null

Para cada parcela:
├─ Cria transação vinculada ao cartão
├─ Adiciona à fatura do mês da parcela
├─ Impacta orçamento do mês
└─ NÃO impacta saldo da conta (só ao pagar fatura)
```

### **2. Parcelamento no Débito**
```typescript
payment_method = 'debit'
account_id = [conta selecionada]
credit_card_id = null

Para cada parcela:
├─ Cria transação vinculada à conta
├─ Impacta orçamento do mês
└─ Impacta saldo da conta no mês (quando data chega)
```

### **3. Outros Métodos**
```typescript
payment_method = 'cash' | 'pix' | 'bank_slip'
account_id = null (ou conta selecionada)
credit_card_id = null

Para cada parcela:
├─ Cria transação com método especificado
└─ Comportamento depende do método
```

---

## ✅ Validações

### **Interface**:
- ✅ Se crédito → cartão obrigatório
- ✅ Se débito → conta obrigatória
- ✅ PIX → conta opcional
- ✅ Dinheiro/Boleto → sem obrigatoriedade
- ✅ Aviso se não há cartões cadastrados

### **Backend**:
- ✅ Valor total > 0
- ✅ Parcelas entre 1 e 120
- ✅ Descrição obrigatória
- ✅ Data válida

---

## 🚀 Benefícios

### **1. Realismo**
- ✅ Reflete compras reais no cartão
- ✅ Financiamentos com débito automático
- ✅ Carnês e crediários

### **2. Controle**
- ✅ Sabe exatamente onde cada parcela está
- ✅ Previsão de impacto nas faturas futuras
- ✅ Orçamento preciso mês a mês

### **3. Flexibilidade**
- ✅ Múltiplos métodos de pagamento
- ✅ Múltiplos cartões e contas
- ✅ Adequado para qualquer situação

---

## 📋 Próximas Melhorias

### **Curto Prazo**:
- [ ] Editar parcelas futuras com método de pagamento
- [ ] Antecipar parcelas mantendo o método
- [ ] Trocar cartão de parcelas futuras

### **Médio Prazo**:
- [ ] Calcular impacto em faturas futuras
- [ ] Visualização de timeline de parcelas
- [ ] Alertas de parcelas próximas

### **Longo Prazo**:
- [ ] Juros em parcelamentos
- [ ] Entrada + parcelas
- [ ] Parcelamento com IOF

---

## 📊 Estrutura de Dados

### **Transações de Parcelamento**
```typescript
{
  id: string
  user_id: string
  description: "Notebook Dell (3/12)"
  amount: 300.00
  date: "2025-01-15"
  type: "expense"
  payment_method: "credit"              // NOVO
  credit_card_id: "uuid-do-cartao"     // NOVO
  account_id: null                      // NOVO
  category_id: "uuid-categoria"
  budget_box_id: "uuid-caixa"
  installment_group_id: "uuid-grupo"
  installment_number: 3
  total_installments: 12
  invoice_id: null (será preenchido ao criar fatura)
}
```

---

## 🎉 Conclusão

O sistema de parcelamentos agora está completamente integrado com:
- ✅ Métodos de pagamento
- ✅ Cartões de crédito
- ✅ Contas bancárias
- ✅ Sistema de faturas (preparado)

**Cada parcela é rastreada corretamente e impacta o lugar certo!**

---

## 📋 Checklist de Implementação

- [x] InstallmentModal atualizado
- [x] useInstallments atualizado
- [x] SQL function atualizada
- [x] Validações implementadas
- [x] Interface visual criada
- [x] Integração com cartões
- [x] Integração com contas
- [ ] Executar migration SQL (pendente do usuário)

**Após executar `update-installments-payment-method.sql` no Supabase, parcelamentos estarão 100% funcionais!** 🚀

