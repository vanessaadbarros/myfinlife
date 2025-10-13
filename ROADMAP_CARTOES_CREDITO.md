# 🗺️ Roadmap: Sistema de Cartões de Crédito

## 📊 Resumo Executivo

Este roadmap detalha a implementação de um sistema completo de gestão de cartões de crédito integrado ao sistema financeiro existente, permitindo controle de múltiplos cartões, faturas, e rastreamento preciso de gastos.

---

## 🎯 Objetivos

1. ✅ **Gestão de Cartões**: Cadastro e controle de múltiplos cartões
2. ✅ **Faturas Automáticas**: Cálculo e fechamento automático de faturas
3. ✅ **Integração com Contas**: Vínculo de cartões com contas para pagamento
4. ✅ **Rastreamento Completo**: Toda compra no crédito vinculada ao cartão
5. ✅ **Transferências**: Movimentação de dinheiro entre contas próprias
6. ✅ **Visão Consolidada**: Patrimônio real descontando dívidas

---

## 📦 Fase 1: Base de Dados e Backend

### ✅ Etapa 1.1: Executar Migration SQL
**Arquivos**: `migration-credit-cards-system.sql`

**Ações**:
```bash
# No Supabase SQL Editor, executar:
migration-credit-cards-system.sql
```

**Resultado**:
- ✅ Tabela `credit_cards` criada
- ✅ Tabela `credit_card_invoices` criada
- ✅ Campos adicionados em `transactions`
- ✅ Campos adicionados em `recurring_transactions`
- ✅ Campos adicionados em `bank_accounts`
- ✅ RLS configurado
- ✅ Funções auxiliares criadas
- ✅ Views criadas

---

### ✅ Etapa 1.2: Atualizar Types TypeScript
**Arquivo**: `src/types/supabase.ts`

**Adicionar**:
```typescript
credit_cards: {
  Row: {
    id: string
    user_id: string
    bank_account_id: string | null
    card_name: string
    last_four_digits: string | null
    card_network: string | null
    credit_limit: number
    closing_day: number
    due_day: number
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
    reference_month: string
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

**Atualizar em `transactions`**:
```typescript
credit_card_id: string | null
payment_method: 'cash' | 'debit' | 'credit' | 'pix' | 'transfer' | 'bank_slip'
invoice_date: string | null
is_transfer: boolean
transfer_to_account_id: string | null
linked_transaction_id: string | null
invoice_id: string | null
```

---

## 🎨 Fase 2: Hooks e Lógica de Negócio

### ✅ Etapa 2.1: Hook useCreditCards
**Arquivo**: `src/hooks/useCreditCards.ts`

**Funcionalidades**:
- `fetchCreditCards()` - Buscar cartões do usuário
- `addCreditCard()` - Adicionar novo cartão
- `updateCreditCard()` - Atualizar cartão existente
- `deleteCreditCard()` - Excluir cartão
- `getCardSummary()` - Resumo com limite disponível

---

### ✅ Etapa 2.2: Hook useInvoices
**Arquivo**: `src/hooks/useInvoices.ts`

**Funcionalidades**:
- `fetchInvoices()` - Buscar faturas
- `getInvoiceByMonth()` - Fatura específica do mês
- `getInvoiceTransactions()` - Transações da fatura
- `calculateInvoiceTotal()` - Calcular total
- `payInvoice()` - Registrar pagamento
- `getUpcomingInvoices()` - Faturas próximas do vencimento

---

### ✅ Etapa 2.3: Hook useAccountTransfer
**Arquivo**: `src/hooks/useAccountTransfer.ts`

**Funcionalidades**:
- `transferBetweenAccounts()` - Criar transferência
  - Cria transação de saída na conta origem
  - Cria transação de entrada na conta destino
  - Vincula as duas transações
  - Atualiza saldos

---

### ✅ Etapa 2.4: Atualizar Hook useTransactions
**Arquivo**: `src/hooks/useTransactions.ts`

**Adicionar lógica**:
```typescript
// Ao adicionar transação com cartão de crédito
if (payment_method === 'credit' && credit_card_id) {
  // Calcular data da fatura
  const invoiceDate = calculateInvoiceDate(credit_card_id, transaction.date)
  
  // Buscar ou criar fatura
  const invoice = await getOrCreateInvoice(credit_card_id, invoiceDate)
  
  // Vincular transação à fatura
  transaction.invoice_id = invoice.id
  
  // NÃO atualizar saldo da conta (só quando pagar a fatura)
}

