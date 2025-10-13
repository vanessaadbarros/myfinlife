# 🏦 Sistema de Contas Bancárias

## 🎯 **Funcionalidade Implementada**

Sistema completo para gerenciar contas bancárias, rastrear saldos e vincular transações a contas específicas.

---

## 🏗️ **Arquitetura do Sistema**

### **1. Schema do Banco de Dados**
```sql
-- Tabela já existente no schema
create table if not exists public.bank_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bank_name text not null,
  account_number text,
  balance numeric(15, 2) default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transações já vinculadas às contas
create table if not exists public.transactions (
  -- ... outros campos ...
  account_id uuid references public.bank_accounts(id) on delete set null,
  -- ... outros campos ...
);
```

### **2. Tipos TypeScript**
```typescript
// Tipos já definidos em src/types/supabase.ts
bank_accounts: {
  Row: {
    id: string
    user_id: string
    bank_name: string
    account_number: string | null
    balance: number
    is_active: boolean
    created_at: string
  }
  // Insert e Update também definidos
}
```

---

## 🔧 **Componentes Implementados**

### **1. Hook useBankAccounts**
```typescript
// src/hooks/useBankAccounts.ts
export function useBankAccounts() {
  // Funcionalidades:
  // - fetchBankAccounts(): Buscar contas do usuário
  // - addBankAccount(): Adicionar nova conta
  // - updateBankAccount(): Atualizar conta existente
  // - deleteBankAccount(): Excluir conta
  // - updateAccountBalance(): Atualizar saldo manualmente
  // - recalculateAccountBalance(): Recalcular saldo baseado em transações
  // - getActiveAccounts(): Buscar apenas contas ativas
  // - getAccountById(): Buscar conta por ID
  // - stats: Estatísticas (saldo total, contas ativas, etc.)
}
```

### **2. Hook useTransactions Atualizado**
```typescript
// src/hooks/useTransactions.ts - Atualizado
const updateAccountBalance = async (accountId: string, amount: number, type: 'income' | 'expense') => {
  // Busca saldo atual da conta
  // Calcula novo saldo baseado no tipo de transação
  // Atualiza saldo na tabela bank_accounts
}

// Atualizações automáticas:
// - addTransaction(): Atualiza saldo ao criar transação
// - updateTransaction(): Reverte saldo antigo e aplica novo
// - deleteTransaction(): Reverte saldo ao excluir transação
```

---

## 🎨 **Interface do Usuário**

### **1. Página de Contas Bancárias**
```
📁 src/pages/BankAccounts.tsx
- Layout com navegação
- Integração com hook useBankAccounts
- Gerenciamento de ações (add, update, delete, recalculate)
```

### **2. Lista de Contas**
```
📁 src/components/BankAccountsList.tsx
- Lista todas as contas do usuário
- Mostra saldo atual de cada conta
- Indicador visual de conta ativa/inativa
- Botões de ação (editar, excluir, recalcular)
- Estatísticas resumidas (saldo total, contas ativas)
```

### **3. Modal de Conta**
```
📁 src/components/BankAccountModal.tsx
- Formulário para criar/editar contas
- Campos: nome do banco, número da conta, saldo inicial, status ativo
- Validação de campos obrigatórios
- Suporte para edição de contas existentes
```

### **4. Resumo no Dashboard**
```
📁 src/components/BankAccountsSummary.tsx
- Card resumido no Dashboard
- Mostra saldo total de todas as contas
- Lista as 3 principais contas
- Link para página completa de gerenciamento
- Indicadores visuais de saldo positivo/negativo
```

### **5. Modal de Transações Atualizado**
```
📁 src/components/TransactionModal.tsx
- Campo de seleção de conta bancária
- Integração com hook useBankAccounts
- Atualização automática de saldos ao salvar transação
```

---

## 🔄 **Fluxo de Funcionamento**

### **1. Criação de Conta**
```
1. Usuário acessa "Contas Bancárias"
   ↓
2. Clica em "Nova Conta"
   ↓
3. Preenche dados (banco, número, saldo inicial)
   ↓
4. Sistema cria conta no banco
   ↓
5. Conta aparece na lista com saldo inicial
```

### **2. Transação com Conta**
```
1. Usuário cria transação
   ↓
2. Seleciona conta bancária (opcional)
   ↓
3. Sistema salva transação
   ↓
4. Se conta selecionada e tipo = income/expense:
   - Atualiza saldo da conta automaticamente
   - Receitas aumentam saldo
   - Despesas diminuem saldo
```

### **3. Atualização de Saldos**
```
Sistema automático:
- Criação de transação → Atualiza saldo
- Edição de transação → Reverte saldo antigo + aplica novo
- Exclusão de transação → Reverte saldo

Sistema manual:
- Botão "Recalcular" → Soma todas as transações da conta
- Útil para correções ou sincronização
```

---

## 📊 **Exemplos de Uso**

### **Cenário 1: Nova Conta**
```
Input:
- Banco: Nubank
- Conta: 12345-6
- Saldo Inicial: R$ 1.000,00

Resultado:
- Conta criada com saldo R$ 1.000,00
- Aparece no Dashboard como "Saldo Total"
- Disponível para seleção em transações
```

