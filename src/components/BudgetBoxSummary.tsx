import { useState } from 'react'
import { useBudgetBoxStats } from '@/hooks/useBudgetBoxStats'
import { formatCurrency } from '@/utils/formatters'
import { BudgetBoxTransactionsModal } from '@/components/BudgetBoxTransactionsModal'

interface BudgetBoxSummaryProps {
  monthlyIncome: number
  className?: string
}

export function BudgetBoxSummary({ monthlyIncome, className = '' }: BudgetBoxSummaryProps) {
  const { stats, totalBudget, totalSpent, totalUtilization, loading } = useBudgetBoxStats(monthlyIncome)
  const [selectedBox, setSelectedBox] = useState<{
    id: string
    name: string
    icon: string
    color: string
  } | null>(null)

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo das Caixas</h3>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Nenhuma caixa de planejamento configurada</p>
          <p className="text-xs mt-1">Configure suas caixas nas configurações</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Resumo das Caixas</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">Utilização Total</p>
          <p className={`text-xl font-bold ${
            totalUtilization > 100 ? 'text-red-600' : 
            totalUtilization > 80 ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {totalUtilization.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600">Orçamento Total</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(totalBudget)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Gasto Total</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Saldo Restante</p>
          <p className={`text-lg font-semibold ${
            totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(totalBudget - totalSpent)}
          </p>
        </div>
      </div>

      {/* Lista de Caixas */}
      <div className="space-y-3">
        {stats.map((box) => (
          <div
            key={box.id}
            onClick={() => setSelectedBox({
              id: box.id,
              name: box.name,
              icon: box.icon,
              color: box.color
            })}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{box.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{box.name}</p>
                <p className="text-sm text-gray-500">{box.percentage}% da renda</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(box.spentAmount)}
                </span>
                <span className="text-sm text-gray-500">
                  / {formatCurrency(box.budgetAmount)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      box.utilizationPercent > 100 ? 'bg-red-500' : 
                      box.utilizationPercent > 80 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(box.utilizationPercent, 100)}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-medium ${
                  box.utilizationPercent > 100 ? 'text-red-600' : 
                  box.utilizationPercent > 80 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {box.utilizationPercent.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {stats.some(box => box.utilizationPercent > 100) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <p className="text-sm text-red-800">
              {stats.filter(box => box.utilizationPercent > 100).length} caixa(s) excederam o orçamento
            </p>
          </div>
        </div>
      )}

      {stats.some(box => box.utilizationPercent > 80 && box.utilizationPercent <= 100) && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">⚠️</span>
            <p className="text-sm text-yellow-800">
              {stats.filter(box => box.utilizationPercent > 80 && box.utilizationPercent <= 100).length} caixa(s) próximas do limite
            </p>
          </div>
        </div>
      )}

      {/* Modal de Transações */}
      {selectedBox && (
        <BudgetBoxTransactionsModal
          isOpen={!!selectedBox}
          onClose={() => setSelectedBox(null)}
          budgetBoxId={selectedBox.id}
          budgetBoxName={selectedBox.name}
          budgetBoxIcon={selectedBox.icon}
          budgetBoxColor={selectedBox.color}
        />
      )}
    </div>
  )
}