// Ao adicionar transação com débito/pix/dinheiro
if (payment_method !== 'credit' && account_id) {
  // Atualizar saldo da conta imediatamente
  await updateAccountBalance(account_id, amount, type)
}
```

---

## 🖥️ Fase 3: Interface - Cartões

### ✅ Etapa 3.1: Página de Cartões
**Arquivo**: `src/pages/CreditCards.tsx`

**Componentes**:
- Header com título e botão "Novo Cartão"
- Lista de cartões com resumo:
  - Nome do cartão e últimos dígitos
  - Fatura atual e próxima
  - Limite disponível
  - Barra de progresso do limite
  - Botões: Ver Fatura, Editar, Excluir
- Integração com `Layout`

---

### ✅ Etapa 3.2: Modal de Cartão
**Arquivo**: `src/components/CreditCardModal.tsx`

**Campos**:
- Nome do cartão
- Últimos 4 dígitos
- Bandeira (Visa, Mastercard, Elo, etc.)
- Limite de crédito
- Dia do fechamento
- Dia do vencimento
- Conta para pagamento (select de bank_accounts)
- Cor para identificação
- Ícone emoji
- Observações

---

### ✅ Etapa 3.3: Componente de Card do Cartão
**Arquivo**: `src/components/CreditCardItem.tsx`

**Visual**:
```
┌─────────────────────────────────────────────────────┐
│ 💳 Nubank Platinum •••• 1234                        │
│ Pago por: Nubank (Corrente)                         │
│                                                      │
│ Fatura Atual: R$ 2.100,00 (vence em 5 dias)        │
│ Próxima Fatura: R$ 856,00                           │
│                                                      │
│ Limite: R$ 8.000,00                                 │
│ [████████████████░░░░░░░░] 73% usado                │
│                                                      │
│ [Ver Fatura] [Editar] [Excluir]                    │
└─────────────────────────────────────────────────────┘
```

---

## 📄 Fase 4: Interface - Faturas

### ✅ Etapa 4.1: Página de Fatura
**Arquivo**: `src/pages/CreditCardInvoice.tsx`

**Seções**:
1. **Header**:
   - Nome do cartão
   - Mês de referência
   - Status da fatura
   - Botão "Pagar Fatura"

2. **Resumo**:
   - Total da fatura
   - Valor pago
   - Saldo devedor
   - Data de fechamento
   - Data de vencimento

3. **Lista de Transações**:
   - Data, Descrição, Categoria, Valor
   - Filtros por categoria
   - Ordenação

4. **Gráfico**:
   - Pizza com gastos por categoria

---

### ✅ Etapa 4.2: Modal de Pagamento de Fatura
**Arquivo**: `src/components/PayInvoiceModal.tsx`

**Campos**:
- Conta de pagamento (select)
- Valor total da fatura (readonly)
- Valor a pagar (editável para pagamento parcial)
- Data do pagamento
- Observações

**Ação**:
```typescript
const handlePayInvoice = async () => {
  // 1. Criar transação de despesa na conta
  const transaction = await addTransaction({
    type: 'expense',
    amount: paymentAmount,
    description: `Pagamento Fatura ${cardName} ${month}/${year}`,
    date: paymentDate,
    account_id: selectedAccountId,
    payment_method: 'debit',
    // NÃO vincula a caixa de planejamento (evita duplicação)
  })
  
  // 2. Atualizar fatura
  await updateInvoice(invoiceId, {
    paid_amount: currentPaidAmount + paymentAmount,
    status: isPaidInFull ? 'paid' : 'partial',
    payment_transaction_id: transaction.id,
    paid_at: isPaidInFull ? new Date() : null
  })
  
  // 3. Atualizar saldo da conta
  await updateAccountBalance(selectedAccountId, -paymentAmount)
}
```

---

## 🔄 Fase 5: Integrações

### ✅ Etapa 5.1: Atualizar TransactionModal
**Arquivo**: `src/components/TransactionModal.tsx`

**Adicionar**:
1. **Seletor de Método de Pagamento**:
   - Radio buttons: Dinheiro, Débito, Crédito, PIX, Transferência

2. **Condicional para Débito/PIX**:
   ```tsx
   {(paymentMethod === 'debit' || paymentMethod === 'pix') && (
     <Select
       label="Conta Bancária"
       value={accountId}
       onChange={setAccountId}
       options={bankAccounts}
     />
   )}
   ```

3. **Condicional para Crédito**:
   ```tsx
   {paymentMethod === 'credit' && (
     <>
       <Select
         label="Cartão de Crédito"
         value={creditCardId}
         onChange={setCreditCardId}
         options={creditCards}
       />
       <Checkbox
         label="Parcelar compra"
         checked={isInstallment}
         onChange={setIsInstallment}
       />
       {isInstallment && (
         <Input
           label="Número de parcelas"
           type="number"
           value={installments}
           onChange={setInstallments}
         />
       )}
     </>
   )}
   ```

---

### ✅ Etapa 5.2: Atualizar RecurringTransactionModal
**Arquivo**: `src/components/RecurringTransactionModal.tsx`

**Adicionar**:
- Seletor de método de pagamento
- Seletor de conta (se débito/pix)
- Seletor de cartão (se crédito)

**Lógica**:
- Ao gerar transações mensais, usar o método e conta/cartão configurados

---

### ✅ Etapa 5.3: Atualizar InstallmentModal
**Arquivo**: `src/components/InstallmentModal.tsx`

**Adicionar**:
- Opção de pagamento no cartão de crédito
- Seletor de cartão
- Cada parcela futura vinculada ao cartão

---

### ✅ Etapa 5.4: Criar Modal de Transferência
**Arquivo**: `src/components/AccountTransferModal.tsx`

**Campos**:
- Conta origem (select)
- Conta destino (select)
- Valor
- Data
- Descrição/Observação

**Validação**:
- Conta origem ≠ conta destino
- Valor > 0
- Saldo suficiente na origem

---

## 📊 Fase 6: Dashboard e Visão Consolidada

### ✅ Etapa 6.1: Atualizar Dashboard
**Arquivo**: `src/pages/Dashboard.tsx`

**Adicionar Seção de Cartões**:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  {/* Resumo de Cartões */}
  <Card>
    <h3>💳 Cartões de Crédito</h3>
    <div className="space-y-3">
      {creditCards.map(card => (
        <CreditCardSummaryItem 
          key={card.id}
          card={card}
          currentInvoice={card.current_invoice}
        />
      ))}
    </div>
    <Button onClick={() => navigate('/credit-cards')}>
      Ver Todos
    </Button>
  </Card>

  {/* Próximas Faturas a Vencer */}
  <Card>
    <h3>⏰ Faturas Próximas</h3>
    <div className="space-y-2">
      {upcomingInvoices.map(invoice => (
        <InvoiceAlert 
          key={invoice.id}
          invoice={invoice}
        />
      ))}
    </div>
  </Card>
</div>
```

