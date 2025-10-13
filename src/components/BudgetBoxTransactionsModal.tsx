import { useMemo } from 'react'
import { X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency, getCurrentMonthYear, formatDate } from '@/utils/formatters'

interface BudgetBoxTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
  budgetBoxId: string
  budgetBoxName: string
  budgetBoxIcon: string
  budgetBoxColor: string
}

export function BudgetBoxTransactionsModal({
  isOpen,
  onClose,
  budgetBoxId,
  budgetBoxName,
  budgetBoxIcon,
  budgetBoxColor
}: BudgetBoxTransactionsModalProps) {
  const { month, year } = getCurrentMonthYear()
  const { transactions } = useTransactions(month, year)
  const { categories } = useCategories()

  // Filtrar transações da caixa
  const boxTransactions = useMemo(() => {
    return transactions
      .filter(t => t.budget_box_id === budgetBoxId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, budgetBoxId])

  // Calcular totais
  const totals = useMemo(() => {
    const expenses = boxTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const investments = boxTransactions
      .filter(t => t.type === 'investment')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      expenses,
      investments,
      total: expenses + investments
    }
  }, [boxTransactions])

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Sem categoria'
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Sem categoria'
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'expense':
        return 'Despesa'
      case 'investment':
        return 'Investimento'
      case 'income':
        return 'Receita'
      default:
        return type
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'expense':
        return 'text-red-600 bg-red-50'
      case 'investment':
        return 'text-blue-600 bg-blue-50'
      case 'income':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${budgetBoxColor}20` }}
            >
              {budgetBoxIcon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{budgetBoxName}</h2>
              <p className="text-sm text-gray-600">Transações do mês</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Despesas</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(totals.expenses)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Investimentos</p>
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(totals.investments)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(totals.total)}
            </p>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="max-h-96 overflow-y-auto">
          {boxTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Nenhuma transação encontrada</p>
              <p className="text-sm">Esta caixa ainda não possui transações neste mês</p>
            </div>
          ) : (
            <div className="space-y-3">
              {boxTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                        {getTransactionTypeLabel(transaction.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>{getCategoryName(transaction.category_id)}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                  <div className="text-right">
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
