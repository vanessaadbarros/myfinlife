# 🏦 Arquitetura: Contas Bancárias, Cartões de Crédito e Transações

## 📋 Análise do Problema

### **Cenário Real de Uso:**
1. **Múltiplas Contas Bancárias**
   - Conta Salário (recebe renda)
   - Conta Investimentos (transfere para aplicações)
   - Conta Corrente (despesas do dia a dia)

2. **Cartões de Crédito**
   - Vinculados a diferentes contas
   - Faturas mensais com vencimento
   - Compras parceladas

3. **Fluxo de Dinheiro Complexo**
   - Transferências entre contas
   - Pagamentos via cartão de crédito
   - Investimentos automáticos
   - Custos recorrentes em diferentes contas

---

## 🎯 Objetivos do Sistema

1. **Rastreamento Completo**: Saber onde está cada real
2. **Visão Consolidada**: Patrimônio total em todas as contas
3. **Controle de Cartões**: Fatura atual e projeção futura
4. **Fluxo de Caixa**: Entradas e saídas por conta
5. **Conciliação**: Facilitar fechamento mensal

---

## 🗃️ Estrutura de Dados Proposta

### **1. Tabela: `bank_accounts`** (Já Existe)
```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  bank_name TEXT NOT NULL,
  account_number TEXT,
  account_type TEXT, -- 'checking', 'savings', 'investment'
  balance NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#6366f1', -- Para identificação visual
  icon TEXT DEFAULT '🏦',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **2. Tabela: `credit_cards`** (NOVA)
```sql
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  bank_account_id UUID REFERENCES bank_accounts(id), -- Conta onde a fatura é paga
  card_name TEXT NOT NULL, -- Ex: "Nubank Platinum"
  last_four_digits TEXT, -- Últimos 4 dígitos
  credit_limit NUMERIC,
  closing_day INTEGER CHECK (closing_day BETWEEN 1 AND 31), -- Dia do fechamento
  due_day INTEGER CHECK (due_day BETWEEN 1 AND 31), -- Dia do vencimento
  is_active BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#8b5cf6',
  icon TEXT DEFAULT '💳',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **3. Tabela: `transactions`** (Atualizar)
```sql
-- Adicionar novos campos
ALTER TABLE transactions ADD COLUMN account_id UUID REFERENCES bank_accounts(id);
ALTER TABLE transactions ADD COLUMN credit_card_id UUID REFERENCES credit_cards(id);
ALTER TABLE transactions ADD COLUMN payment_method TEXT; -- 'cash', 'debit', 'credit', 'transfer', 'pix'
ALTER TABLE transactions ADD COLUMN invoice_date DATE; -- Para compras no crédito
ALTER TABLE transactions ADD COLUMN is_transfer BOOLEAN DEFAULT false;
ALTER TABLE transactions ADD COLUMN transfer_to_account_id UUID REFERENCES bank_accounts(id);
```

### **4. Tabela: `credit_card_invoices`** (NOVA)
```sql
CREATE TABLE credit_card_invoices (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  credit_card_id UUID REFERENCES credit_cards(id),
  reference_month DATE NOT NULL, -- Mês de referência (YYYY-MM-01)
  closing_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open', -- 'open', 'closed', 'paid', 'overdue'
  payment_transaction_id UUID REFERENCES transactions(id), -- Transação de pagamento
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);
```

### **5. Tabela: `recurring_transactions`** (Atualizar)
```sql
-- Adicionar campo para conta e cartão
ALTER TABLE recurring_transactions ADD COLUMN account_id UUID REFERENCES bank_accounts(id);
ALTER TABLE recurring_transactions ADD COLUMN credit_card_id UUID REFERENCES credit_cards(id);
ALTER TABLE recurring_transactions ADD COLUMN payment_method TEXT;
```

---

## 🔄 Fluxos de Operação