**Atualizar Cards de Resumo**:
- Patrimônio Líquido = Saldo em Contas - Faturas Pendentes
- Avisar se há faturas vencidas

---

### ✅ Etapa 6.2: Componente de Patrimônio Consolidado
**Arquivo**: `src/components/ConsolidatedBalance.tsx`

**Visual**:
```
┌─────────────────────────────────────────────────────┐
│ 💰 Patrimônio Total                                 │
│                                                      │
│ Saldo em Contas:           R$ 12.300,00            │
│ Faturas Pendentes:         - R$ 3.150,00           │
│ ────────────────────────────────────────────────    │
│ Patrimônio Líquido:        R$ 9.150,00             │
│                                                      │
│ 📊 Distribuição:                                    │
│ • Banco Inter:             R$ 5.800,00 (47,1%)     │
│ • Nubank:                  R$ 3.200,00 (26,0%)     │
│ • XP Investimentos:        R$ 3.300,00 (26,8%)     │
└─────────────────────────────────────────────────────┘
```

---

### ✅ Etapa 6.3: Alertas Inteligentes
**Arquivo**: `src/components/FinancialAlerts.tsx`

**Tipos de Alerta**:
1. 🔴 **Urgente**: Fatura vencida
2. 🟡 **Atenção**: Fatura vence em 3 dias
3. 🔵 **Info**: Fatura próxima do limite
4. 🟢 **Sucesso**: Todas as faturas em dia

---

## 🔗 Fase 7: Navegação e UX

### ✅ Etapa 7.1: Atualizar Sidebar
**Arquivo**: `src/components/Sidebar.tsx`

