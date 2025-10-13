# 📦 Sistema de Caixas de Planejamento

## 🎯 O Que Foi Implementado

Um sistema completo de "Caixas de Planejamento" (Budget Boxes) onde cada despesa se encaixa em uma das 6 caixas principais, permitindo controlar se você está seguindo o planejamento de cada caixa ao longo do mês.

---

## 🎨 As 6 Caixas Padrão

Cada caixa recebe um percentual da sua renda mensal:

1. **🏠 Custos Fixos** - 35% 
   - Moradia, contas essenciais, saúde

2. **✨ Conforto** - 15%
   - Transporte, alimentação, conforto do dia a dia

3. **🎯 Metas** - 10%
   - Reserva de emergência, objetivos de curto/médio prazo

4. **🎉 Prazeres** - 10%
   - Lazer, diversão, hobbies

5. **💎 Liberdade Financeira** - 25%
   - Investimentos, patrimônio, independência financeira

6. **📚 Conhecimento** - 5%
   - Cursos, livros, educação, desenvolvimento pessoal

---

## ✅ Funcionalidades Criadas

### 1. **Banco de Dados**
- ✅ Nova tabela `budget_boxes` com as 6 caixas
- ✅ Campo `box_id` nas categorias para vincular cada categoria a uma caixa
- ✅ Criação automática das caixas ao criar conta
- ✅ Vinculação automática de categorias padrão às caixas

### 2. **Hooks React**
- ✅ `useBudgetBoxes` - Gerenciar caixas (CRUD)
- ✅ `useBudgetBoxStats` - Calcular estatísticas de cada caixa:
  - Valor planejado (baseado na renda)
  - Valor gasto
  - Percentual utilizado
  - Valor disponível

### 3. **Componentes**
- ✅ `BudgetBoxSummary` - Exibe resumo visual de todas as caixas:
  - Total planejado vs Total gasto
  - Barra de progresso para cada caixa
  - Indicadores visuais (verde/amarelo/vermelho)
  - Valor disponível em cada caixa

### 4. **Telas Atualizadas**
- ✅ **Dashboard** - Agora mostra o resumo das caixas logo após os KPIs
- ✅ **Settings** - Permite vincular categorias às caixas:
  - Campo dropdown para selecionar a caixa
  - Exibe a caixa vinculada em cada categoria
  - Apenas categorias de despesa têm caixa

---

## 🚀 Como Usar

### Passo 1: Executar o Novo Schema SQL

⚠️ **IMPORTANTE**: Você precisa executar o schema atualizado no Supabase!

1. Abra o **SQL Editor** no Supabase Dashboard
2. Copie todo o conteúdo do arquivo `supabase-schema.sql` (atualizado)
3. Cole e execute
4. Aguarde "Success. No rows returned"

Isso criará:
- A tabela `budget_boxes`
- O campo `box_id` nas categorias
- As 6 caixas padrão para todos os usuários

### Passo 2: Testar no Sistema

1. Execute o projeto:
   ```bash
   npm run dev
   ```

2. Faça login ou crie uma nova conta

3. Acesse o **Dashboard**

4. Você verá:
   - ✅ Resumo das Caixas de Planejamento (novo!)
   - ✅ Total planejado, gasto e % utilizado
   - ✅ Status de cada caixa com barra de progresso

---

## 📊 Como Funciona

### Cálculo Automático

```typescript
// Baseado na sua renda mensal
Renda = R$ 5.000,00

Custos Fixos     = R$ 1.750,00 (35%)
Conforto         = R$ 750,00 (15%)
Metas            = R$ 500,00 (10%)
Prazeres         = R$ 500,00 (10%)
Lib. Financeira  = R$ 1.250,00 (25%)
Conhecimento     = R$ 250,00 (5%)

TOTAL            = R$ 5.000,00 (100%)
```

### Vínculo Categoria → Caixa

Cada **categoria de despesa** pode ser vinculada a uma caixa:

```
Categoria "Aluguel"     → Caixa "Custos Fixos"
Categoria "Uber"        → Caixa "Conforto"
Categoria "Netflix"     → Caixa "Prazeres"
Categoria "Cursos"      → Caixa "Conhecimento"
Categoria "Ações"       → Caixa "Liberdade Financeira"
Categoria "Viagem"      → Caixa "Metas"
```

### Controle de Gastos

Quando você adiciona uma **transação**:
1. Seleciona a categoria (ex: "Uber")
2. O sistema identifica a caixa vinculada (ex: "Conforto")
3. O gasto é contabilizado naquela caixa
4. O resumo é atualizado automaticamente

---

## 🎨 Visualização no Dashboard

### Resumo das Caixas

