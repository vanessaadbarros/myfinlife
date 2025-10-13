import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Edit2, 
  Copy, 
  Trash2, 
  Calendar,
  DollarSign,
  Tag
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { Database } from '@/types/supabase'

type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']

interface RecurringTransactionListProps {
  recurringTransactions: RecurringTransaction[]
  onEdit: (transaction: RecurringTransaction) => void
  onDuplicate: (transaction: RecurringTransaction) => void
  onDelete: (transaction: RecurringTransaction) => void
}

export function RecurringTransactionList({
  recurringTransactions,
  onEdit,
  onDuplicate,
  onDelete
}: RecurringTransactionListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all')

  // Filtrar transações por tipo
  const filteredTransactions = recurringTransactions.filter(transaction => {
    if (activeTab === 'all') return true
    return transaction.type === activeTab
  })

  // Agrupar por tipo
  const incomeTransactions = recurringTransactions.filter(t => t.type === 'income')
  const expenseTransactions = recurringTransactions.filter(t => t.type === 'expense')

  // Calcular totais
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

  const getFrequencyLabel = (frequency: string) => {
    const labels: { [key: string]: string } = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    }
    return labels[frequency] || frequency
  }

  const getFrequencyColor = (frequency: string) => {
    const colors: { [key: string]: string } = {
      daily: 'bg-blue-100 text-blue-800',
      weekly: 'bg-green-100 text-green-800',
      monthly: 'bg-purple-100 text-purple-800',
      quarterly: 'bg-orange-100 text-orange-800',
      yearly: 'bg-red-100 text-red-800'
    }
    return colors[frequency] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (type: 'income' | 'expense') => {
    return type === 'income' ? '💰' : '💸'
  }

  const getCategoryColor = (type: 'income' | 'expense') => {
    return type === 'income' ? 'bg-green-100' : 'bg-red-100'
  }

  const getCategoryTextColor = (type: 'income' | 'expense') => {
    return type === 'income' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Todas ({recurringTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'income'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Receitas ({incomeTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'expense'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Despesas ({expenseTransactions.length})
        </button>
      </div>

      {/* Lista de Transações */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Ícone da categoria */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(transaction.type)}`}>
                    <span className="text-lg">{getCategoryIcon(transaction.type)}</span>
                  </div>

                  {/* Informações principais */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{transaction.description}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(transaction.type)} ${getCategoryTextColor(transaction.type)}`}>
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{getFrequencyLabel(transaction.frequency)}</span>
                      </div>
                      
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFrequencyColor(transaction.frequency)}`}>
                        {getFrequencyLabel(transaction.frequency)}
                      </span>
                      
                      {transaction.category_id && (
                        <div className="flex items-center gap-1">
                          <Tag size={14} />
                          <span>Categorizado</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Valor */}
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getCategoryTextColor(transaction.type)}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      por {getFrequencyLabel(transaction.frequency).toLowerCase()}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(transaction)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Copy size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Notas */}
              {transaction.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">{transaction.notes}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <DollarSign size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma transação recorrente encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'all' 
              ? 'Comece criando sua primeira transação recorrente'
              : `Nenhuma ${activeTab === 'income' ? 'receita' : 'despesa'} recorrente cadastrada`
            }
          </p>
        </Card>
      )}

      {/* Resumo dos Totais */}
      {recurringTransactions.length > 0 && (
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total de {activeTab === 'all' ? 'transações' : activeTab === 'income' ? 'receitas' : 'despesas'}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {activeTab === 'all' 
                  ? `${formatCurrency(totalIncome - totalExpenses)}`
                  : activeTab === 'income'
                  ? `+${formatCurrency(totalIncome)}`
                  : `-${formatCurrency(totalExpenses)}`
                }
              </div>
              <div className="text-sm text-gray-500">
                {activeTab === 'all' ? 'Saldo líquido' : 'Total mensal'}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
