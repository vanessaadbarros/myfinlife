# 📄 Modal de Visualização de Fatura

## 📝 Descrição

Interface completa para visualizar todas as transações de uma fatura de cartão de crédito, com resumo, estatísticas por categoria e detalhes de cada compra.

---

## ✨ Funcionalidades

### **1. Visualização Completa**
- ✅ Total da fatura em destaque
- ✅ Datas de fechamento e vencimento
- ✅ Barra de progresso do limite usado
- ✅ Status da fatura (Aberta, Fechada, Paga, Vencida)

### **2. Lista de Transações**
- ✅ Todas as compras da fatura
- ✅ Data, descrição, categoria e valor
- ✅ Badges para parcelas e recorrências
- ✅ Ordenação por data (mais recente primeiro)

### **3. Estatísticas**
- ✅ Gastos agrupados por categoria
- ✅ Total e quantidade por categoria
- ✅ Ordenado do maior para o menor

### **4. Ações**
- ✅ Botão "Ver Fatura Detalhada" em cada cartão
- ✅ Modal responsivo (tamanho XL)
- ✅ Botão "Pagar Fatura" (preparado para futura implementação)

---

## 🎨 Interface Visual

### **Modal Completo**
```
┌──────────────────────────────────────────────────────────────────┐
│  💳 Nubank Platinum                                         [X]  │
│  •••• 1234                                                       │
│  Fatura de Outubro 2024                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─ RESUMO DA FATURA ────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Total da Fatura    Fechamento       Vencimento          │  │
│  │  R$ 1.287,50        10/10/2024       15/10/2024          │  │
│  │                                                            │  │
│  │  Uso do Limite                               16.1%        │  │
│  │  [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]           │  │
│  │  Usado: R$ 1.287,50          Limite: R$ 8.000,00        │  │
│  │                                                            │  │
│  │  Status: 📂 Aberta               12 transação(ões)       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─ GASTOS POR CATEGORIA ────────────────────────────────────┐  │
│  │ 🍔 Alimentação (5)                        R$ 487,50       │  │
│  │ 🚗 Transporte (3)                         R$ 350,00       │  │
│  │ 🎬 Lazer (2)                              R$ 250,00       │  │
│  │ 📱 Assinaturas (2)                        R$ 200,00       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─ TRANSAÇÕES DA FATURA ─────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ┌───────────────────────────────────────────────────────┐ │ │
│  │  │ Supermercado XYZ                     R$ 238,50        │ │ │
│  │  │ 📅 01/10/2024 • 🍔 Alimentação                       │ │ │
│  │  └───────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  ┌───────────────────────────────────────────────────────┐ │ │
│  │  │ Netflix                              R$ 39,90  [Recor.]│ │ │
│  │  │ 📅 05/10/2024 • 📱 Assinaturas                       │ │ │
│  │  └───────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  ┌───────────────────────────────────────────────────────┐ │ │
│  │  │ Notebook Dell                        R$ 300,00  [3/12] │ │ │
│  │  │ 📅 15/10/2024 • 💻 Tecnologia                        │ │ │
│  │  └───────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  ... (mais transações) ...                                │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│                              [Fechar]  [Pagar Fatura]            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementação Técnica

### **Arquivo: `src/components/InvoiceModal.tsx`** ✅

**Imports**:
```typescript
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, getMonthName } from '@/utils/formatters'
import { useCategories } from '@/hooks/useCategories'
import { supabase } from '@/lib/supabase'
```

**Props**:
```typescript
interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  card: CreditCard
  invoiceId?: string | null  // Opcional: se não informado, busca a mais recente
}
```

**Estados**:
```typescript
const [invoice, setInvoice] = useState<Invoice | null>(null)
const [transactions, setTransactions] = useState<Transaction[]>([])
const [loading, setLoading] = useState(true)
```

**Lógica Principal**:
```typescript
const fetchInvoiceData = async () => {
  if (invoiceId) {
    // Buscar fatura específica
    const invoice = await supabase
      .from('credit_card_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()
  } else {
    // Buscar fatura atual (mais recente em aberto)
    const invoice = await supabase
      .from('credit_card_invoices')
      .select('*')
      .eq('credit_card_id', card.id)
      .in('status', ['open', 'closed'])
      .order('reference_month', { ascending: false })
      .limit(1)
      .single()
  }

  // Buscar transações da fatura
  const transactions = await supabase
    .from('transactions')
    .select('*')
    .eq('invoice_id', invoice.id)
    .order('date', { ascending: false })
}
```

**Estatísticas por Categoria**:
```typescript
const stats = useMemo(() => {
  const byCategory = {}
  
  transactions.forEach(t => {
    const categoryId = t.category_id || 'sem-categoria'
    if (!byCategory[categoryId]) {
      byCategory[categoryId] = { 
        name: getCategoryName(t.category_id), 
        total: 0, 
        count: 0 
      }
    }
    byCategory[categoryId].total += t.amount
    byCategory[categoryId].count += 1
  })

  return Object.values(byCategory).sort((a, b) => b.total - a.total)
}, [transactions, categories])
```

---

## 🎨 Componentes Visuais

### **1. Header do Modal**
```tsx
<div className="flex items-center gap-4">
  <div className="w-16 h-16 rounded-full bg-purple-50">
    {card.icon}
  </div>
  <div>
    <h2>{card.card_name}</h2>
    <p>•••• {card.last_four_digits}</p>
    <p>Fatura de {monthName} {year}</p>
  </div>
</div>
```

### **2. Resumo com Destaque**
```tsx
<div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6">
  <div className="grid grid-cols-3 gap-6">
    <div>
      <p>Total da Fatura</p>
      <p className="text-3xl font-bold">R$ 1.287,50</p>
    </div>
    <div>
      <p>Fechamento</p>
      <p className="text-xl">10/10/2024</p>
    </div>
    <div>
      <p>Vencimento</p>
      <p className="text-xl">15/10/2024</p>
    </div>
  </div>
  
  <!-- Barra de progresso -->
  <div className="bg-purple-200 rounded-full h-3">
    <div className="bg-purple-600 h-3 rounded-full" style="width: 16.1%" />
  </div>
</div>
```

### **3. Gastos por Categoria**
```tsx
<div className="space-y-2">
  {stats.map(stat => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <Tag size={18} />
        <span>{stat.name}</span>
        <span>({stat.count})</span>
      </div>
      <span>{formatCurrency(stat.total)}</span>
    </div>
  ))}
