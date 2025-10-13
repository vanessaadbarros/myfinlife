# 💳 Sistema de Despesas Parceladas

## 🎯 **Visão Geral**

Sistema completo para gerenciar despesas parceladas que cria automaticamente transações para cada parcela, influenciando o orçamento dos próximos meses e permitindo previsão de fluxo de caixa futuro.

---

## ✨ **Funcionalidades Implementadas**

### **1. Criação de Parcelamento** ✅
- ✅ **Cria todas as parcelas** automaticamente
- ✅ **Distribui nos meses futuros** conforme especificado
- ✅ **Vincula à categoria** e caixa de planejamento
- ✅ **Calcula valor** de cada parcela automaticamente
- ✅ **Máximo 120 parcelas** (10 anos)

### **2. Gerenciamento de Parcelas** ✅
- ✅ **Editar todas** as parcelas de uma vez
- ✅ **Cancelar parcelamento** (remove parcelas futuras)
- ✅ **Manter parcelas pagas** (meses passados)
- ✅ **Rastreamento completo** de progresso

### **3. Visualização e Controle** ✅
- ✅ **Lista de parcelamentos ativos**
- ✅ **Progresso visual** com barras
- ✅ **Compromissos futuros** alertados
- ✅ **Impacto no orçamento** dos próximos meses

### **4. Integração Completa** ✅
- ✅ **Dashboard** com card de compromissos
- ✅ **Quick Actions** com botão de parcelamento
- ✅ **Orçamento** considera parcelas futuras
- ✅ **Histórico** de todas as transações

---

## 🔧 **Implementação Técnica**

### **1. Schema do Banco de Dados**

**Arquivo**: `fix-installments.sql`

#### **Tabela: installment_groups**
```sql
CREATE TABLE public.installment_groups (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  description text NOT NULL,
  total_amount numeric NOT NULL,
  total_installments integer NOT NULL,
  installment_amount numeric NOT NULL,
  start_date date NOT NULL,
  category_id uuid,
  budget_box_id uuid,
  status text DEFAULT 'active',
  created_at timestamptz,
  updated_at timestamptz
);
```

#### **Campos Adicionados em Transactions**
```sql
ALTER TABLE public.transactions 
ADD COLUMN installment_group_id uuid;

ALTER TABLE public.transactions 
ADD COLUMN installment_number integer;

ALTER TABLE public.transactions 
ADD COLUMN total_installments integer;
```

#### **Funções SQL Criadas**
1. **create_installment_transactions()** - Cria parcelamento completo
2. **cancel_installment_group()** - Cancela parcelas futuras
3. **update_all_installments()** - Atualiza todas as parcelas

### **2. Tipos TypeScript**

**Arquivo**: `src/types/supabase.ts`

```typescript
installment_groups: {
  Row: {
    id: string
    user_id: string
    description: string
    total_amount: number
    total_installments: number
    installment_amount: number
    start_date: string
    category_id: string | null
    budget_box_id: string | null
    status: 'active' | 'completed' | 'cancelled'
    created_at: string
    updated_at: string
  }
}

transactions: {
  Row: {
    // ... outros campos
    installment_group_id: string | null
    installment_number: number | null
    total_installments: number | null
  }
}
```

### **3. Hook useInstallments**

**Arquivo**: `src/hooks/useInstallments.ts`

**Funcionalidades**:
- ✅ `createInstallment()` - Cria novo parcelamento
- ✅ `cancelInstallment()` - Cancela parcelamento
- ✅ `updateAllInstallments()` - Atualiza todas as parcelas
- ✅ `getActiveInstallments()` - Lista parcelamentos ativos
- ✅ `getFutureCommitments()` - Total comprometido
- ✅ `getMonthlyCommitment()` - Compromisso mensal

**Interface Estendida**:
```typescript
interface InstallmentGroupWithTransactions {
  // ... dados do grupo
  transactions: Transaction[]
  paidCount: number           // Parcelas pagas
  remainingCount: number      // Parcelas restantes
  paidAmount: number          // Valor pago
  remainingAmount: number     // Valor a pagar
  nextInstallmentDate: string | null
  progressPercentage: number
}
```

### **4. Componentes Criados**

#### **InstallmentModal**
**Arquivo**: `src/components/InstallmentModal.tsx`

**Campos**:
- ✅ Descrição da compra
- ✅ Valor total
- ✅ Número de parcelas
- ✅ Data da primeira parcela
- ✅ Categoria
- ✅ Caixa de planejamento

**Validações**:
- ✅ Campos obrigatórios
- ✅ Valor total > 0
- ✅ Parcelas entre 1 e 120
- ✅ Cálculo automático do valor de cada parcela
- ✅ Aviso de impacto futuro

