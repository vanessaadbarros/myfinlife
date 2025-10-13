import { useNavigate } from 'react-router-dom'
import { MoreVertical, TrendingUp, TrendingDown } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function RecentTransactions() {
  const navigate = useNavigate()
  const { transactions, loading } = useTransactions()
  const { categories } = useCategories()

  const recentTransactions = transactions.slice(0, 4)

  const getCategoryIcon = (categoryId: string | null, type: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (category?.icon) return category.icon
    
    // Ícones padrão baseados no tipo
    return type === 'income' ? '💰' : '💳'
  }

  const getCategoryColor = (type: string) => {
    return type === 'income' ? 'bg-green-500' : 'bg-red-500'
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
            <p className="text-sm text-gray-600">Suas últimas movimentações financeiras</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
          <p className="text-sm text-gray-600">Suas últimas movimentações financeiras</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/transactions')}
          className="text-blue-600 hover:text-blue-700"
        >
          Ver todas
        </Button>
      </div>
      
      <div className="space-y-3">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => {
            const category = categories.find(c => c.id === transaction.category_id)
            const isIncome = transaction.type === 'income'
            
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${getCategoryColor(transaction.type)} rounded-lg flex items-center justify-center text-white text-sm`}>
                    {isIncome ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {category?.name || 'Sem categoria'} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 hover:bg-gray-200"
                  >
                    <MoreVertical size={14} />
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma transação registrada</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/transactions')}
              className="mt-2"
            >
              Adicionar primeira transação
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
