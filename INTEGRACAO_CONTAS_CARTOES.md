# 🏦💳 Integração: Contas Bancárias e Cartões de Crédito

## 📝 Descrição

Sistema integrado para gerenciar contas bancárias e cartões de crédito em uma única interface com abas, facilitando a visualização e o controle financeiro completo.

---

## ✨ Implementação Realizada

### **1. Página Unificada: Contas e Cartões**
**Arquivo**: `src/pages/BankAccounts.tsx`

**Funcionalidades**:
- ✅ **Sistema de Abas**: Alterna entre Contas Bancárias e Cartões de Crédito
- ✅ **Contadores**: Badge mostrando quantidade de cada tipo
- ✅ **Interface Consistente**: Design unificado e responsivo
- ✅ **Gerenciamento Completo**: Criar, editar e excluir em ambas as abas

---

## 🎨 Interface Visual

### **Estrutura da Página**
```
┌─────────────────────────────────────────────────────────┐
│ 🏦 Contas e Cartões                         [← Voltar] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [🏦 Contas Bancárias (3)] [💳 Cartões de Crédito (2)] │
│ ════════════════════════                                │
│                                                          │
│ ┌─ ABA ATIVA ─────────────────────────────────────────┐│
│ │                                                       ││
│ │  [Conteúdo dinâmico baseado na aba selecionada]     ││
│ │                                                       ││
│ └───────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### **Aba: Contas Bancárias**
- Lista de contas bancárias (componente existente)
- Botão "Nova Conta"
- Saldos e ações (editar, excluir, recalcular)

### **Aba: Cartões de Crédito**
```
┌─────────────────────────────────────────────────────────┐
│ Meus Cartões de Crédito              [+ Novo Cartão]   │
│                                                          │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │ 💳 Nubank    │ │ 💳 Inter     │ │ 💳 C6 Bank   │    │
│ │ Platinum     │ │ Gold         │ │ Black        │    │
│ │ •••• 1234    │ │ •••• 5678    │ │ •••• 9012    │    │
│ │              │ │              │ │              │    │
│ │ Limite:      │ │ Limite:      │ │ Limite:      │    │
│ │ R$ 8.000     │ │ R$ 5.000     │ │ R$ 10.000    │    │
│ │              │ │              │ │              │    │
│ │ Fecha: 10    │ │ Fecha: 5     │ │ Fecha: 15    │    │
│ │ Vence: 15    │ │ Vence: 10    │ │ Vence: 20    │    │
│ │              │ │              │ │              │    │
│ │ Pago por:    │ │ Pago por:    │ │ Pago por:    │    │
│ │ Nubank       │ │ Inter        │ │ C6 Bank      │    │
│ │              │ │              │ │              │    │
│ │ Fatura Atual │ │ Fatura Atual │ │ Fatura Atual │    │
│ │ R$ 0,00      │ │ R$ 0,00      │ │ R$ 0,00      │    │
│ │              │ │              │ │              │    │
│ │ [Editar]     │ │ [Editar]     │ │ [Editar]     │    │
│ │ [Excluir]    │ │ [Excluir]    │ │ [Excluir]    │    │
│ └──────────────┘ └──────────────┘ └──────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Criados/Atualizados

### **1. Hooks**

#### `src/hooks/useCreditCards.ts` ✅
```typescript
export function useCreditCards() {
  return {
    creditCards,      // Lista de cartões
    loading,          // Estado de carregamento
    error,            // Erros
    addCreditCard,    // Adicionar cartão
    updateCreditCard, // Atualizar cartão
    deleteCreditCard, // Excluir cartão
    getCardSummary,   // Resumo do cartão (limite, fatura)
    refresh,          // Recarregar dados
  }
}
```

#### `src/hooks/useInvoices.ts` ✅
```typescript
export function useInvoices(creditCardId?: string) {
  return {
    invoices,                  // Lista de faturas
    loading,                   // Estado de carregamento
    error,                     // Erros
    getInvoiceByMonth,         // Buscar fatura específica
    getInvoiceTransactions,    // Transações da fatura
    calculateInvoiceTotal,     // Calcular total
    upsertInvoice,             // Criar/atualizar fatura
    payInvoice,                // Pagar fatura
    getUpcomingInvoices,       // Faturas próximas
    getOverdueInvoices,        // Faturas vencidas
    updateOverdueInvoices,     // Atualizar status
    refresh,                   // Recarregar dados
  }
}
```

#### `src/hooks/useAccountTransfer.ts` ✅
```typescript
export function useAccountTransfer() {
  return {
    transferBetweenAccounts, // Transferir entre contas
  }
}
```

### **2. Componentes**

#### `src/components/CreditCardModal.tsx` ✅
**Campos**:
- Nome do cartão *
- Últimos 4 dígitos
- Bandeira (Visa, Mastercard, Elo, etc.)
- Limite de crédito *
- Dia de fechamento *
- Dia de vencimento *
- Conta para pagamento
- Ícone (seletor visual)
- Cor (seletor visual)
- Observações
- Cartão ativo (checkbox)

