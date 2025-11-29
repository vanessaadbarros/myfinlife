import { useState, useMemo } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Layout } from '@/components/Layout'
import { TransactionModal } from '@/components/TransactionModal'
import { InstallmentModal } from '@/components/InstallmentModal'
import { ResumoTable } from '@/components/ResumoTable'
import { RecentTransactions } from '@/components/RecentTransactions'
import { QuickActions } from '@/components/QuickActions'
import { BudgetBoxSummary } from '@/components/BudgetBoxSummary'
import { FutureCommitments } from '@/components/FutureCommitments'
import { InstallmentsList } from '@/components/InstallmentsList'
import { formatCurrency, getCurrentMonthYear, getMonthName } from '@/utils/formatters'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export function Dashboard() {
  const { profile } = useAuth()
  const { month, year } = getCurrentMonthYear()
  const { transactions } = useTransactions(month, year)
  const { categories } = useCategories()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false)

  // Calcular estatísticas
  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    // DESPESAS COM CAIXA = Apenas despesas vinculadas às caixas
    const expensesWithBox = transactions
      .filter((t) => t.type === 'expense' && t.budget_box_id)
      .reduce((sum, t) => sum + t.amount, 0)
    
    // INVESTIMENTOS COM CAIXA = Apenas investimentos vinculados às caixas
    const investmentsWithBox = transactions
      .filter((t) => t.type === 'investment' && t.budget_box_id)
      .reduce((sum, t) => sum + t.amount, 0)
    
    // TOTAL DE DESPESAS (todas)
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    // TOTAL DE INVESTIMENTOS (todos)
    const totalInvestments = transactions
      .filter((t) => t.type === 'investment')
      .reduce((sum, t) => sum + t.amount, 0)
    
    // ORÇAMENTO CONSUMIDO = Despesas + Investimentos COM caixa
    const budgetConsumed = expensesWithBox + investmentsWithBox
    
    // SALDO DA CARTEIRA = Receitas - Total de Despesas
    // (Investimentos NÃO diminuem a carteira)
    const walletBalance = income - totalExpenses
    
    // SALDO DO ORÇAMENTO = Renda - Orçamento Consumido (apenas das caixas)
    const budgetRemaining = income - budgetConsumed

    return { 
      income,           // Total de receitas
      expenses: expensesWithBox,         // Despesas COM caixa (para os cards)
      investments: investmentsWithBox,   // Investimentos COM caixa (para os cards)
      totalExpenses,    // Total de despesas (todas)
      totalInvestments, // Total de investimentos (todos)
      walletBalance,    // Saldo real da carteira
      budgetConsumed,   // Total consumido do orçamento das caixas
      budgetRemaining,  // Saldo restante do orçamento
      balance: walletBalance // Mantém compatibilidade
    }
  }, [transactions])

  // Preparar dados para o gráfico de pizza
  const chartData = useMemo(() => {
    const expensesByCategory: { [key: string]: number } = {}
    
    transactions
      .filter((t) => t.type === 'expense' && t.category_id)
      .forEach((t) => {
        if (t.category_id) {
          expensesByCategory[t.category_id] = (expensesByCategory[t.category_id] || 0) + t.amount
        }
      })

    return Object.entries(expensesByCategory)
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId)
        return {
          name: category?.name || 'Sem categoria',
          value: amount,
          color: category?.color || '#64748b',
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6) // Top 6 categorias
  }, [transactions, categories])



  // Dados para o gráfico mensal (últimos 4 meses)
  const monthlyData = useMemo(() => {
    const months = []
    for (let i = 3; i >= 0; i--) {
      const targetMonth = month - i
      const targetYear = targetMonth < 0 ? year - 1 : year
      const adjustedMonth = targetMonth < 0 ? 12 + targetMonth : targetMonth
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate.getMonth() === adjustedMonth && tDate.getFullYear() === targetYear
      })
      
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      
      months.push({
        month: getMonthName(adjustedMonth).slice(0, 3),
        receitas: income,
        despesas: expenses
      })
    }
    return months
  }, [transactions, month, year])

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Message */}
        <Card variant="elevated" className="bg-gradient-to-r from-myfinlife-blue to-myfinlife-blue/90 text-myfinlife-white border-none">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-2">
              Olá, {profile?.name}! Bem-vindo de volta
            </h2>
            <p className="text-myfinlife-blue-light">
              Aqui está um resumo das suas finanças para {getMonthName(month)} de {year}
            </p>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" className="relative">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-success-500/10 rounded-hex flex items-center justify-center">
                <TrendingUp className="text-success-500" size={20} />
              </div>
            </div>
            <CardContent className="pt-2">
              <p className="text-sm text-myfinlife-blue/70 mb-1">Receitas</p>
              <p className="text-3xl font-bold text-myfinlife-blue mb-2">
                {formatCurrency(stats.income)}
              </p>
              <Badge variant="success" size="sm">
                <TrendingUp size={12} className="mr-1" />
                ↑ 12.5% vs mês anterior
              </Badge>
            </CardContent>
          </Card>

          <Card variant="elevated" className="relative">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-danger-500/10 rounded-hex flex items-center justify-center">
                <TrendingDown className="text-danger-500" size={20} />
              </div>
            </div>
            <CardContent className="pt-2">
              <p className="text-sm text-myfinlife-blue/70 mb-1">Despesas</p>
              <p className="text-3xl font-bold text-myfinlife-blue mb-2">
                {formatCurrency(stats.expenses)}
              </p>
              <Badge variant="danger" size="sm">
                <TrendingDown size={12} className="mr-1" />
                ↓ 8.2% vs mês anterior
              </Badge>
            </CardContent>
          </Card>

          <Card variant="elevated" className="relative">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-myfinlife-blue/10 rounded-hex flex items-center justify-center">
                <TrendingUp className="text-myfinlife-blue" size={20} />
              </div>
            </div>
            <CardContent className="pt-2">
              <p className="text-sm text-myfinlife-blue/70 mb-1">Investimentos</p>
              <p className="text-3xl font-bold text-myfinlife-blue mb-2">
                {formatCurrency(stats.investments)}
              </p>
              <Badge variant="info" size="sm">
                <TrendingUp size={12} className="mr-1" />
                Poupança do mês
              </Badge>
            </CardContent>
          </Card>

          <Card variant="elevated" className="relative">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-myfinlife-blue-light/20 rounded-hex flex items-center justify-center">
                <DollarSign className="text-myfinlife-blue" size={20} />
              </div>
            </div>
            <CardContent className="pt-2">
              <p className="text-sm text-myfinlife-blue/70 mb-1">Saldo da Carteira</p>
              <p className="text-3xl font-bold text-myfinlife-blue mb-2">
                {formatCurrency(stats.walletBalance)}
              </p>
              <Badge variant={stats.walletBalance >= 0 ? "success" : "danger"} size="sm">
                {stats.walletBalance >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                Receitas - Despesas
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Budget Status Card */}
        <Card variant="elevated" className="mb-8">
          <CardHeader>
            <CardTitle>Status do Orçamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-myfinlife-gray-light rounded-hex">
                <p className="text-sm text-myfinlife-blue/70 mb-2">Orçamento Total</p>
                <p className="text-2xl font-bold text-myfinlife-blue">
                  {formatCurrency(stats.income)}
                </p>
              </div>
              <div className="text-center p-4 bg-myfinlife-blue-light/20 rounded-hex">
                <p className="text-sm text-myfinlife-blue/70 mb-2">Consumido (Despesas + Investimentos)</p>
                <p className="text-2xl font-bold text-myfinlife-blue">
                  {formatCurrency(stats.budgetConsumed)}
                </p>
                <Badge variant="info" size="sm" className="mt-2">
                  {stats.income > 0 ? ((stats.budgetConsumed / stats.income) * 100).toFixed(1) : 0}% usado
                </Badge>
              </div>
              <div className="text-center p-4 bg-myfinlife-gray-light rounded-hex">
                <p className="text-sm text-myfinlife-blue/70 mb-2">Saldo do Orçamento</p>
                <p className={`text-2xl font-bold ${stats.budgetRemaining >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
                  {formatCurrency(stats.budgetRemaining)}
                </p>
                <Badge variant={stats.budgetRemaining >= 0 ? "success" : "danger"} size="sm" className="mt-2">
                  {stats.budgetRemaining >= 0 ? 'Dentro do planejado' : 'Excedeu o orçamento'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Table */}
        <ResumoTable monthlyIncome={stats.income} />

        {/* Budget Box Summary */}
        <BudgetBoxSummary monthlyIncome={stats.income} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Despesas por Categoria */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
              <p className="text-sm text-myfinlife-blue/70">
                Distribuição dos gastos do mês atual
              </p>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-myfinlife-blue/50">
                  Nenhuma despesa registrada este mês
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visão Mensal */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Visão Mensal</CardTitle>
              <p className="text-sm text-myfinlife-blue/70">
                Comparativo de receitas e despesas
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#B3DFFA" />
                  <XAxis dataKey="month" stroke="#1A3F6B" />
                  <YAxis stroke="#1A3F6B" />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Future Commitments */}
        <FutureCommitments className="mb-8" />

        {/* Installments List */}
        <InstallmentsList />

        {/* Recent Transactions and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <RecentTransactions />
          <QuickActions 
            onNewTransaction={() => setIsModalOpen(true)}
            onNewInstallment={() => setIsInstallmentModalOpen(true)}
          />
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
        >
          <Plus size={28} />
        </button>

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        <InstallmentModal
          isOpen={isInstallmentModalOpen}
          onClose={() => setIsInstallmentModalOpen(false)}
        />
      </div>
    </Layout>
  )
}