**Adicionar Item**:
```typescript
{
  id: 'credit-cards',
  label: 'Cartões de Crédito',
  icon: <CreditCard size={20} />,
  path: '/credit-cards',
  color: 'text-purple-600'
},
```

---

### ✅ Etapa 7.2: Atualizar Router
**Arquivo**: `src/App.tsx`

**Adicionar Rotas**:
```typescript
<Route path="/credit-cards" element={
  <ProtectedRoute>
    <CreditCards />
  </ProtectedRoute>
} />

<Route path="/credit-cards/:cardId/invoice/:invoiceId" element={
  <ProtectedRoute>
    <CreditCardInvoice />
  </ProtectedRoute>
} />
```

---

### ✅ Etapa 7.3: Quick Actions
**Arquivo**: `src/components/QuickActions.tsx`

**Adicionar**:
```typescript
{
  id: 'pay-invoice',
  title: 'Pagar Fatura',
  description: 'Registrar pagamento',
  icon: <CreditCard />,
  color: 'bg-purple-500',
  onClick: () => setPayInvoiceModalOpen(true)
},
{
  id: 'transfer',
  title: 'Transferência',
  description: 'Entre contas',
  icon: <ArrowLeftRight />,
  color: 'bg-blue-500',
  onClick: () => setTransferModalOpen(true)
}
```

---

## ✅ Fase 8: Testes e Ajustes Finais

### ✅ Etapa 8.1: Testes de Fluxo
**Cenários**:
1. ✅ Cadastrar novo cartão
2. ✅ Fazer compra no crédito
3. ✅ Verificar fatura sendo formada
4. ✅ Pagar fatura
5. ✅ Verificar saldo atualizado
6. ✅ Fazer transferência entre contas
7. ✅ Compra parcelada no cartão
8. ✅ Custo recorrente no cartão

---

### ✅ Etapa 8.2: Validações
- [ ] Não permitir excluir conta com faturas pendentes
- [ ] Não permitir excluir cartão com transações
- [ ] Validar limite de crédito
- [ ] Validar datas de fechamento e vencimento
- [ ] Alertar sobre saldo insuficiente em transferências

---

### ✅ Etapa 8.3: Performance
- [ ] Indexar queries de faturas
- [ ] Cache de resumo de cartões
- [ ] Paginação em lista de transações da fatura

---

## 📅 Cronograma Sugerido

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| 1 | Base de Dados | 1 dia |
| 2 | Hooks e Lógica | 2-3 dias |
| 3 | Interface - Cartões | 2 dias |
| 4 | Interface - Faturas | 2 dias |
| 5 | Integrações | 3 dias |
| 6 | Dashboard | 1-2 dias |
| 7 | Navegação e UX | 1 dia |
| 8 | Testes | 2 dias |

**Total**: 14-16 dias de desenvolvimento

---

## 🎯 Prioridades

### **Must Have (Essencial)** 🔴
1. Cadastro de cartões
2. Transação com cartão
3. Visualização de fatura
4. Pagamento de fatura
5. Transferência entre contas

### **Should Have (Importante)** 🟡
6. Limite disponível
7. Alertas de vencimento
8. Patrimônio consolidado
9. Compras parceladas no cartão
10. Custos recorrentes no cartão

### **Nice to Have (Desejável)** 🟢
11. Gráficos de gastos por cartão
12. Comparativo de faturas
13. Metas de gastos por cartão
14. Exportação de fatura PDF
15. Notificações push

---

## 📚 Documentação de Referência

- `ARQUITETURA_CONTAS_E_CARTOES.md` - Arquitetura completa
- `migration-credit-cards-system.sql` - SQL de criação
- `SISTEMA_CONTAS_BANCARIAS.md` - Sistema atual de contas

---

## ✅ Checklist de Implementação

- [ ] **Fase 1**: Executar migration SQL
- [ ] **Fase 2**: Criar hooks
- [ ] **Fase 3**: Criar interfaces de cartões
- [ ] **Fase 4**: Criar interfaces de faturas
- [ ] **Fase 5**: Integrar com sistema existente
- [ ] **Fase 6**: Atualizar dashboard
- [ ] **Fase 7**: Atualizar navegação
- [ ] **Fase 8**: Testar e ajustar

**Status**: 📋 Planejamento Completo - Pronto para Implementação