### **Fluxo 1: Recebimento de Salário**
```
1. Usuário registra transação de RECEITA
   - Tipo: income
   - Conta: Conta Salário
   - Método: transfer/pix
   
2. Sistema atualiza saldo da Conta Salário
   - balance += valor_recebido
```

### **Fluxo 2: Transferência Entre Contas**
```
1. Usuário registra TRANSFERÊNCIA
   - Tipo: expense (na conta origem)
   - Conta Origem: Conta Salário
   - Conta Destino: Conta Investimentos
   - is_transfer: true
   
2. Sistema cria transação AUTOMÁTICA de receita
   - Tipo: income (na conta destino)
   - Conta: Conta Investimentos
   - Vinculada à transação de saída
   
3. Atualiza saldos
   - Conta Salário: balance -= valor
   - Conta Investimentos: balance += valor
```

### **Fluxo 3: Compra no Cartão de Crédito**
```
1. Usuário registra DESPESA no cartão
   - Tipo: expense
   - Método: credit
   - Cartão: Nubank Platinum
   - Data da Compra: hoje
   - invoice_date: calculada automaticamente (próximo fechamento)
   
2. Sistema NÃO atualiza saldo da conta imediatamente
   - Saldo da conta só muda quando a fatura é paga
   
3. Sistema adiciona valor à fatura do mês
   - Busca/Cria invoice do cartão para o mês
   - invoice.total_amount += valor_compra
   
4. Sistema vincula à caixa de planejamento
   - budget_box_id é preenchido
   - Impacta orçamento do mês da compra
```

### **Fluxo 4: Compra Parcelada no Cartão**
```
1. Usuário registra despesa parcelada
   - Tipo: expense
   - Método: credit
   - Cartão: selecionado
   - Parcelas: 12x
   
2. Sistema cria installment_group
   
3. Sistema cria 12 transações futuras
   - Cada uma vinculada ao cartão
   - invoice_date calculada para cada mês
   - Distribuídas nos próximos 12 meses
   
4. Cada parcela impacta a fatura do seu mês
```

### **Fluxo 5: Fechamento e Pagamento de Fatura**
```
1. Sistema detecta dia de fechamento
   - Busca cartões com closing_day = hoje
   - Calcula total de despesas do período
   
2. Sistema cria/atualiza invoice
   - status: 'closed'
   - total_amount: soma de todas as despesas
   - due_date: calculada
   
3. Usuário registra pagamento da fatura
   - Tipo: expense
   - Conta: Conta vinculada ao cartão
   - Descrição: "Pagamento Fatura [Cartão] [Mês/Ano]"
   - payment_method: 'debit' ou 'transfer'
   
4. Sistema atualiza
   - invoice.status = 'paid'
   - invoice.paid_amount = total_amount
   - invoice.payment_transaction_id
   - Atualiza saldo da conta: balance -= total_amount
```

### **Fluxo 6: Custo Recorrente no Cartão**
```
1. Usuário cadastra custo recorrente
   - Ex: Netflix R$ 39,90/mês
   - Método: credit
   - Cartão: Nubank
   - Frequência: monthly
   
2. Sistema gera transação automaticamente todo mês
   - Vinculada ao cartão
   - Adicionada à fatura do mês
   - Impacta caixa de planejamento
```

---

## 📊 Interfaces do Usuário

### **1. Dashboard: Visão Consolidada**
```
┌─────────────────────────────────────────────────────────┐
│ 💰 Patrimônio Total: R$ 15.450,00                       │
│                                                          │
│ 🏦 Contas Bancárias                Total: R$ 12.300,00  │
│   • Banco Inter (Salário)         R$ 5.800,00          │
│   • Nubank (Corrente)              R$ 3.200,00          │
│   • XP Investimentos               R$ 3.300,00          │
│                                                          │
│ 💳 Cartões de Crédito              Fatura: R$ 3.150,00  │
│   • Nubank Platinum               R$ 2.100,00 (vence 15/11) │
│   • Inter Gold                    R$ 1.050,00 (vence 20/11) │
│                                                          │
│ ⚠️ Próximos Compromissos                                │
│   • Pagar fatura Nubank           R$ 2.100,00 (em 5 dias)  │
│   • Aluguel (débito conta Inter)  R$ 1.800,00 (em 8 dias)  │
└─────────────────────────────────────────────────────────┘
```

