# 📊 Vinculação de Transações às Caixas de Planejamento

## 🎯 Nova Funcionalidade Implementada

Sistema completo para vincular transações às caixas de planejamento financeiro, permitindo acompanhar os gastos mensais de cada caixa e controlar o orçamento em tempo real.

## 🔧 **Implementações Realizadas**

### 1. **Atualização do Schema do Banco** ✅
**Arquivo**: `fix-transactions-budget-box.sql`

```sql
-- Adicionar coluna budget_box_id na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN budget_box_id uuid REFERENCES public.budget_boxes(id) ON DELETE SET NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_budget_box_id 
ON public.transactions(budget_box_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_budget_box 
ON public.transactions(user_id, budget_box_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date_budget_box 
ON public.transactions(date, budget_box_id);
```

**Características**:
- ✅ **Campo opcional** - transações podem existir sem caixa
- ✅ **Foreign key** para integridade referencial
- ✅ **Índices otimizados** para consultas rápidas
- ✅ **Cascata NULL** - se caixa for deletada, campo fica NULL

### 2. **Atualização dos Tipos TypeScript** ✅
**Arquivo**: `src/types/supabase.ts`

```typescript
transactions: {
  Row: {
    // ... outros campos ...
    budget_box_id: string | null  // ← NOVO CAMPO
  }
  Insert: {
    // ... outros campos ...
    budget_box_id?: string | null  // ← NOVO CAMPO
  }
  Update: {
    // ... outros campos ...
    budget_box_id?: string | null  // ← NOVO CAMPO
  }
}
```

### 3. **Componente Seletor de Caixa** ✅
**Arquivo**: `src/components/BudgetBoxSelector.tsx`

```typescript
interface BudgetBoxSelectorProps {
  value?: string | null
  onChange: (budgetBoxId: string | null) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  type?: 'income' | 'expense'
}
```

**Funcionalidades**:
- ✅ **Dropdown elegante** com ícones e cores das caixas
- ✅ **Opção "Sem caixa"** para transações não categorizadas
- ✅ **Estado de loading** durante carregamento
- ✅ **Responsivo** e acessível
- ✅ **Validação** de seleção

### 4. **Integração no Formulário de Transações** ✅
**Arquivo**: `src/components/TransactionModal.tsx`

```typescript
// Campo adicionado ao formulário
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Caixa de Planejamento
  </label>
  <BudgetBoxSelector
    value={formData.budget_box_id}
    onChange={(budgetBoxId) => setFormData({ ...formData, budget_box_id: budgetBoxId || '' })}
    disabled={loading}
    placeholder="Selecione uma caixa (opcional)"
    type={type}
  />
  <p className="text-xs text-gray-500 mt-1">
    Vincule esta transação a uma caixa de planejamento para acompanhar os gastos
  </p>
</div>
```

**Características**:
- ✅ **Campo opcional** - não obrigatório
- ✅ **Integração completa** com CRUD de transações
- ✅ **Validação** de dados
- ✅ **UX intuitiva** com explicação

### 5. **Hook de Acompanhamento de Gastos** ✅
**Arquivo**: `src/hooks/useBudgetBoxSpending.ts`

```typescript
export interface BudgetBoxSpending {
  id: string
  name: string
  icon: string
  color: string
  percentage: number
  budgetAmount: number      // Valor calculado baseado na renda
  spentAmount: number       // Valor gasto no período
  remainingAmount: number   // Valor restante
  spentPercentage: number   // Percentual do orçamento gasto
  isOverBudget: boolean     // Se excedeu o orçamento
}
```

**Funcionalidades**:
- ✅ **Cálculo automático** de gastos por caixa
- ✅ **Comparação** com orçamento definido
- ✅ **Alertas** para caixas que excederam
- ✅ **Filtros** por mês/ano
- ✅ **Performance otimizada** com índices

### 6. **Componente de Progresso das Caixas** ✅
**Arquivo**: `src/components/BudgetBoxProgress.tsx`

```typescript
interface BudgetBoxProgressProps {
  month?: number
  year?: number
  className?: string
  showDetails?: boolean
  compact?: boolean
}
```

**Características**:
- ✅ **Barras de progresso** visuais
- ✅ **Cores dinâmicas** (verde/vermelho para excedentes)
- ✅ **Modo compacto** para listas
- ✅ **Resumo geral** com total gasto vs orçamento
- ✅ **Alertas visuais** para caixas em déficit

### 7. **Integração no Dashboard** ✅
**Arquivo**: `src/pages/Dashboard.tsx`

```typescript
{/* Budget Box Progress */}
<Card>
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Acompanhamento das Caixas
      </h2>
      <p className="text-sm text-gray-600">
        Progresso dos gastos por caixa de planejamento - {getMonthName(month)}
      </p>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate('/settings')}
      className="flex items-center gap-2"
    >
      <Settings size={16} />
      Configurar
    </Button>
  </div>
  <BudgetBoxProgress month={month} year={year} />
</Card>
```

## 🎨 **Interface Visual**

