import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash2, Filter, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TransactionModal } from '@/components/TransactionModal'
import { formatCurrency, formatDate, getCurrentMonthYear, getMonthName } from '@/utils/formatters'
import { Database } from '@/types/supabase'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TabType = 'all' | 'income' | 'expense' | 'pending'

export function Transactions() {
  const navigate = useNavigate()
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const { transactions, loading, deleteTransaction } = useTransactions(selectedMonth, selectedYear)
  const { categories } = useCategories()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      await deleteTransaction(id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  // Filtrar transações por aba
  const filteredTransactions = useMemo(() => {
    const now = new Date()
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (activeTab) {
      case 'income':
        return transactions.filter(t => t.type === 'income')
      case 'expense':
        return transactions.filter(t => t.type === 'expense' || t.type === 'investment')
      case 'pending':
        // Transações futuras (data maior que hoje)
        return transactions.filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate > currentDate
        })
      default:
        return transactions
    }
  }, [transactions, activeTab])

  // Calcular totais por tipo
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

  // Gerar lista de meses para o filtro
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: getMonthName(i),
  }))

  // Gerar lista de anos (últimos 3 anos)
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i)

  const tabs = [
    { id: 'all' as TabType, label: 'Todas', icon: <Filter size={18} />, count: transactions.length },
    { id: 'income' as TabType, label: 'Receitas', icon: <TrendingUp size={18} />, count: transactions.filter(t => t.type === 'income').length },
    { id: 'expense' as TabType, label: 'Despesas', icon: <TrendingDown size={18} />, count: transactions.filter(t => t.type === 'expense' || t.type === 'investment').length },
    { id: 'pending' as TabType, label: 'Pendências', icon: <Clock size={18} />, count: transactions.filter(t => new Date(t.date) > new Date()).length },
  ]

  return (
    <Layout
      title="Histórico de Transações"
      showBackButton={true}
      onBack={() => navigate('/dashboard')}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Summary Cards */}
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
          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Despesas</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(stats.expenses)}</p>
              </div>
              <TrendingDown size={32} className="text-red-600" />
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Pendências</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.pending)}</p>
              </div>
              <Clock size={32} className="text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-gray-600" />
            <div className="flex gap-4 flex-1">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mês
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
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

        {/* Transactions List */}
        <Card className="p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Carregando...</div>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => {
                const category = categories.find((c) => c.id === transaction.category_id)
                const transactionDate = new Date(transaction.date)
                const now = new Date()
                const isPending = transactionDate > now
                
                return (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-lg hover:bg-gray-100 transition ${
                      isPending ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-3xl">{category?.icon || '📦'}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          {isPending && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Pendente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(transaction.date)} • {category?.name || 'Sem categoria'}
                        </p>
                      </div>
                      <p className={`text-lg font-semibold ${
                        transaction.type === 'income' 
                          ? 'text-green-600' 
                          : transaction.type === 'investment'
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">Nenhuma transação encontrada</p>
              <p className="text-sm">
                {activeTab === 'all' 
                  ? 'Adicione sua primeira transação no dashboard'
                  : `Nenhuma transação do tipo "${tabs.find(t => t.id === activeTab)?.label}" encontrada`
                }
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transaction={editingTransaction}
      />
    </Layout>
  )
}