### **2. Página: Contas Bancárias**
```
┌─────────────────────────────────────────────────────────┐
│ 🏦 Minhas Contas Bancárias                    [+ Nova]  │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🏦 Banco Inter - Conta Salário                      │ │
│ │ Ag: 0001 • CC: 12345-6                              │ │
│ │                                                      │ │
│ │ Saldo: R$ 5.800,00                    [Ver Extrato] │ │
│ │                                                      │ │
│ │ Últimas movimentações:                              │ │
│ │ • 01/11 - Salário                    + R$ 6.000,00  │ │
│ │ • 01/11 - Transfer. p/ Investimentos - R$ 1.000,00  │ │
│ │ • 03/11 - Aluguel (débito)           - R$ 1.800,00  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Outras contas...]                                       │
└─────────────────────────────────────────────────────────┘
```

### **3. Página: Cartões de Crédito**
```
┌─────────────────────────────────────────────────────────┐
│ 💳 Meus Cartões de Crédito                    [+ Novo]  │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💳 Nubank Platinum •••• 1234                        │ │
│ │ Pago por: Nubank (Corrente)                         │ │
│ │                                                      │ │
│ │ Fatura Atual (Novembro/2024)                        │ │
│ │ R$ 2.100,00                                          │ │
│ │ Fecha: 10/11 • Vence: 15/11            [Ver Fatura] │ │
│ │                                                      │ │
│ │ Próxima Fatura (Dezembro/2024)                      │ │
│ │ R$ 856,00 (previsão)                  [Ver Despesas]│ │
│ │                                                      │ │
│ │ Limite: R$ 8.000,00 • Disponível: R$ 5.044,00      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **4. Modal: Nova Transação (Atualizado)**
```
┌─────────────────────────────────────────────────────────┐
│ Nova Transação                                     [X]  │
│                                                          │
│ Tipo:  ( ) Receita  (•) Despesa  ( ) Investimento      │
│                                                          │
│ Descrição: ________________________________             │
│                                                          │
│ Valor: R$ ____________                                  │
│                                                          │
│ Data: __/__/____                                        │
│                                                          │
│ Categoria: [Alimentação ▼]                              │
│                                                          │
│ Caixa de Planejamento: [Conforto ▼]                    │
│                                                          │
│ Método de Pagamento:                                    │
│   ( ) Dinheiro                                          │
│   ( ) Débito                                            │
│   (•) Crédito                                           │
│   ( ) PIX                                               │
│   ( ) Transferência                                     │
│                                                          │
│ ┌─ Se DÉBITO, PIX ou DINHEIRO ─────────────────────┐   │
│ │ Conta: [Banco Inter (Salário) ▼]                 │   │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
│ ┌─ Se CRÉDITO ─────────────────────────────────────┐   │
│ │ Cartão: [Nubank Platinum ▼]                      │   │
│ │ [ ] Parcelar em: [__] vezes                      │   │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
│ Observações: ____________________________               │
│                                                          │
│                      [Cancelar]  [Salvar]               │
└─────────────────────────────────────────────────────────┘
```

### **5. Página: Fatura do Cartão**
```
┌─────────────────────────────────────────────────────────┐
│ 💳 Fatura - Nubank Platinum                    [Voltar] │
│                                                          │
│ Novembro/2024                                            │
│ Fecha: 10/11 • Vence: 15/11                             │
│                                                          │
│ Total: R$ 2.100,00                    [ Pagar Fatura ]  │
│                                                          │
│ Despesas:                                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 01/11 - Supermercado XYZ            R$ 238,50       │ │
│ │ 03/11 - Netflix (recorrente)        R$ 39,90        │ │
│ │ 05/11 - Restaurante ABC             R$ 187,00       │ │
│ │ 08/11 - Gasolina Shell              R$ 250,00       │ │
│ │ 09/11 - Compra parcelada 3/12       R$ 125,00       │ │
│ │ ...                                                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Por Categoria:                                           │
│ • Alimentação: R$ 425,50                                │
│ • Transporte: R$ 250,00                                 │
│ • Lazer: R$ 187,00                                      │
│ • Assinaturas: R$ 39,90                                 │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🧮 Cálculos e Regras de Negócio

