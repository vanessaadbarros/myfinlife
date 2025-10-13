import { useBudgetBoxSpending, BudgetBoxSpending } from '@/hooks/useBudgetBoxSpending'
import { formatCurrency } from '@/utils/formatters'

interface BudgetBoxProgressProps {
  month?: number
  year?: number
  className?: string
  showDetails?: boolean
  compact?: boolean
}

export function BudgetBoxProgress({ 
  month, 
  year, 
  className = '',
  showDetails = true,
  compact = false
}: BudgetBoxProgressProps) {
  const { 
    spending, 
    loading, 
    error, 
    getTotalSpent, 
    getTotalBudget, 
    getOverBudgetBoxes 
  } = useBudgetBoxSpending(month, year)

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600 text-sm">
          Erro ao carregar dados das caixas: {error.message}
        </p>
      </div>
    )
  }

  const totalSpent = getTotalSpent()
  const totalBudget = getTotalBudget()
  const overBudgetBoxes = getOverBudgetBoxes()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com resumo geral */}
      {showDetails && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Resumo do Planejamento</h3>
            <span className={`text-sm font-medium ${
              totalSpent > totalBudget ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                totalSpent > totalBudget ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            ></div>
          </div>
          {overBudgetBoxes.length > 0 && (
            <p className="text-red-600 text-xs mt-2">
              ⚠️ {overBudgetBoxes.length} caixa(s) excederam o orçamento
            </p>
          )}
        </div>
      )}

      {/* Lista de caixas */}
      <div className="space-y-3">
        {spending.map((box) => (
          <BudgetBoxItem
            key={box.id}
            box={box}
            compact={compact}
            showDetails={showDetails}
          />
        ))}
      </div>

      {/* Estado vazio */}
      {spending.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Nenhuma caixa de planejamento configurada
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Configure suas caixas nas configurações
          </p>
        </div>
      )}
    </div>
  )
}

interface BudgetBoxItemProps {
  box: BudgetBoxSpending
  compact?: boolean
  showDetails?: boolean
}

function BudgetBoxItem({ box, compact = false, showDetails = true }: BudgetBoxItemProps) {
  const progressPercentage = Math.min(box.spentPercentage, 100)
  const isOverBudget = box.spentPercentage > 100

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
        <div className="flex items-center gap-3">
          <span className="text-lg">{box.icon}</span>
          <div>
            <p className="font-medium text-gray-900 text-sm">{box.name}</p>
            {showDetails && (
              <p className="text-xs text-gray-500">
                {formatCurrency(box.spentAmount)} / {formatCurrency(box.budgetAmount)}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                isOverBudget ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className={`text-xs font-medium ${
            isOverBudget ? 'text-red-600' : 'text-gray-600'
          }`}>
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{box.icon}</span>
          <div>
            <h4 className="font-semibold text-gray-900">{box.name}</h4>
            {showDetails && (
              <p className="text-sm text-gray-500">
                {box.percentage}% da renda mensal
              </p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <p className={`font-semibold ${
            isOverBudget ? 'text-red-600' : 'text-gray-900'
          }`}>
            {formatCurrency(box.spentAmount)}
          </p>
          {showDetails && (
            <p className="text-sm text-gray-500">
              de {formatCurrency(box.budgetAmount)}
            </p>
          )}
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isOverBudget ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Informações detalhadas */}
      {showDetails && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>{progressPercentage.toFixed(1)}% usado</span>
            {box.remainingAmount > 0 && (
              <span className="text-green-600">
                {formatCurrency(box.remainingAmount)} restante
              </span>
            )}
            {isOverBudget && (
              <span className="text-red-600 font-medium">
                Excedeu em {formatCurrency(box.spentAmount - box.budgetAmount)}
              </span>
            )}
          </div>
          
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: box.color }}
          ></div>
        </div>
      )}
    </div>
  )
}