</div>
```

### **4. Lista de Transações**
```tsx
<div className="space-y-2 max-h-96 overflow-y-auto">
  {transactions.map(transaction => (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex justify-between">
        <div>
          <p className="font-medium">{transaction.description}</p>
          {transaction.installment_number && (
            <span className="badge">3/12</span>
          )}
          <div className="text-sm text-gray-600">
            <Calendar size={14} /> {formatDate(transaction.date)}
            <Tag size={14} /> {getCategoryName(transaction.category_id)}
          </div>
        </div>
        <p className="text-lg font-semibold text-red-600">
          {formatCurrency(transaction.amount)}
        </p>
      </div>
    </div>
  ))}
</div>
```

---

## 🔄 Fluxo de Uso

### **Abrir Modal:**
```
1. Usuário acessa "Contas e Cartões"
2. Clica na aba "Cartões de Crédito"
3. Vê card do cartão com fatura atual
4. Clica em "Ver Fatura Detalhada"
5. Modal abre mostrando todos os detalhes
```

### **Informações Exibidas:**
```
Modal mostra:
├─ Cabeçalho com nome e número do cartão
├─ Total da fatura
├─ Datas de fechamento e vencimento
├─ Barra de progresso do limite
├─ Status (Aberta/Fechada/Paga/Vencida)
├─ Gastos por categoria (top categorias)
└─ Lista completa de transações
```

---

## 💡 Badges Especiais

### **Parcelas:**
```tsx
{transaction.installment_number && transaction.total_installments && (
  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
    {transaction.installment_number}/{transaction.total_installments}
  </span>
)}
```

### **Recorrências:**
```tsx
{transaction.is_recurring && (
  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
    Recorrente
  </span>
)}
```

---

## 📊 Benefícios

### **1. Transparência Total**
- ✅ Vê exatamente o que comprou
- ✅ Sabe de onde veio cada valor
- ✅ Identifica parcelas e recorrências

### **2. Controle Financeiro**
- ✅ Analisa gastos por categoria
- ✅ Vê quanto falta até o limite
- ✅ Verifica status da fatura

### **3. Planejamento**
- ✅ Sabe quanto vai pagar
- ✅ Identifica onde pode cortar gastos
- ✅ Prepara-se para o vencimento

---

## 🎯 Exemplos Práticos

### **Exemplo 1: Fatura de Outubro**
```
Transações:
1. 01/10 - Supermercado XYZ          R$ 238,50  [🍔 Alimentação]
2. 05/10 - Netflix                   R$ 39,90   [📱 Assinaturas] [Recorrente]
3. 08/10 - Uber                      R$ 45,00   [🚗 Transporte]
4. 12/10 - Restaurante ABC           R$ 187,00  [🍔 Alimentação]
5. 15/10 - Notebook Dell             R$ 300,00  [💻 Tecnologia] [3/12]
6. 18/10 - Gasolina                  R$ 250,00  [🚗 Transporte]
7. 22/10 - Cinema                    R$ 65,00   [🎬 Lazer]
8. 25/10 - Farmácia                  R$ 127,10  [💊 Saúde]