```
┌─────────────────────────────────────────────┐
│ Resumo das Caixas de Planejamento           │
├─────────────────────────────────────────────┤
│                                             │
│  R$ 0,00        R$ 5.000,00        0%      │
│  Total Gasto    Total Planejado    Utilizado│
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ 🏠 Custos fixos       35% da renda          │
│ ▓▓▓░░░░░░░ 30%                              │
│ Gasto: R$ 525,00  Disponível: R$ 1.225,00  │
│                                             │
│ ✨ Conforto           15% da renda          │
│ ▓▓▓▓▓░░░░░ 50%                              │
│ Gasto: R$ 375,00  Disponível: R$ 375,00    │
│                                             │
│ ... (outras caixas)                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Indicadores Visuais

- 🟢 **Verde** (0-80%): Tudo certo, dentro do planejado
- 🟡 **Amarelo** (80-100%): Atenção, próximo do limite
- 🔴 **Vermelho** (>100%): Cuidado! Ultrapassou o planejado

---

## ⚙️ Gerenciamento no Settings

### Vincular Categorias às Caixas

1. Vá em **Settings** (⚙️)
2. Clique em "Editar" em uma categoria de despesa
3. Selecione a **Caixa de Planejamento** no dropdown
4. Salve

Agora todos os gastos dessa categoria vão para aquela caixa!

### Exemplo:

```
Categoria: "Supermercado"
Caixa: "Conforto"
→ Toda compra de supermercado conta na caixa Conforto
```

---

## 🎯 Benefícios

### 1. **Controle Financeiro Detalhado**
- Saiba exatamente quanto gastar em cada área
- Baseado em percentuais da sua renda

### 2. **Visualização Clara**
- Veja rapidamente onde está gastando mais
- Identifique áreas que precisam ajuste

### 3. **Planejamento Consciente**
- Aloque recursos para o que importa
- Equilibre presente (conforto) e futuro (investimentos)

### 4. **Metas Claras**
- 25% para liberdade financeira
- 10% para metas de curto prazo
- 5% para desenvolvimento pessoal

---

## 🔧 Personalização

### Ajustar Percentuais

Você pode personalizar os percentuais das caixas no Settings (funcionalidade futura) ou diretamente no banco:

```sql
UPDATE budget_boxes 
SET percentage = 30.00 
WHERE name = 'Custos fixos';
```

### Criar Novas Caixas

No Settings, você pode criar caixas personalizadas (funcionalidade futura).

---

## 📋 Checklist de Uso

Para usar o sistema de caixas:

- [ ] Execute o schema SQL atualizado no Supabase
- [ ] Reinicie o servidor (`npm run dev`)
- [ ] Faça login no sistema
- [ ] Acesse o Dashboard
- [ ] Veja o Resumo das Caixas
- [ ] Adicione transações
- [ ] Vá em Settings para vincular categorias às caixas
- [ ] Acompanhe seu progresso!

---

## 🐛 Solução de Problemas

### "Caixas não aparecem no Dashboard"

**Causa**: Schema não foi executado

**Solução**: 
1. Execute o `supabase-schema.sql` completo
2. Reinicie o servidor
3. Recarregue a página

### "Categorias não mostram a caixa"

**Causa**: Categorias não foram vinculadas

**Solução**:
1. Vá em Settings
2. Edite cada categoria de despesa
3. Selecione uma caixa
4. Salve

### "Valores não batem"

**Causa**: Renda mensal zerada

**Solução**:
- O cálculo é baseado nas receitas do mês
- Adicione uma transação de receita (salário)
- Os valores das caixas serão calculados automaticamente

---

## 📈 Próximas Melhorias (Roadmap)

- [ ] Editar percentuais das caixas pelo Settings
- [ ] Criar caixas personalizadas
- [ ] Histórico de uso das caixas por mês
- [ ] Comparação mês a mês
- [ ] Sugestões inteligentes de alocação
- [ ] Alertas quando ultrapassar limites

---

## 💡 Dicas de Uso

### 1. **Seja Consistente**
- Vincule todas as categorias às caixas certas
- Assim o sistema calcula corretamente

### 2. **Revise Mensalmente**
- Veja quais caixas você mais usa
- Ajuste percentuais se necessário

### 3. **Use as Caixas como Guia**
- Antes de gastar, veja quanto tem disponível
- Priorize caixas mais importantes (Liberdade Financeira!)

### 4. **Equilibre Presente e Futuro**
- 25% para investimentos (Liberdade Financeira)
- 10% para lazer (Prazeres)
- Balance bem!

---

**🎉 Parabéns! Agora você tem um sistema completo de planejamento financeiro por caixas!**

Use-o para tomar decisões conscientes sobre seus gastos! 💰📊

