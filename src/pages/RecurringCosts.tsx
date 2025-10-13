import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Layout } from '@/components/Layout'
import { useRecurringTransactions, useRecurringTransactionImpact } from '@/hooks/useRecurringTransactions'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/utils/formatters'
import { RecurringTransactionModal } from '@/components/RecurringTransactionModal'
import { RecurringTransactionList } from '@/components/RecurringTransactionList'
import { BudgetImpactCard } from '@/components/BudgetImpactCard'

export function RecurringCosts() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useAuth()
  const { 
    recurringTransactions, 
    loading, 
    stats,
    refresh,
    deleteRecurringTransaction,
    generateMonthlyTransactions
  } = useRecurringTransactions()
  
  const { impactByBox, overBudgetBoxes, totalRecurringExpenses } = useRecurringTransactionImpact()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)

  const monthlyIncome = (profile?.settings as any)?.monthly_income || 0

  // Debug logs
  console.log('🔍 Debug RecurringCosts:')
  console.log('- profile:', profile)
  console.log('- monthlyIncome:', monthlyIncome)
  console.log('- stats:', stats)
  console.log('- impactByBox:', impactByBox)

  // Função temporária para definir renda mensal (debug)
  const setMonthlyIncomeDebug = async () => {
    if (!profile) return
    try {
      const currentSettings = profile?.settings as any || {}
      await updateProfile({
        settings: {
          ...currentSettings,
          monthly_income: 5000
        }
      })
      alert('Renda mensal definida como R$ 5.000 para teste!')
    } catch (error) {
      console.error('Erro ao definir renda:', error)
    }
  }

  // Gerar transações do mês atual
  const handleGenerateTransactions = async () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    
    try {
      const { error } = await generateMonthlyTransactions(month, year)
      if (error) {
        alert('Erro ao gerar transações: ' + error.message)
      } else {
        alert('Transações geradas com sucesso!')
        // Recarregar a página para mostrar as novas transações
        window.location.reload()
      }
    } catch (error) {
      console.error('Erro ao gerar transações:', error)
      alert('Erro ao gerar transações')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando custos recorrentes...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout 
      title="Custos Recorrentes" 
      showBackButton={true}
      onBack={() => navigate('/dashboard')}
    >
      <div className="space-y-6">
        {/* Debug Button */}
        {monthlyIncome === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-yellow-800 font-medium">Renda mensal não configurada</h3>
                <p className="text-yellow-700 text-sm">Configure sua renda para ver o impacto no orçamento</p>
              </div>
              <button
                onClick={setMonthlyIncomeDebug}
                className="text-xs bg-yellow-100 text-yellow-800 px-3 py-2 rounded hover:bg-yellow-200"
              >
                🐛 Definir Renda R$ 5.000
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleGenerateTransactions}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Calendar size={20} className="mr-2" />
            Gerar Transações do Mês
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={20} className="mr-2" />
            Novo Custo Recorrente
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Receitas Recorrentes */}
          <Card className="relative">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-1">Receitas Recorrentes</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(stats.totalRecurringIncome)}
              </p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp size={14} className="mr-1" />
                Renda fixa mensal
              </p>
            </div>
          </Card>

          {/* Despesas Recorrentes */}
          <Card className="relative">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600" size={20} />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-1">Despesas Recorrentes</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(stats.totalRecurringExpenses)}
              </p>
              <p className="text-sm text-red-600 flex items-center">
                <TrendingDown size={14} className="mr-1" />
                Custos fixos mensais
              </p>
            </div>
          </Card>

          {/* Saldo Mensal */}
          <Card className="relative">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wallet className="text-blue-600" size={20} />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-1">Saldo Mensal</p>
              <p className={`text-3xl font-bold mb-2 ${stats.monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.monthlyBalance)}
              </p>
              <p className={`text-sm flex items-center ${stats.monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.monthlyBalance >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {stats.monthlyBalance >= 0 ? 'Superávit' : 'Déficit'}
              </p>
            </div>
          </Card>

          {/* Total de Recorrências */}
          <Card className="relative">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600" size={20} />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-1">Total de Recorrências</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalRecurringCount}
              </p>
              <p className="text-sm text-purple-600 flex items-center">
                <Calendar size={14} className="mr-1" />
                Transações ativas
              </p>
            </div>
          </Card>
        </div>

        {/* Impacto no Orçamento */}
        <BudgetImpactCard 
          totalRecurringExpenses={totalRecurringExpenses}
          monthlyIncome={monthlyIncome}
          budgetImpactPercentage={stats.budgetImpactPercentage}
          impactByBox={impactByBox}
          overBudgetBoxes={overBudgetBoxes}
        />

        {/* Lista de Transações Recorrentes */}
        <RecurringTransactionList 
          recurringTransactions={recurringTransactions}
          onEdit={(transaction) => {
            setEditingTransaction(transaction)
            setIsModalOpen(true)
          }}
          onDuplicate={(transaction) => {
            // Criar uma cópia sem o ID para duplicar
            const duplicated = {
              ...transaction,
              description: `${transaction.description} (Cópia)`,
              id: undefined
            }
            setEditingTransaction(duplicated)
            setIsModalOpen(true)
          }}
          onDelete={async (transaction) => {
            if (window.confirm(`Tem certeza que deseja excluir "${transaction.description}"?`)) {
              try {
                await deleteRecurringTransaction(transaction.id)
                refresh()
              } catch (error) {
                console.error('Erro ao excluir:', error)
                alert('Erro ao excluir transação recorrente')
              }
            }
          }}
        />

        {/* Modal para criar/editar transação recorrente */}
        <RecurringTransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTransaction(null)
          }}
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingTransaction(null)
            refresh()
          }}
          transaction={editingTransaction}
        />
      </div>
    </Layout>
  )
}