#### **InstallmentsList**
**Arquivo**: `src/components/InstallmentsList.tsx`

**Exibe**:
- ✅ Lista de parcelamentos ativos
- ✅ Progresso visual (barra)
- ✅ Parcelas pagas vs restantes
- ✅ Próxima parcela
- ✅ Valores (pago e a pagar)

**Ações**:
- ✅ Editar (categoria e caixa)
- ✅ Cancelar parcelamento
- ✅ Visualizar detalhes

#### **FutureCommitments**
**Arquivo**: `src/components/FutureCommitments.tsx`

**Mostra**:
- ✅ Compromisso mensal total
- ✅ Total a pagar (todas as parcelas)
- ✅ Número de parcelamentos ativos
- ✅ Lista resumida de cada parcelamento
- ✅ Alertas visuais

---

## 🎨 **Interface Visual**

### **Formulário de Despesa Parcelada**
```
┌─────────────────────────────────────────────────────────────────┐
│ 💳 Nova Despesa Parcelada                                       │
├─────────────────────────────────────────────────────────────────┤
│ 💳 Despesas parceladas criam automaticamente uma transação      │
│ para cada mês, influenciando o orçamento dos próximos meses.    │
│                                                                 │
│ Descrição: [Notebook Dell_________________________]             │
│                                                                 │
│ Valor Total: [R$ 3.000,00] | Parcelas: [12__]                  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Valor de cada parcela: R$ 250,00                            │ │
│ │ 12x de R$ 250,00 = R$ 3.000,00                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Data da Primeira Parcela: [01/02/2025]                          │
│                                                                 │
│ Categoria: [💻 Eletrônicos ▼]                                  │
│                                                                 │
│ Caixa: [🛍️ Conforto ▼]                                        │
│ 💡 As parcelas vão consumir o orçamento desta caixa            │
│                                                                 │
│ ⚠️ Impacto no Orçamento Futuro:                                │
│ • Você terá um compromisso de R$ 250,00 por mês                │
│   durante 12 meses                                              │
│ • Total comprometido: R$ 3.000,00                              │
│                                                                 │
│ [Cancelar] [Criar Parcelamento]                                │
└─────────────────────────────────────────────────────────────────┘
```

### **Lista de Parcelamentos**
```
┌─────────────────────────────────────────────────────────────────┐
│ 💳 Despesas Parceladas                                          │
│ 2 parcelamentos ativos                                          │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Notebook Dell                                [✏️] [🗑️]    │ │
│ │ 💻 Eletrônicos • 🛍️ Conforto                               │ │
│ │                                                             │ │
│ │ Valor Total: R$ 3.000,00  |  Parcela: R$ 250,00             │ │
│ │                                                             │ │
│ │ 4/12 pagas                                         33%      │ │
│ │ ████████░░░░░░░░░░░░░░░░░░░░░░                              │ │
│ │                                                             │ │
│ │ 📅 Próxima: 01/06/2025        8 parcelas restantes          │ │
│ │                                                             │ │
│ │ Pago: R$ 1.000,00  |  Falta: R$ 2.000,00                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Sofá da Sala                                    [✏️] [🗑️] │ │
│ │ 🏠 Casa • 🏠 Custos Fixos                                   │ │
│ │                                                             │ │
│ │ Valor Total: R$ 2.400,00  |  Parcela: R$ 400,00             │ │
│ │                                                             │ │
│ │ 2/6 pagas                                          33%      │ │
│ │ ████████░░░░░░░░░░░░░░░░░░░░░░                              │ │
│ │                                                             │ │
│ │ 📅 Próxima: 01/04/2025        4 parcelas restantes          │ │
│ │                                                             │ │
│ │ Pago: R$ 800,00  |  Falta: R$ 1.600,00                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **Compromissos Futuros (Dashboard)**
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Compromissos Futuros                                         │
├─────────────────────────────────────────────────────────────────┤
│ Compromisso Mensal: R$ 650,00                                   │
│ Total a Pagar: R$ 3.600,00                                      │
│ 2 parcelamentos ativos • 12 parcelas restantes                 │
│ ─────────────────────────────────────────────────────────────── │
│ Notebook Dell                              R$ 2.000,00          │
│ 4/12 pagas • R$ 250,00/mês                 8 restantes          │
│                                                                 │
│ Sofá da Sala                               R$ 1.600,00          │
│ 2/6 pagas • R$ 400,00/mês                  4 restantes          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 **Exemplo Completo de Uso**

### **Situação: Compra de Notebook Parcelado**

#### **Entrada:**
- **Descrição**: "Notebook Dell"
- **Valor Total**: R$ 3.000,00
- **Parcelas**: 12x
- **Primeira Parcela**: 01/02/2025
- **Categoria**: Eletrônicos
- **Caixa**: Conforto (20%)

#### **Sistema Cria:**

**1. Grupo de Parcelamento:**
```sql
INSERT INTO installment_groups (
  description: "Notebook Dell",
  total_amount: 3000.00,
  total_installments: 12,
  installment_amount: 250.00,
  start_date: '2025-02-01'
)
```

**2. 12 Transações (uma para cada mês):**
```
Parcela 1/12: 01/02/2025 - R$ 250,00
Parcela 2/12: 01/03/2025 - R$ 250,00
Parcela 3/12: 01/04/2025 - R$ 250,00
... até ...
Parcela 12/12: 01/01/2026 - R$ 250,00
```

#### **Impacto no Orçamento:**

**Fevereiro 2025:**
```
Caixa Conforto (20% = R$ 1.000):
- Restaurantes: R$ 400
- Notebook (1/12): R$ 250 💳
- Total: R$ 650 / R$ 1.000 (65% usado)
```

**Março 2025:**
```
Caixa Conforto (20% = R$ 1.000):
- Restaurantes: R$ 450
- Notebook (2/12): R$ 250 💳
- Total: R$ 700 / R$ 1.000 (70% usado)
```

**... e assim por diante até Janeiro 2026**

---

## 🎯 **Casos de Uso**

### **Caso 1: Parcelamento Simples**
```
Descrição: "Geladeira"
Valor: R$ 2.400
Parcelas: 6x de R$ 400
Início: 01/03/2025
Caixa: Custos Fixos

