import { useNavigate } from 'react-router-dom'
import { MoreVertical, TrendingUp, TrendingDown } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

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
    return type === 'income' ? 'bg-success-500' : 'bg-danger-500'
  }

  if (loading) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <p className="text-sm text-myfinlife-blue/70">Suas últimas movimentações financeiras</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-myfinlife-gray-light rounded-hex animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-myfinlife-blue-light rounded-hex"></div>
                  <div>
                    <div className="h-4 bg-myfinlife-blue-light rounded w-24 mb-1"></div>
                    <div className="h-3 bg-myfinlife-blue-light rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-myfinlife-blue-light rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Transações Recentes</CardTitle>
            <p className="text-sm text-myfinlife-blue/70">Suas últimas movimentações financeiras</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/transactions')}
            className="text-myfinlife-blue hover:text-myfinlife-blue/80"
          >
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.category_id)
              const isIncome = transaction.type === 'income'
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-myfinlife-gray-light rounded-hex hover:bg-myfinlife-blue-light/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${getCategoryColor(transaction.type)} rounded-hex flex items-center justify-center text-myfinlife-white text-sm`}>
                      {isIncome ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-myfinlife-blue">{transaction.description}</p>
                      <p className="text-sm text-myfinlife-blue/70">
                        {category?.name || 'Sem categoria'} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${isIncome ? 'text-success-500' : 'text-danger-500'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0 hover:bg-myfinlife-blue-light"
                    >
                      <MoreVertical size={14} />
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-myfinlife-blue/50">
              <p>Nenhuma transação registrada</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/transactions')}
                className="mt-2 text-myfinlife-blue"
              >
                Adicionar primeira transação
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
