# 📊 Divisão de Transações por Abas

## 📝 Descrição

Implementação de um sistema de abas na página de transações para facilitar a visualização e filtragem de receitas, despesas e pendências.

---

## ✨ Funcionalidades Implementadas

### 1. **Cards de Resumo**
- **Receitas**: Total de entradas no mês selecionado
- **Despesas**: Total de saídas (despesas + investimentos)
- **Pendências**: Total de transações com data futura

### 2. **Sistema de Abas**
Quatro abas para filtrar transações:
- **Todas**: Exibe todas as transações do mês
- **Receitas**: Filtra apenas transações do tipo `income`
- **Despesas**: Filtra transações dos tipos `expense` e `investment`
- **Pendências**: Filtra transações com data futura (ainda não realizadas)

### 3. **Indicadores Visuais**
- **Badge de contagem**: Cada aba mostra o número de transações do seu tipo
- **Destaque de pendências**: Transações pendentes têm fundo azul e badge "Pendente"
- **Cores por tipo**: 
  - Receitas: Verde
  - Despesas: Vermelho
  - Investimentos: Azul

### 4. **Layout Atualizado**
- Integração com o componente `Layout` (inclui sidebar)
- Cards de resumo com gradientes coloridos
- Interface responsiva e moderna

---

## 🔧 Implementação Técnica

### **Arquivo Modificado**
- `src/pages/Transactions.tsx`

### **Principais Alterações**

#### 1. **Imports Atualizados**
```typescript
import { useState, useMemo } from 'react'
import { Edit, Trash2, Filter, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { Layout } from '@/components/Layout'
```

#### 2. **Estado e Tipos**
```typescript
type TabType = 'all' | 'income' | 'expense' | 'pending'

const [activeTab, setActiveTab] = useState<TabType>('all')
```

#### 3. **Lógica de Filtro**
```typescript
const filteredTransactions = useMemo(() => {
  const now = new Date()
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (activeTab) {
    case 'income':
      return transactions.filter(t => t.type === 'income')
    case 'expense':
      return transactions.filter(t => t.type === 'expense' || t.type === 'investment')
    case 'pending':
      return transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate > currentDate
      })
    default:
      return transactions
  }
}, [transactions, activeTab])
```

#### 4. **Cálculo de Estatísticas**
```typescript
const stats = useMemo(() => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const expenses = transactions
    .filter(t => t.type === 'expense' || t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const now = new Date()
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const pending = transactions
    .filter(t => new Date(t.date) > currentDate)
    .reduce((sum, t) => sum + t.amount, 0)
  
  return { income, expenses, pending }
}, [transactions])
```

#### 5. **Interface de Abas**
```tsx
<div className="mb-6 border-b border-gray-200">
  <nav className="flex space-x-8">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`
          flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
          ${activeTab === tab.id
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }
        `}
      >
        {tab.icon}
        <span>{tab.label}</span>
        <span className={`
          ml-2 py-0.5 px-2 rounded-full text-xs font-semibold
          ${activeTab === tab.id
            ? 'bg-blue-100 text-blue-600'
            : 'bg-gray-100 text-gray-600'
          }
        `}>
          {tab.count}
        </span>
      </button>
    ))}
  </nav>
</div>
```

---

## 🎨 Componentes Visuais

### **Cards de Resumo**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-green-700 font-medium">Receitas</p>
        <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.income)}</p>
      </div>
      <TrendingUp size={32} className="text-green-600" />
    </div>
  </Card>
  {/* ... outros cards ... */}
</div>
```

### **Item de Transação Pendente**
```tsx
<div className={`flex items-center justify-between p-4 rounded-lg hover:bg-gray-100 transition ${
  isPending ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
}`}>
  {/* ... conteúdo ... */}
  {isPending && (
    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
      Pendente
    </span>
  )}
</div>
```

---

## 📱 Responsividade

### **Desktop**
- Cards de resumo em grid de 3 colunas
- Abas em linha horizontal
- Layout completo com sidebar

### **Mobile**
- Cards em coluna única
- Abas com scroll horizontal
- Sidebar colapsável

---

## 🔄 Fluxo de Uso

1. **Visualização Geral**
   - Usuário acessa a página de transações
   - Vê os cards de resumo com totais
   - Vê todas as transações na aba "Todas"

2. **Filtragem por Tipo**
   - Clica em "Receitas" para ver apenas entradas
   - Clica em "Despesas" para ver apenas saídas
   - Clica em "Pendências" para ver transações futuras

3. **Identificação Visual**
   - Transações pendentes têm fundo azul e badge
   - Cores diferentes para cada tipo (verde, vermelho, azul)
   - Contador em cada aba mostra quantidade de itens

4. **Ações**
   - Botão de editar para modificar transação
   - Botão de excluir para remover transação
   - Filtros de mês e ano para navegar no histórico

---

## ✅ Benefícios

1. **Organização**: Fácil visualização por tipo de transação
2. **Planejamento**: Pendências ajudam a prever fluxo de caixa futuro
3. **Análise**: Cards de resumo mostram totais rapidamente
4. **Usabilidade**: Interface intuitiva com indicadores visuais claros
5. **Performance**: Uso de `useMemo` para otimizar cálculos

---

## 🚀 Melhorias Futuras Sugeridas

- [ ] Adicionar filtro por categoria dentro de cada aba
- [ ] Implementar busca por descrição
- [ ] Adicionar gráficos de tendência por tipo
- [ ] Exportar transações filtradas para CSV/PDF
- [ ] Adicionar aba de "Recorrentes" para transações fixas
- [ ] Implementar drag-and-drop para reagendar pendências

---

## 📊 Estrutura de Dados

### **Tipos de Transação**
- `income`: Receitas/Entradas
- `expense`: Despesas/Saídas
- `investment`: Investimentos (contam como despesa no orçamento)

### **Status de Transação**
- **Realizada**: Data <= hoje
- **Pendente**: Data > hoje

---

## 🎯 Conclusão

A divisão de transações por abas melhora significativamente a experiência do usuário, permitindo uma navegação mais rápida e organizada entre diferentes tipos de movimentações financeiras. A identificação visual de pendências ajuda no planejamento financeiro futuro.

