# 📋 Funcionalidade de Custos Recorrentes

## 🎯 **Visão Geral**

A funcionalidade de **Custos Recorrentes** permite aos usuários gerenciar despesas e receitas que se repetem periodicamente, como aluguel, salário, planos de assinatura, etc. Esta funcionalidade oferece uma visão completa do impacto financeiro mensal dessas transações recorrentes.

---

## 🏗️ **Arquitetura Implementada**

### **1. Banco de Dados**
- **Tabela**: `recurring_transactions`
- **Schema**: `fix-recurring-transactions.sql`
- **Recursos**:
  - ✅ Cálculo automático de próxima execução
  - ✅ Triggers para atualização automática
  - ✅ Row Level Security (RLS)
  - ✅ Índices para performance

### **2. Hook Personalizado**
- **Arquivo**: `src/hooks/useRecurringTransactions.ts`
- **Funcionalidades**:
  - ✅ CRUD completo (Create, Read, Update, Delete)
  - ✅ Cálculo de estatísticas
  - ✅ Filtros por tipo e caixa
  - ✅ Duplicação de transações
  - ✅ Busca por próximas execuções

### **3. Página Principal**
- **Arquivo**: `src/pages/RecurringCosts.tsx`
- **Recursos**:
  - ✅ Dashboard com métricas KPI
  - ✅ Impacto no orçamento
  - ✅ Lista de transações
  - ✅ Modal para criar/editar

### **4. Componentes Especializados**
- **BudgetImpactCard**: Mostra impacto nas caixas de planejamento
- **RecurringTransactionList**: Lista organizada por tipo
- **RecurringTransactionModal**: Formulário de criação/edição

---

## 📊 **Métricas e KPIs**

### **Cards de Métricas**
1. **Receitas Recorrentes** 💰
   - Total de receitas fixas mensais
   - Ex: Salário, aluguéis recebidos

2. **Despesas Recorrentes** 💸
   - Total de custos fixos mensais
   - Ex: Aluguel, planos, seguros

3. **Saldo Mensal** ⚖️
   - Diferença entre receitas e despesas
   - Indicador de superávit/déficit

4. **Total de Recorrências** 📅
   - Número de transações ativas
   - Controle de quantidade

### **Impacto no Orçamento**
- **Percentual da Renda**: Quanto dos custos recorrentes representam da renda mensal
- **Impacto por Caixa**: Distribuição por caixas de planejamento
- **Alertas**: Caixas que excederam o orçamento

---

## 🎨 **Interface do Usuário**

### **Design Baseado nas Imagens Fornecidas**

#### **Header**
```
┌─────────────────────────────────────────────────────────┐
│ ← Voltar para Home    Custos Recorrentes    + Novo Custo │
│                       Gerencie suas despesas fixas      │
└─────────────────────────────────────────────────────────┘
```

#### **Cards de Métricas**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 💰 Receitas │ │ 💸 Despesas │ │ ⚖️ Saldo    │ │ 📅 Total    │
│ R$ 5.000,00 │ │ R$ 2.339,90 │ │ R$ 2.660,10 │ │ 5 ativas    │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

#### **Impacto no Orçamento**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Impacto no Orçamento                                ⚠️ │
│ Seus custos representam 46.8% da sua renda mensal        │
│                                                           │
│ Total Recorrente: R$ 2.339,90                            │
│ ████████████░░░░░░░░ 46.8%                              │
│ 0%                    Renda: R$ 5.000,00                 │
│                                                           │
│ Impacto por Caixa:                                        │
│ 🔵 Custos fixos (3): R$ 2.250,00 129% ❌                │
│ ████████████████░░░░ 129%                                │
│ 🟠 Conhecimento (1): R$ 89,90 36% ✅                    │
│ ████████░░░░░░░░░░░░ 36%                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Funcionalidades Implementadas**

### **1. Criação de Transações Recorrentes**
- ✅ **Tipos**: Receita ou Despesa
- ✅ **Frequências**: Diário, Semanal, Mensal, Trimestral, Anual
- ✅ **Vinculação**: Categoria e Caixa de Planejamento
- ✅ **Validação**: Campos obrigatórios e validação de dados

### **2. Gerenciamento**
- ✅ **Edição**: Modificar transações existentes
- ✅ **Duplicação**: Criar cópias com modificações
- ✅ **Exclusão**: Remover transações
- ✅ **Ativação/Desativação**: Controlar status

### **3. Visualização**
- ✅ **Filtros**: Por tipo (receita/despesa)
- ✅ **Agrupamento**: Por caixa de planejamento
- ✅ **Ordenação**: Por data de criação
- ✅ **Busca**: Por descrição

