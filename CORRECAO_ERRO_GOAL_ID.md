# 🔧 Correção: Erro "Could not find the 'goal_id' column"

## ❌ **Erro Encontrado**

```
Error: Could not find the 'goal_id' column of 'transactions' in the schema cache
POST /rest/v1/transactions 400 (Bad Request)
```

## 🔍 **Causa do Problema**

O erro ocorre porque a coluna `goal_id` foi adicionada aos **tipos TypeScript** mas ainda **não existe no banco de dados** do Supabase.

**Colunas faltantes:**
- ❌ `transactions.goal_id` - Para vincular transações de investimento às metas
- ❌ `goal_contributions.transaction_id` - Para vincular contribuições às transações
- ❌ `goal_contributions.description` - Para descrição das contribuições
- ❌ Constraint `type = 'investment'` - Para permitir tipo de transação investimento

## ✅ **Solução**

Execute o script SQL seguro que adiciona apenas as colunas faltantes:

### **Arquivo: `fix-missing-columns-safe.sql`**

Este script:
- ✅ **Verifica** se cada coluna já existe
- ✅ **Adiciona** apenas o que está faltando
- ✅ **Pode ser executado** múltiplas vezes sem erro
- ✅ **Não causa** conflitos com dados existentes

---

## 📋 **Passo a Passo**

### **1. Acessar Supabase SQL Editor**
1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Clique em **New Query**

### **2. Executar Script Seguro**
1. Copie o conteúdo de `fix-missing-columns-safe.sql`
2. Cole no editor SQL
3. Clique em **Run** ou pressione `Ctrl+Enter`

### **3. Verificar Resultado**
Você deve ver mensagens como:
```
✅ Coluna goal_id adicionada com sucesso!
✅ Constraint de tipo atualizada com sucesso!
✅ Coluna transaction_id adicionada com sucesso!
✅ Coluna description adicionada com sucesso!
```

Ou, se já existir:
```
⏭️ Coluna goal_id já existe. Pulando...
```

### **4. Verificar Tabela de Resultados**
O script retorna uma tabela mostrando o status:
```
coluna                              | status
transactions.goal_id                | ✅ Existe
goal_contributions.transaction_id   | ✅ Existe
goal_contributions.description      | ✅ Existe
```

---

## 🎯 **O Que Cada Coluna Faz**

### **1. transactions.goal_id**
```typescript
goal_id: string | null
```
- **Função**: Vincular transações de investimento às metas
- **Uso**: Quando usuário adiciona contribuição em meta
- **Exemplo**: Transação "Investimento: Casa Própria" → vinculada à meta "Casa"

### **2. goal_contributions.transaction_id**
```typescript
transaction_id: string | null
```
- **Função**: Vincular contribuições às transações que as geraram
- **Uso**: Rastreamento bidirecional
- **Exemplo**: Contribuição de R$ 500 → vinculada à transação de investimento

### **3. goal_contributions.description**
```typescript
description: string | null
```
- **Função**: Descrição personalizada da contribuição
- **Uso**: Usuário pode adicionar nota sobre a contribuição
- **Exemplo**: "Aporte mensal janeiro", "Bônus de fim de ano"

### **4. Constraint type = 'investment'**
```sql
CHECK (type IN ('income', 'expense', 'investment'))
```
- **Função**: Permitir tipo de transação "investment"
- **Uso**: Transações que consomem orçamento mas não saem da carteira
- **Exemplo**: Aportes em metas, investimentos, poupança

---

## 🔄 **Ordem de Execução dos Scripts**

Se você ainda não executou nenhum script, execute nesta ordem:

### **1. Colunas Básicas** ✅
```sql
-- Arquivo: fix-missing-columns-safe.sql
-- Adiciona: goal_id, transaction_id, description, tipo investment
```

### **2. Parcelamentos** (Opcional)
```sql
-- Arquivo: fix-installments.sql
-- Adiciona: tabela installment_groups e campos de parcelamento
```

---

## ⚠️ **Importante**

Após executar o script SQL:
1. ✅ **Recarregue a página** do aplicativo (F5)
2. ✅ **Limpe o cache** do Supabase (pode levar alguns segundos)
3. ✅ **Teste novamente** a funcionalidade

O Supabase pode levar alguns segundos para atualizar o cache do schema.

---

## 🎯 **Teste Após Migração**

### **Teste 1: Adicionar Contribuição**
```
1. Vá em "Metas"
2. Clique em "Adicionar Contribuição" em uma meta
3. Preencha:
   - Valor: R$ 500
   - Descrição: "Teste"
   - Caixa: Selecione uma caixa
4. Clique "Adicionar"

Resultado esperado:
✅ Contribuição criada
✅ Transação de investimento criada
✅ Meta atualizada
✅ Mensagem de sucesso
```

### **Teste 2: Verificar Dashboard**
```
1. Vá para o Dashboard
2. Verifique o card "Investimentos"
3. Deve mostrar o valor da contribuição

Resultado esperado:
✅ Card mostra R$ 500
✅ Orçamento consumido aumentou
✅ Saldo da carteira não diminuiu
```

---

## 📊 **Estrutura Final do Banco**

### **Tabela: transactions**
```
Colunas existentes:
✅ id, user_id, account_id, amount, description
✅ category_id, budget_box_id
✅ date, type, is_recurring, created_at

Colunas novas:
✅ goal_id (para investimentos em metas)
✅ installment_group_id (para parcelamentos)
✅ installment_number (número da parcela)
✅ total_installments (total de parcelas)
```

### **Tabela: goal_contributions**
```
Colunas existentes:
✅ id, goal_id, amount, date
✅ source_type, source_id, created_at

Colunas novas:
✅ description (descrição da contribuição)
✅ transaction_id (vinculação com transação)
```

---

## ✅ **Checklist de Verificação**

Após executar o script, verifique:

- [ ] Coluna `transactions.goal_id` existe
- [ ] Coluna `goal_contributions.transaction_id` existe
- [ ] Coluna `goal_contributions.description` existe
- [ ] Constraint permite tipo `investment`
- [ ] Índices foram criados
- [ ] Aplicação funciona sem erros
- [ ] Contribuições em metas funcionam
- [ ] Transações de investimento são criadas

---

## 🚀 **Resumo**

**Problema**: Colunas não existem no banco de dados
**Solução**: Execute `fix-missing-columns-safe.sql`
**Resultado**: Sistema totalmente funcional

Execute o script agora e teste novamente! 🎉