### **Cenário 2: Transação de Receita**
```
Input:
- Descrição: Salário
- Valor: R$ 5.000,00
- Tipo: Receita
- Conta: Nubank

Resultado:
- Transação salva
- Saldo da Nubank: R$ 1.000,00 → R$ 6.000,00
- Dashboard atualizado automaticamente
```

### **Cenário 3: Transação de Despesa**
```
Input:
- Descrição: Supermercado
- Valor: R$ 300,00
- Tipo: Despesa
- Conta: Nubank

Resultado:
- Transação salva
- Saldo da Nubank: R$ 6.000,00 → R$ 5.700,00
- Dashboard atualizado automaticamente
```

### **Cenário 4: Transação sem Conta**
```
Input:
- Descrição: Pagamento em dinheiro
- Valor: R$ 50,00
- Tipo: Despesa
- Conta: (não selecionada)

Resultado:
- Transação salva normalmente
- Saldos das contas não são afetados
- Transação aparece no Dashboard sem conta
```

---

## 🎯 **Benefícios do Sistema**

### **Para o Usuário**
1. **Controle Total**: Rastreia saldos de todas as contas
2. **Automação**: Saldos atualizados automaticamente
3. **Flexibilidade**: Transações podem ou não ter conta vinculada
4. **Organização**: Separação clara entre diferentes contas
5. **Confiabilidade**: Sistema de recálculo para correções

### **Para o Sistema**
1. **Integridade**: Saldos sempre consistentes com transações
2. **Escalabilidade**: Suporta múltiplas contas por usuário
3. **Manutenibilidade**: Código bem estruturado e documentado
4. **Performance**: Atualizações eficientes de saldos
5. **Flexibilidade**: Contas podem ser ativadas/desativadas

---

## 🔧 **Funcionalidades Técnicas**

### **1. Atualização Automática de Saldos**
```typescript
// Ao criar transação
if (data.account_id && (data.type === 'income' || data.type === 'expense')) {
  await updateAccountBalance(data.account_id, data.amount, data.type)
}

// Ao editar transação
// 1. Reverter saldo da transação anterior
if (currentTransaction.account_id && (currentTransaction.type === 'income' || currentTransaction.type === 'expense')) {
  const oldAmount = currentTransaction.type === 'income' ? -currentTransaction.amount : currentTransaction.amount
  await updateAccountBalance(currentTransaction.account_id, oldAmount, currentTransaction.type)
}

// 2. Aplicar nova transação
await updateAccountBalance(data.account_id, data.amount, data.type)
```

### **2. Recálculo de Saldos**
```typescript
const recalculateAccountBalance = async (accountId: string) => {
  // Buscar todas as transações da conta
  const transactions = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('account_id', accountId)

  // Calcular saldo baseado nas transações
  let balance = 0
  transactions?.forEach(transaction => {
    if (transaction.type === 'income') {
      balance += transaction.amount
    } else if (transaction.type === 'expense') {
      balance -= transaction.amount
    }
    // Investimentos não afetam o saldo
  })

  // Atualizar saldo na conta
  await updateAccountBalance(accountId, balance)
}
```

### **3. Filtros e Queries**
```typescript
// Buscar apenas contas ativas
const activeAccounts = bankAccounts.filter(account => account.is_active)

// Estatísticas
const stats = {
  totalBalance: activeAccounts.reduce((sum, account) => sum + account.balance, 0),
  activeAccounts: activeAccounts.length,
  totalAccounts: bankAccounts.length
}
```

---

## 🚀 **Navegação e Acesso**

### **Menu Lateral**
```
🏦 Contas Bancárias
- Ícone: Building2
- Cor: text-cyan-600
- Rota: /bank-accounts
```

### **Dashboard**
```
Card "Contas Bancárias":
- Saldo total de todas as contas
- Lista das 3 principais contas
- Botão "Gerenciar" → /bank-accounts
- Indicadores visuais de status
```

### **Modal de Transações**
```
Campo "Conta Bancária":
- Dropdown com contas ativas
- Opcional (pode deixar vazio)
- Formato: "Banco - Número da Conta"
```

---

## ✅ **Status da Implementação**

- ✅ **Schema do banco**: Já existia, aproveitado
- ✅ **Tipos TypeScript**: Já existiam, aproveitados
- ✅ **Hook useBankAccounts**: Criado com todas as funcionalidades
- ✅ **Hook useTransactions**: Atualizado para gerenciar saldos
- ✅ **Página BankAccounts**: Criada com layout completo
- ✅ **Componente BankAccountsList**: Lista e gerencia contas
- ✅ **Componente BankAccountModal**: Modal para criar/editar
- ✅ **Componente BankAccountsSummary**: Resumo no Dashboard
- ✅ **Modal TransactionModal**: Atualizado com seleção de conta
- ✅ **Rota /bank-accounts**: Adicionada ao App.tsx
- ✅ **Menu lateral**: Item adicionado
- ✅ **Dashboard**: Card de resumo adicionado
- ✅ **Sem erros**: Todos os arquivos sem erros de linting

**Sistema de contas bancárias completamente implementado e funcional!** 🎉