### **1. Saldo da Conta Bancária**
```typescript
saldo_conta = saldo_inicial 
            + soma(receitas_na_conta)
            - soma(despesas_debito_na_conta)
            - soma(pagamentos_fatura_cartao)
            + soma(transferencias_recebidas)
            - soma(transferencias_enviadas)
```

### **2. Total da Fatura do Cartão**
```typescript
total_fatura = soma(despesas_cartao_no_periodo)
             + soma(parcelas_cartao_no_periodo)
             + soma(custos_recorrentes_cartao_no_periodo)
```

### **3. Patrimônio Total**
```typescript
patrimonio_total = soma(saldos_todas_contas)
                 - soma(faturas_cartao_em_aberto)
```

### **4. Disponível para Gastar**
```typescript
disponivel = saldo_conta - faturas_pendentes_desta_conta
```

### **5. Impacto no Orçamento**
- **Compras no crédito**: Impactam o orçamento do mês da COMPRA, não do pagamento
- **Pagamento de fatura**: NÃO impacta orçamento (já foi contabilizado)
- **Transferências**: NÃO impactam orçamento (movimentação entre contas)

---

## 🎨 Componentes a Criar/Atualizar

### **Novos Componentes:**
1. `CreditCardsList.tsx` - Lista de cartões
2. `CreditCardModal.tsx` - Cadastro/edição de cartão
3. `CreditCardInvoice.tsx` - Visualização de fatura
4. `PayInvoiceModal.tsx` - Pagamento de fatura
5. `AccountTransferModal.tsx` - Transferência entre contas
6. `CreditCardSelector.tsx` - Seletor de cartão
7. `PaymentMethodSelector.tsx` - Seletor de método de pagamento
8. `ConsolidatedBalance.tsx` - Visão consolidada de patrimônio

### **Componentes a Atualizar:**
1. `TransactionModal.tsx` - Adicionar seleção de conta/cartão
2. `BankAccountsList.tsx` - Mostrar extrato por conta
3. `RecurringTransactionModal.tsx` - Adicionar conta/cartão
4. `InstallmentModal.tsx` - Adicionar opção de cartão
5. `Dashboard.tsx` - Adicionar visão de cartões e faturas

### **Hooks a Criar:**
1. `useCreditCards.ts` - Gerenciar cartões
2. `useInvoices.ts` - Gerenciar faturas
3. `useAccountTransfer.ts` - Transferências
4. `useConsolidatedBalance.ts` - Patrimônio consolidado

---

## 🔍 Exemplos de Queries

### **1. Buscar Despesas de uma Fatura**
```sql
SELECT t.*
FROM transactions t
JOIN credit_cards cc ON t.credit_card_id = cc.id
WHERE t.user_id = $1
  AND t.credit_card_id = $2
  AND t.payment_method = 'credit'
  AND t.date >= $3 -- data início período
  AND t.date < $4  -- data fim período
ORDER BY t.date DESC;
```

### **2. Calcular Total da Fatura**
```sql
SELECT 
  cc.id as card_id,
  cc.card_name,
  SUM(t.amount) as total_amount,
  COUNT(t.id) as transaction_count
FROM credit_cards cc
LEFT JOIN transactions t ON t.credit_card_id = cc.id
  AND t.payment_method = 'credit'
  AND t.date >= $1 -- data início
  AND t.date < $2  -- data fim
WHERE cc.user_id = $3
  AND cc.is_active = true
GROUP BY cc.id, cc.card_name;
```