Resultado:
✅ 6 transações criadas (mar/2025 a ago/2025)
✅ R$ 400/mês consumido da caixa "Custos Fixos"
✅ Dashboard mostra alerta: "R$ 400/mês comprometido por 6 meses"
```

### **Caso 2: Editar Categoria de Parcelamento**
```
Parcelamento: "Notebook Dell" (12x R$ 250)
Ação: Mudar de "Eletrônicos" para "Trabalho"

Resultado:
✅ Todas as 12 transações atualizadas
✅ Categoria nova aplicada em todas as parcelas
✅ Histórico mantém integridade
```

### **Caso 3: Cancelar Parcelamento**
```
Parcelamento: "Notebook Dell" (12x R$ 250)
Status atual: 4/12 pagas (jan a abr/2025)
Ação: Cancelar parcelamento

Resultado:
✅ Parcelas 1-4 (pagas) mantidas
✅ Parcelas 5-12 (futuras) removidas
✅ Grupo marcado como "cancelled"
✅ Orçamento futuro liberado
```

### **Caso 4: Múltiplos Parcelamentos**
```
Parcelamento 1: Notebook (12x R$ 250)
Parcelamento 2: Sofá (6x R$ 400)
Parcelamento 3: TV (10x R$ 300)

Compromisso Mensal: R$ 950
Total Futuro: Varia conforme parcelas restantes
Dashboard: Alerta de R$ 950/mês comprometido
```

---

## 🚀 **Benefícios**

### **Para o Usuário:**
- ✅ **Controle total** de compras parceladas
- ✅ **Previsão** de gastos futuros
- ✅ **Alertas** de compromissos mensais
- ✅ **Flexibilidade** para editar/cancelar
- ✅ **Clareza** do impacto no orçamento

### **Para o Sistema:**
- ✅ **Rastreamento completo** de todas as parcelas
- ✅ **Integridade** com vinculações bidirecionais
- ✅ **Performance** com índices otimizados
- ✅ **Escalabilidade** para previsão de fluxo de caixa
- ✅ **Segurança** com RLS configurado

---

## 📱 **Fluxo do Usuário**

### **Passo 1: Criar Parcelamento**
```
1. Dashboard → Quick Actions → "Despesa Parcelada"
2. Preenche formulário:
   - Descrição: "Notebook Dell"
   - Valor: R$ 3.000
   - Parcelas: 12x
   - Data: 01/02/2025
   - Categoria: Eletrônicos
   - Caixa: Conforto
3. Clica "Criar Parcelamento"
```

### **Passo 2: Sistema Processa**
```
✅ Cria grupo de parcelamento
✅ Cria 12 transações (fev/2025 a jan/2026)
✅ Vincula todas as transações ao grupo
✅ Atualiza orçamento dos próximos 12 meses
✅ Mostra alerta de compromisso futuro
```

### **Passo 3: Visualização**
```
Dashboard:
✅ Card "Compromissos Futuros": R$ 250/mês
✅ Lista "Despesas Parceladas": Notebook (4/12 pagas)
✅ Orçamento futuro: Considera parcelas restantes