### **4. Integração**
- ✅ **Caixas de Planejamento**: Impacto direto no orçamento
- ✅ **Categorias**: Organização por tipo de gasto
- ✅ **Navegação**: Acesso via Ações Rápidas

---

## 📱 **Navegação**

### **Rota**
- **URL**: `/recurring`
- **Acesso**: Via "Ações Rápidas" no Dashboard
- **Proteção**: Rota protegida (requer autenticação)

### **Integração com Sistema**
- ✅ **QuickActions**: Botão "Custos Recorrentes"
- ✅ **Dashboard**: Métricas podem ser integradas
- ✅ **Relatórios**: Dados disponíveis para análise

---

## 🗄️ **Estrutura do Banco**

### **Tabela: recurring_transactions**
```sql
CREATE TABLE recurring_transactions (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    description text NOT NULL,
    amount numeric NOT NULL,
    category_id uuid REFERENCES categories(id),
    budget_box_id uuid REFERENCES budget_boxes(id),
    frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    start_date date NOT NULL,
    end_date date,
    is_active boolean DEFAULT true,
    last_executed date,
    next_execution date, -- Calculado automaticamente
    type text CHECK (type IN ('income', 'expense')),
    notes text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);
```

### **Recursos Automáticos**
- ✅ **Próxima Execução**: Calculada automaticamente baseada na frequência
- ✅ **Triggers**: Atualização automática de timestamps
- ✅ **RLS**: Segurança por usuário
- ✅ **Índices**: Performance otimizada

---

## 🚀 **Como Usar**

### **1. Acessar a Funcionalidade**
1. No Dashboard, clique em "Ações Rápidas"
2. Selecione "Custos Recorrentes"
3. Ou navegue diretamente para `/recurring`

### **2. Criar Transação Recorrente**
1. Clique em "Novo Custo Recorrente"
2. Selecione o tipo (Receita ou Despesa)
3. Preencha descrição, valor e data
4. Escolha categoria e caixa de planejamento
5. Defina a frequência
6. Adicione observações (opcional)
7. Clique em "Adicionar"

### **3. Gerenciar Transações**
- **Editar**: Clique no ícone de edição
- **Duplicar**: Clique no ícone de cópia
- **Excluir**: Clique no ícone de lixeira
- **Filtrar**: Use as abas (Todas, Receitas, Despesas)

### **4. Acompanhar Impacto**
- **Visão Geral**: Cards de métricas no topo
- **Impacto no Orçamento**: Análise por caixa
- **Alertas**: Caixas que excederam o orçamento

---

## 🔮 **Próximas Melhorias**

### **Funcionalidades Futuras**
- [ ] **Execução Automática**: Criar transações reais baseadas nas recorrentes
- [ ] **Notificações**: Alertas de próximas execuções
- [ ] **Histórico**: Log de execuções passadas
- [ ] **Relatórios**: Análises detalhadas de custos recorrentes
- [ ] **Importação**: Upload de planilhas com custos recorrentes
- [ ] **Templates**: Modelos pré-definidos (aluguel, salário, etc.)

### **Integrações**
- [ ] **Dashboard**: Widget de resumo de custos recorrentes
- [ ] **Relatórios**: Gráficos de evolução
- [ ] **Notificações**: Email/SMS para lembretes
- [ ] **API**: Endpoints para integração externa

---

## ✅ **Status da Implementação**

- ✅ **Schema do Banco**: Completamente implementado
- ✅ **Hook Personalizado**: Funcionalidades completas
- ✅ **Página Principal**: Dashboard e métricas
- ✅ **Modal de Criação**: Formulário completo
- ✅ **Lista de Transações**: Visualização organizada
- ✅ **Impacto no Orçamento**: Análise por caixas
- ✅ **Navegação**: Integrado ao sistema
- ✅ **Tipos TypeScript**: Definidos e atualizados

---

## 🎯 **Conclusão**

A funcionalidade de **Custos Recorrentes** está completamente implementada e integrada ao sistema financeiro. Ela oferece:

- 📊 **Visão completa** dos custos fixos mensais
- 🎯 **Integração perfeita** com as caixas de planejamento
- 🚀 **Interface intuitiva** baseada no design fornecido
- 🔒 **Segurança robusta** com RLS e validações
- ⚡ **Performance otimizada** com índices e triggers

A funcionalidade está pronta para uso e pode ser expandida com as melhorias futuras planejadas! 🎉