**Validações**:
- Nome obrigatório
- Limite >= 0
- Dia de fechamento entre 1-31
- Dia de vencimento entre 1-31

### **3. Páginas**

#### `src/pages/BankAccounts.tsx` ✅ (Atualizada)
**Mudanças**:
- Título alterado para "Contas e Cartões"
- Sistema de abas adicionado
- Integração de cartões de crédito
- Layout consistente com outras páginas

---

## 🗂️ Tipos TypeScript Atualizados

### **Novas Tabelas**:
```typescript
// src/types/supabase.ts

credit_cards: {
  Row: {
    id: string
    user_id: string
    bank_account_id: string | null      // Conta vinculada
    card_name: string
    last_four_digits: string | null
    card_network: string | null
    credit_limit: number
    closing_day: number                 // Dia do fechamento
    due_day: number                     // Dia do vencimento
    is_active: boolean
    color: string
    icon: string
    notes: string | null
    created_at: string
    updated_at: string
  }
  Insert: { /* ... */ }
  Update: { /* ... */ }
}

credit_card_invoices: {
  Row: {
    id: string
    user_id: string
    credit_card_id: string
    reference_month: string             // Mês de referência
    closing_date: string
    due_date: string
    total_amount: number
    paid_amount: number
    status: 'open' | 'closed' | 'paid' | 'overdue' | 'partial'
    payment_transaction_id: string | null
    notes: string | null
    created_at: string
    updated_at: string
    paid_at: string | null
  }
  Insert: { /* ... */ }
  Update: { /* ... */ }
}
```

### **Tabelas Atualizadas**:

#### `transactions`:
- `credit_card_id`: Cartão usado na compra
- `payment_method`: cash, debit, credit, pix, transfer, bank_slip
- `invoice_date`: Data da fatura (para crédito)
- `is_transfer`: Marcador de transferência
- `transfer_to_account_id`: Conta destino
- `linked_transaction_id`: Transação vinculada
- `invoice_id`: Fatura do cartão

#### `bank_accounts`:
- `account_type`: checking, savings, investment
- `color`: Cor para UI
- `icon`: Emoji para UI

#### `recurring_transactions`:
- `account_id`: Conta vinculada
- `credit_card_id`: Cartão vinculado
- `payment_method`: Forma de pagamento

---

## 🔄 Fluxo de Uso

### **1. Acessar Contas e Cartões**
```
Sidebar → "Contas e Cartões" → Página unificada
```

### **2. Gerenciar Contas**
```
Aba "Contas Bancárias" → Visualizar/Adicionar/Editar contas
```

### **3. Gerenciar Cartões**
```
Aba "Cartões de Crédito" → [+ Novo Cartão] → Preencher formulário
```

### **4. Visualizar Cartão**
```
Card do cartão mostra:
├─ Nome e últimos 4 dígitos
├─ Limite de crédito
├─ Dia de fechamento e vencimento
├─ Conta onde a fatura é paga
├─ Bandeira do cartão
├─ Fatura atual (quando implementado)
└─ Botões: Editar, Excluir
```

---

## 📋 Navegação Atualizada

### **Sidebar**
```
🏠 Dashboard
💳 Transações
📊 Relatórios
🎯 Metas
💼 Investimentos
🔄 Custos Recorrentes
🏦 Contas e Cartões  ← ATUALIZADO
⚙️  Configurações
```

### **Rotas**
- `/bank-accounts` - Contas e Cartões (página unificada)
- `/credit-cards` - REMOVIDA (integrada em bank-accounts)

---

## 💡 Vantagens da Integração

### **1. UX Melhorada**
- ✅ **Centralização**: Tudo relacionado a dinheiro em um só lugar
- ✅ **Navegação Simplificada**: Menos itens no menu
- ✅ **Contexto Claro**: Cartões vinculados às contas ficam visualmente próximos

### **2. Organização Lógica**
- ✅ **Relacionamento Natural**: Cartões são pagos por contas
- ✅ **Hierarquia Clara**: Contas → Cartões → Faturas → Transações
- ✅ **Fluxo Intuitivo**: Usuário alterna facilmente entre abas

### **3. Desenvolvimento**
- ✅ **Menos Código**: Uma página ao invés de duas
- ✅ **Manutenção Facilitada**: Mudanças em um único lugar
- ✅ **Consistência**: Layout e comportamento uniformes

---

## 🎯 Próximos Passos

### **Fase Atual**: Interface Básica ✅
- [x] Hook useCreditCards
- [x] Hook useInvoices
- [x] Hook useAccountTransfer
- [x] Componente CreditCardModal
- [x] Página integrada (BankAccounts)
- [x] Navegação atualizada

### **Próximas Implementações**:

1. **Integração com Transações** 🎯 PRÓXIMO
   - [ ] Atualizar TransactionModal
   - [ ] Seletor de método de pagamento
   - [ ] Seletor de conta/cartão baseado no método
   - [ ] Lógica de atualização de saldo/fatura

2. **Sistema de Faturas**
   - [ ] Cálculo automático de total de fatura
   - [ ] Fechamento automático de faturas
   - [ ] Visualização de fatura detalhada
   - [ ] Modal de pagamento de fatura

3. **Transferências**
   - [ ] Modal de transferência entre contas
   - [ ] Validação de saldo
   - [ ] Criação de transações vinculadas

4. **Dashboard**
   - [ ] Card de resumo de cartões
   - [ ] Alertas de faturas próximas
   - [ ] Patrimônio consolidado

---

## 📊 Estrutura de Dados

### **Relacionamentos**:
```
user
  ├─ bank_accounts
  │   └─ transactions (account_id)
  │
  └─ credit_cards
      ├─ bank_account_id (conta para pagar fatura)
      ├─ credit_card_invoices
      │   └─ transactions (invoice_id)
      └─ transactions (credit_card_id)
```

### **Fluxo de Dados**:
1. **Conta Bancária** armazena dinheiro real
2. **Cartão de Crédito** vinculado a uma conta
3. **Transações no crédito** vinculadas ao cartão e à fatura
4. **Fatura fechada** é paga através da conta vinculada
5. **Saldo da conta** atualiza apenas no pagamento da fatura

---

## 🔍 Exemplo de Uso

### **Cenário: Usuário João**

**1. Cadastra Contas**:
```
Aba "Contas Bancárias"
├─ Inter (Salário) - R$ 5.000
├─ Nubank (Corrente) - R$ 2.000
└─ XP (Investimentos) - R$ 10.000
```

**2. Cadastra Cartões**:
```
Aba "Cartões de Crédito"
├─ Nubank Platinum
│  ├─ Limite: R$ 8.000
│  ├─ Fecha: dia 10
│  ├─ Vence: dia 15
│  └─ Pago por: Nubank (Corrente)
│
└─ Inter Gold
   ├─ Limite: R$ 5.000
   ├─ Fecha: dia 5
   ├─ Vence: dia 10
   └─ Pago por: Inter (Salário)
```

**3. Visualização**:
- Alterna entre abas para ver contas ou cartões
- Vê saldo total nas contas
- Vê limite disponível nos cartões
- Edita facilmente clicando no card

---

## 🎨 Design System

### **Cores**:
- **Contas Bancárias**: Cyan (`text-cyan-600`, `bg-cyan-100`)
- **Cartões de Crédito**: Purple (`text-purple-600`, `bg-purple-100`)

### **Ícones**:
- **Contas**: `Building2` (🏦)
- **Cartões**: `CreditCard` (💳)

### **Estados Visuais**:
- **Aba Ativa**: Borda colorida, texto colorido, background colorido no badge
- **Aba Inativa**: Cinza, hover suave
- **Conta/Cartão Inativo**: Badge "Inativo"

---

## ✅ Benefícios

1. **Simplicidade**: Menu mais limpo
2. **Contexto**: Contas e cartões relacionados visualmente
3. **Eficiência**: Menos cliques para alternar
4. **Escalabilidade**: Fácil adicionar mais abas se necessário
5. **Consistência**: Mesmo padrão das "Transações" com abas

---

## 📁 Arquivos Modificados

### **Criados**:
- ✅ `src/hooks/useCreditCards.ts`
- ✅ `src/hooks/useInvoices.ts`
- ✅ `src/hooks/useAccountTransfer.ts`
- ✅ `src/components/CreditCardModal.tsx`
- ✅ `src/types/supabase.ts` (atualizado)

### **Atualizados**:
- ✅ `src/pages/BankAccounts.tsx` - Integração de cartões
- ✅ `src/components/Sidebar.tsx` - Mudança de label
- ✅ `src/App.tsx` - Remoção de rota `/credit-cards`

### **Removidos**:
- ✅ `src/pages/CreditCards.tsx` - Funcionalidade integrada

---

## 🚀 Status

**Fase 1**: ✅ CONCLUÍDA
- [x] Base de dados (tipos TypeScript)
- [x] Hooks de gerenciamento
- [x] Interface básica
- [x] Integração com contas

**Fase 2**: 🔄 EM ANDAMENTO
- [ ] Integração com transações
- [ ] Sistema de faturas
- [ ] Transferências entre contas

**Próximo Passo**: Atualizar `TransactionModal` para incluir seleção de método de pagamento e cartão de crédito.

---

## 🎉 Conclusão

A integração de Contas Bancárias e Cartões de Crédito em uma única página oferece uma experiência mais coesa e intuitiva. O usuário agora tem uma visão completa de todo o seu dinheiro e crédito disponível em um único local, com navegação simplificada por abas.

**Sistema pronto para próxima fase: Integração com Transações!** 🚀