Total: R$ 1.252,50

Por Categoria:
• Alimentação: R$ 425,50 (2 compras)
• Tecnologia: R$ 300,00 (1 compra) ← Parcela
• Transporte: R$ 295,00 (2 compras)
• Lazer: R$ 65,00 (1 compra)
• Saúde: R$ 127,10 (1 compra)
• Assinaturas: R$ 39,90 (1 compra) ← Recorrente
```

### **Exemplo 2: Identificação Visual**
```
Transações com Badges:
├─ "Netflix" + badge laranja "Recorrente"
│  → Usuário sabe que é custo fixo mensal
│
├─ "Notebook Dell (3/12)" + badge azul "3/12"
│  → Usuário sabe que é parcela 3 de 12
│
└─ "Supermercado XYZ" (sem badge)
   → Compra única normal
```

---

## 🔍 Estados da Fatura

### **Status Visual:**

| Status | Badge | Cor | Descrição |
|--------|-------|-----|-----------|
| `open` | 📂 Aberta | Azul | Ainda recebendo compras |
| `closed` | 🔒 Fechada | Amarelo | Fechada, aguardando pagamento |
| `paid` | ✅ Paga | Verde | Totalmente paga |
| `overdue` | ⚠️ Vencida | Vermelho | Passou do vencimento |
| `partial` | ⏳ Parcial | Laranja | Paga parcialmente |

---

## 📝 Uso em Diferentes Cenários

### **Cenário 1: Analisar Gastos**
```
Usuário abre fatura e vê:
├─ Alimentação: R$ 425,50
│  → "Nossa, gastei muito em comida!"
├─ Lazer: R$ 315,00
│  → "Saí demais esse mês"
└─ Pode ajustar comportamento no próximo mês
```

### **Cenário 2: Verificar Parcela**
```
Usuário vê:
├─ "Notebook Dell (3/12)" - R$ 300
│  → Confirma que a parcela 3 está na fatura
│  → Sabe que faltam 9 parcelas
└─ Pode planejar os próximos meses
```

### **Cenário 3: Conferir Recorrências**
```
Usuário vê badges "Recorrente":
├─ Netflix: R$ 39,90
├─ Spotify: R$ 19,90
├─ Gym: R$ 99,00
└─ Total recorrente: R$ 158,80/mês
   → Sabe que terá esse gasto todo mês
```

---

## 🚀 Próximas Melhorias

### **Fase Atual**: Visualização ✅
- [x] Modal de fatura
- [x] Lista de transações
- [x] Estatísticas por categoria
- [x] Status visual

### **Próximas Fases**:
- [ ] Botão "Pagar Fatura" funcional
- [ ] Histórico de faturas (meses anteriores)
- [ ] Gráfico pizza por categoria
- [ ] Exportar fatura (PDF/CSV)
- [ ] Comparativo mês a mês
- [ ] Alerta de gastos anormais

---

## 📋 Arquivos Criados/Modificados

### **Criados**:
- ✅ `src/components/InvoiceModal.tsx` - Modal de fatura

### **Modificados**:
- ✅ `src/pages/BankAccounts.tsx` - Botão "Ver Fatura"
- ✅ `src/hooks/useTransactions.ts` - Vinculação automática
- ✅ `src/hooks/useInstallments.ts` - Vincular parcelas

### **SQL**:
- ✅ `debug-invoices.sql` - Diagnóstico
- ✅ `fix-link-existing-transactions-to-invoices.sql` - Correção
- ✅ `update-installments-payment-method.sql` - Atualizado

---

## ✅ Checklist

- [x] InvoiceModal criado
- [x] Botão "Ver Fatura" adicionado
- [x] Busca fatura atual automaticamente
- [x] Exibe todas as transações
- [x] Agrupa por categoria
- [x] Mostra badges especiais
- [x] Barra de progresso do limite
- [x] Status visual da fatura
- [x] Sem erros de linting
- [ ] Executar migrations SQL (usuário)

---

## 🎉 Conclusão

**Agora você pode:**
✅ Ver todas as compras da fatura  
✅ Identificar parcelas e recorrências  
✅ Analisar gastos por categoria  
✅ Conferir se está tudo correto  
✅ Saber exatamente quanto vai pagar  

**Sistema completo de visualização de faturas implementado!** 🚀

**Para ver os valores corretos, execute:**
1. `migration-credit-cards-system.sql`
2. `update-installments-payment-method.sql`
3. `fix-link-existing-transactions-to-invoices.sql`

**Depois, clique em "Ver Fatura Detalhada" em qualquer cartão!** ✨