### **3. Patrimônio Consolidado**
```sql
-- Saldo em contas
SELECT 
  SUM(balance) as total_in_accounts
FROM bank_accounts
WHERE user_id = $1 AND is_active = true;

-- Faturas pendentes
SELECT 
  SUM(total_amount - paid_amount) as total_pending_invoices
FROM credit_card_invoices
WHERE user_id = $1 
  AND status IN ('open', 'closed', 'overdue');

-- Patrimônio líquido
SELECT 
  (SELECT SUM(balance) FROM bank_accounts WHERE user_id = $1 AND is_active = true) -
  (SELECT COALESCE(SUM(total_amount - paid_amount), 0) 
   FROM credit_card_invoices 
   WHERE user_id = $1 AND status IN ('open', 'closed', 'overdue'))
AS net_worth;
```

---

## 📝 Próximos Passos de Implementação

### **Fase 1: Estrutura Básica de Cartões** ✅ Parcial
- [x] Tabela `bank_accounts` (já existe)
- [ ] Tabela `credit_cards`
- [ ] Tabela `credit_card_invoices`
- [ ] Atualizar `transactions` com novos campos
- [ ] Criar migrations SQL

### **Fase 2: Interface de Cartões**
- [ ] Página de listagem de cartões
- [ ] Modal de cadastro/edição de cartão
- [ ] Visualização de fatura
- [ ] Componente de seleção de cartão no TransactionModal

### **Fase 3: Lógica de Faturas**
- [ ] Hook `useInvoices`
- [ ] Cálculo automático de total de fatura
- [ ] Fechamento automático de fatura
- [ ] Alerta de vencimento próximo

### **Fase 4: Pagamento de Faturas**
- [ ] Modal de pagamento de fatura
- [ ] Integração com conta bancária
- [ ] Atualização de saldo após pagamento
- [ ] Histórico de faturas pagas

### **Fase 5: Transferências e Visão Consolidada**
- [ ] Modal de transferência entre contas
- [ ] Transações vinculadas (origem/destino)
- [ ] Patrimônio consolidado no dashboard
- [ ] Relatório de fluxo de caixa por conta

### **Fase 6: Integração Completa**
- [ ] Custos recorrentes com cartão
- [ ] Parcelamentos com cartão
- [ ] Projeção de faturas futuras
- [ ] Alertas inteligentes

---

## 💡 Dicas e Boas Práticas

1. **Separação de Responsabilidades**
   - Conta bancária: Dinheiro disponível AGORA
   - Cartão de crédito: Dívida futura a pagar
   - Fatura: Consolidação de gastos do período

2. **Impacto no Orçamento**
   - Compra no crédito impacta orçamento do mês da compra
   - Pagamento de fatura NÃO impacta orçamento (evita duplicação)

3. **Transferências**
   - Sempre criar transações vinculadas
   - Marcar como `is_transfer: true`
   - Não impactar caixas de planejamento

4. **Conciliação**
   - Permitir recalcular saldos baseado em transações
   - Botão "Recalcular Saldo" em cada conta
   - Verificar consistência entre fatura e transações

5. **UX**
   - Cor e ícone por conta/cartão para fácil identificação
   - Mostrar conta/cartão em cada transação
   - Alertas visuais para faturas próximas do vencimento

---

## 🎯 Conclusão

Este sistema permite um controle financeiro completo e profissional, considerando:
- ✅ Múltiplas contas bancárias
- ✅ Múltiplos cartões de crédito
- ✅ Transferências entre contas
- ✅ Faturas de cartão
- ✅ Custos recorrentes
- ✅ Compras parceladas
- ✅ Visão consolidada de patrimônio
- ✅ Rastreamento completo do dinheiro

**Próximo passo recomendado**: Começar pela Fase 2, criando as tabelas e migrations necessárias.

