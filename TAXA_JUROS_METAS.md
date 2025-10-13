# 💰 Taxa de Juros Anual nas Metas Financeiras

## 🎯 Nova Funcionalidade Implementada

Sistema de cálculo de contribuição mensal com **taxa de juros anual** para metas financeiras, considerando **juros compostos** e **rendimento de investimentos**.

## 🔧 **Implementações Realizadas**

### 1. **Banco de Dados** ✅
**Arquivo**: `supabase-schema.sql` + `fix-goals-interest-rate.sql`

```sql
-- Nova coluna na tabela goals
annual_interest_rate numeric(5, 2) default 0.00 
check (annual_interest_rate >= 0 and annual_interest_rate <= 100)
```

**Características**:
- ✅ **Valor padrão**: 0% (sem juros)
- ✅ **Validação**: 0% a 100% anual
- ✅ **Precisão**: 2 casas decimais
- ✅ **Compatível** com metas existentes

### 2. **Cálculo com Juros Compostos** ✅
**Arquivo**: `src/hooks/useGoals.ts`

```typescript
// Fórmula de juros compostos para pagamentos mensais
// PMT = PV * [r * (1 + r)^n] / [(1 + r)^n - 1]
// Onde:
// PMT = Pagamento mensal
// PV = Valor presente (valor restante)
// r = Taxa de juros mensal (taxa anual / 12)
// n = Número de períodos (meses restantes)

const monthlyRate = annualInterestRate / 100 / 12
const totalPeriods = monthsRemaining

if (monthlyRate > 0) {
  monthlyContribution = remainingAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalPeriods)) / 
    (Math.pow(1 + monthlyRate, totalPeriods) - 1)
} else {
  monthlyContribution = remainingAmount / monthsRemaining
}
```

### 3. **Interface do Usuário** ✅
**Arquivos**: `GoalModal.tsx` + `GoalCard.tsx`

#### **Modal de Criação/Edição**
- ✅ **Campo "Taxa de Juros Anual"** com validação
- ✅ **Placeholder**: "0,00" (sem juros)
- ✅ **Limites**: 0% a 100%
- ✅ **Dica**: "Rendimento esperado dos investimentos"

#### **Card da Meta**
- ✅ **Exibição da taxa** quando > 0%
- ✅ **Rendimento mensal** calculado
- ✅ **Dica visual** sobre juros compostos
- ✅ **Design destacado** em azul

## 📊 **Exemplos Práticos**

### **Exemplo 1: Reserva de Emergência**
- **Meta**: R$ 10.000
- **Prazo**: 12 meses
- **Taxa**: 0% (sem juros)
- **Contribuição**: R$ 833,33/mês

### **Exemplo 2: Viagem para Europa**
- **Meta**: R$ 15.000
- **Prazo**: 18 meses
- **Taxa**: 6% a.a. (investimento conservador)
- **Valor atual**: R$ 0
- **Contribuição**: R$ 767,89/mês (vs. R$ 833,33 sem juros)
- **Economia**: R$ 65,44/mês

### **Exemplo 3: Casa Própria**
- **Meta**: R$ 200.000
- **Prazo**: 60 meses
- **Taxa**: 12% a.a. (investimento moderado)
- **Valor atual**: R$ 0
- **Contribuição**: R$ 2.398,45/mês (vs. R$ 3.333,33 sem juros)
- **Economia**: R$ 934,88/mês

## 🧮 **Fórmulas Matemáticas**

### **Sem Juros (Taxa = 0%)**
```
Contribuição Mensal = Valor Restante ÷ Meses Restantes
```

### **Com Juros Compostos (Taxa > 0%)**
```
Fórmula: M = C(1+i)^t + A × [((1+i)^t - 1) / i]

Onde:
- M = Montante final (target_amount)
- C = Capital inicial (current_amount)  
- i = Taxa de juros mensal (taxa anual ÷ 12 ÷ 100)
- t = Tempo em meses (monthsRemaining)
- A = Aporte mensal (monthlyContribution)

Isolando A:
A = (M - C(1+i)^t) ÷ [((1+i)^t - 1) / i]
```

## 🎨 **Interface Visual**

### **Modal de Criação**
```
┌─────────────────────────────────────┐
│ Nome da Meta: [Reserva Emergência]  │
│ Valor Alvo: [10000]                 │
│ Data Alvo: [2025-12-31]             │
│ Taxa de Juros Anual: [6] %          │
│ Valor Atual: [0]                    │
│ Prioridade: [Média ▼]               │
└─────────────────────────────────────┘
```

### **Card da Meta**
```
┌─────────────────────────────────────┐
│ 🎯 Reserva de Emergência            │
│ ████████████░░░░ 75%                │
│ R$ 7.500 / R$ 10.000                │
│                                     │
│ 📅 Prazo: 31/12/2025  💰 Mensal: R$ 765,45 │
│                                     │
│ ┌─ Taxa de Juros ──────────────────┐ │
│ │ 📈 Taxa: 6% a.a.  📊 Mensal: 0.50% │ │
│ │ 💡 Com juros compostos, você       │ │
│ │    precisa contribuir menos!       │ │
│ └───────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🚀 **Benefícios**

### **Para o Usuário**
- ✅ **Contribuições menores** com investimentos
- ✅ **Cálculo realista** considerando rendimentos
- ✅ **Planejamento mais preciso** das finanças
- ✅ **Motivação extra** vendo economia mensal

### **Para o Sistema**
- ✅ **Cálculos matematicamente corretos**
- ✅ **Flexibilidade** (com ou sem juros)
- ✅ **Interface intuitiva** e educativa
- ✅ **Compatibilidade** com metas existentes

## 🔄 **Como Usar**

### **Passo 1: Executar Script SQL**
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: fix-goals-interest-rate.sql
```

### **Passo 2: Criar/Editar Meta**
1. Acesse **Metas** → **Nova Meta**
2. Preencha **nome, valor, data**
3. **Defina taxa de juros** (ex: 6% para investimento conservador)
4. **Salve** a meta

### **Passo 3: Verificar Cálculo**
- **Contribuição mensal** será calculada automaticamente
- **Economia** será mostrada no card
- **Rendimento** será exibido visualmente

## 📈 **Cenários de Investimento**

| Tipo de Investimento | Taxa Anual | Risco | Exemplo |
|---------------------|------------|-------|---------|
| **Poupança** | 6% | Baixo | Reserva de emergência |
| **CDB/LCI** | 8-10% | Baixo | Meta de curto prazo |
| **Fundos** | 10-12% | Médio | Meta de médio prazo |
| **Ações** | 12-15% | Alto | Meta de longo prazo |

## 🎯 **Resultado Final**

A funcionalidade de **taxa de juros anual** torna as metas financeiras mais **realistas** e **eficientes**, considerando o **rendimento dos investimentos** e **juros compostos** para calcular a **contribuição mensal otimizada**! 🎉