### **Formulário de Transação Atualizado**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🆕 Nova Transação                                               │
├─────────────────────────────────────────────────────────────────┤
│ [Receita] [Despesa]                                             │
│                                                                 │
│ Valor: R$ [_____________]                                       │
│                                                                 │
│ Descrição: [________________]                                   │
│                                                                 │
│ Categoria: [Selecione uma categoria ▼]                         │
│                                                                 │
│ 🆕 Caixa de Planejamento: [Selecione uma caixa ▼]              │
│    💡 Vincule esta transação a uma caixa para acompanhar       │
│                                                                 │
│ Data: [_____________]                                           │
│                                                                 │
│ [Cancelar] [Salvar]                                             │
└─────────────────────────────────────────────────────────────────┘
```

### **Seletor de Caixa**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🆕 Caixa de Planejamento                                        │
├─────────────────────────────────────────────────────────────────┤
│ [💰 Custos Fixos (50%) 🔵] ▼                                   │
│                                                                 │
│ Opções:                                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🚫 Sem caixa específica                                     │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ 🏠 Custos Fixos (50%) 🔵                                   │ │
│ │ 🛍️ Conforto (20%) 🟢                                       │ │
│ │ 🎯 Metas (15%) 🟡                                           │ │
│ │ 🎉 Prazeres (10%) 🟣                                        │ │
│ │ 💎 Liberdade Financeira (3%) 🔴                             │ │
│ │ 📚 Conhecimento (2%) ⚪                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **Dashboard com Acompanhamento**
```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 Acompanhamento das Caixas                    [⚙️ Configurar] │
│ Progresso dos gastos por caixa - Janeiro                       │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Resumo do Planejamento                                      │ │
│ │ R$ 2.500,00 / R$ 3.000,00                   83.3% ████████ │ │
│ │ ⚠️ 2 caixa(s) excederam o orçamento                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🏠 Custos Fixos                                R$ 1.800,00  │ │
│ │ 50% da renda mensal                          de R$ 1.500,00 │ │
│ │ ████████████████████████████████████████████ 120%           │ │
│ │ 120% usado • Excedeu em R$ 300,00            🔵             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🛍️ Conforto                                    R$ 500,00   │ │
│ │ 20% da renda mensal                            de R$ 600,00 │ │
│ │ ████████████████████████████████████████ 83%                │ │
│ │ 83% usado • R$ 100,00 restante                🟢             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 **Exemplos Práticos**

### **Cenário 1: Controle Mensal**
- **Renda**: R$ 5.000/mês
- **Custos Fixos**: 50% = R$ 2.500
- **Gastos reais**: R$ 2.800
- **Status**: ⚠️ Excedeu em R$ 300 (112% do orçamento)

### **Cenário 2: Múltiplas Caixas**
- **Custos Fixos**: R$ 1.500 (60% usado)
- **Conforto**: R$ 800 (80% usado)
- **Metas**: R$ 200 (40% usado)
- **Prazeres**: R$ 150 (75% usado)
- **Total**: R$ 2.650 gastos de R$ 3.000 orçados

### **Cenário 3: Transações sem Caixa**
- **Transações vinculadas**: 85%
- **Transações sem caixa**: 15%
- **Sistema**: Permite flexibilidade sem obrigatoriedade

## 🚀 **Benefícios**

### **Para o Usuário**
- ✅ **Controle total** do orçamento por categoria
- ✅ **Alertas visuais** quando excede limites
- ✅ **Flexibilidade** - transações podem não ter caixa
- ✅ **Visão clara** do progresso mensal
- ✅ **Motivação** para manter disciplina

### **Para o Sistema**
- ✅ **Dados estruturados** para relatórios
- ✅ **Performance otimizada** com índices
- ✅ **Escalabilidade** para futuras funcionalidades
- ✅ **Integridade** dos dados com foreign keys
- ✅ **Flexibilidade** de schema

## 🔍 **Consultas SQL Úteis**

### **Gastos por Caixa no Mês Atual**
```sql
SELECT 
    bb.name as caixa,
    bb.color,
    SUM(t.amount) as total_gasto,
    bb.percentage * ui.monthly_income / 100 as limite_caixa
FROM transactions t
JOIN budget_boxes bb ON t.budget_box_id = bb.id
JOIN users ui ON bb.user_id = ui.id
WHERE t.user_id = 'user_id_here'
    AND t.type = 'expense'
    AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY bb.id, bb.name, bb.color, bb.percentage, ui.monthly_income;
```

### **Progresso das Caixas**
```sql
SELECT 
    bb.name,
    bb.color,
    COALESCE(SUM(t.amount), 0) as gasto_atual,
    bb.percentage * ui.monthly_income / 100 as limite_caixa,
    ROUND((COALESCE(SUM(t.amount), 0) / (bb.percentage * ui.monthly_income / 100)) * 100, 2) as percentual_usado
FROM budget_boxes bb
LEFT JOIN transactions t ON bb.id = t.budget_box_id 
    AND t.type = 'expense'
    AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN users ui ON bb.user_id = ui.id
WHERE bb.user_id = 'user_id_here'
GROUP BY bb.id, bb.name, bb.color, bb.percentage, ui.monthly_income;
```

## ✅ **Status da Implementação**

- ✅ **Schema atualizado** com campo budget_box_id
- ✅ **Tipos TypeScript** atualizados
- ✅ **Componente seletor** criado e funcional
- ✅ **Formulário integrado** com validação
- ✅ **Hook de acompanhamento** implementado
- ✅ **Componente de progresso** com visualizações
- ✅ **Dashboard atualizado** com nova seção
- ✅ **Performance otimizada** com índices
- ✅ **Documentação completa** criada

## 🎯 **Resultado Final**

O sistema agora permite:

1. **Vincular transações** às caixas de planejamento
2. **Acompanhar gastos** em tempo real por caixa
3. **Visualizar progresso** com barras e percentuais
4. **Receber alertas** quando excede orçamento
5. **Manter flexibilidade** para transações não categorizadas
6. **Gerar relatórios** detalhados de gastos por caixa

A funcionalidade está **100% implementada** e integrada ao sistema! 🎉

## 📱 **Próximos Passos Sugeridos**

1. **Relatórios** de gastos por caixa
2. **Alertas** por email quando excede limites
3. **Metas mensais** por caixa
4. **Histórico** de gastos por caixa
5. **Comparativo** mês a mês
6. **Exportação** de dados para Excel/PDF