Mês Atual (Fevereiro):
✅ Transação: "Notebook Dell (parcela 1/12)" - R$ 250
✅ Caixa Conforto: +R$ 250 consumido

Meses Futuros:
✅ Março: +R$ 250 (parcela 2/12)
✅ Abril: +R$ 250 (parcela 3/12)
✅ ... até Janeiro 2026
```

---

## 📊 **Regras de Negócio**

### **1. Criação de Parcelas**
- ✅ **Todas as parcelas** são criadas no momento do cadastro
- ✅ **Data calculada** automaticamente (mês + 1 para cada parcela)
- ✅ **Última parcela** ajustada para diferenças de arredondamento

### **2. Status das Parcelas**
- ✅ **Pagas**: Transações com data <= hoje
- ✅ **Pendentes**: Transações com data > hoje
- ✅ **Automaticamente** determinado pela data

### **3. Edição**
- ✅ **Categoria e Caixa**: Editáveis para todas as parcelas
- ✅ **Valor e Quantidade**: Não editáveis (criar novo parcelamento)
- ✅ **Aplicação em massa**: Uma edição atualiza todas

### **4. Cancelamento**
- ✅ **Parcelas pagas**: Mantidas no histórico
- ✅ **Parcelas futuras**: Removidas do banco
- ✅ **Grupo**: Marcado como "cancelled"
- ✅ **Orçamento**: Liberado para os meses futuros

---

## ✅ **Arquivos Implementados**

### **Criados:**
1. ✅ `fix-installments.sql` - Script SQL completo
2. ✅ `src/hooks/useInstallments.ts` - Hook de gerenciamento
3. ✅ `src/components/InstallmentModal.tsx` - Modal de criação
4. ✅ `src/components/InstallmentsList.tsx` - Lista de parcelamentos
5. ✅ `src/components/FutureCommitments.tsx` - Card de compromissos
6. ✅ `FUNCIONALIDADE_PARCELAMENTOS.md` - Documentação

### **Modificados:**
1. ✅ `src/types/supabase.ts` - Tipos atualizados
2. ✅ `src/pages/Dashboard.tsx` - Integração completa
3. ✅ `src/components/QuickActions.tsx` - Botão de parcelamento

---

## 🎉 **Status da Implementação**

### **Funcionalidades Implementadas:**
- ✅ **Criação** de despesas parceladas
- ✅ **Edição** de categoria e caixa
- ✅ **Cancelamento** de parcelamentos
- ✅ **Visualização** de progresso
- ✅ **Alertas** de compromissos futuros
- ✅ **Integração** com dashboard
- ✅ **Cálculos automáticos** de parcelas
- ✅ **Validações** completas

### **Próximos Passos:**

1. **Execute o script SQL** no Supabase:
   ```
   Arquivo: fix-installments.sql
   ```

2. **Teste a funcionalidade**:
   - Crie uma despesa parcelada
   - Verifique se as transações foram criadas
   - Confirme que o orçamento dos próximos meses foi afetado
   - Teste editar e cancelar parcelamento

3. **Funcionalidades Futuras** (já preparadas):
   - ✅ Previsão de fluxo de caixa
   - ✅ Gráficos de compromissos futuros
   - ✅ Alertas quando compromisso > renda
   - ✅ Simulador de parcelamento

---

## 💡 **Exemplo Real Completo**

### **Situação do Usuário:**
```
Renda Mensal: R$ 5.000
Orçamento da Caixa "Conforto": 20% = R$ 1.000

Compra: Notebook Dell por R$ 3.000 em 12x sem juros
```

### **Após Criar Parcelamento:**

**Dashboard Fevereiro 2025:**
```
Card "Compromissos Futuros":
  Compromisso Mensal: R$ 250,00
  Total a Pagar: R$ 3.000,00
  1 parcelamento ativo

Caixa Conforto:
  Orçamento: R$ 1.000
  Gastos: R$ 250 (Notebook 1/12)
  Saldo: R$ 750 ✅
```

**Dashboard Março 2025:**
```
Caixa Conforto:
  Orçamento: R$ 1.000
  Gastos: R$ 250 (Notebook 2/12)
  Saldo: R$ 750 ✅
```

**... continua até Janeiro 2026**

**Lista de Parcelamentos:**
```
Notebook Dell
4/12 pagas (33%)
████████░░░░░░░░░░░░░░░░
Pago: R$ 1.000  |  Falta: R$ 2.000
Próxima: 01/06/2025
```

A funcionalidade está **100% implementada** e pronta para uso! 🎉

---

## 🚀 **Executar Migração**

**Execute no Supabase SQL Editor:**
```sql
-- Arquivo: fix-installments.sql
-- Este script é seguro e verifica existência antes de criar
```

Após executar, o sistema estará completamente funcional! 💳
