import { Card } from '@/components/ui/Card'
import { AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

interface BudgetImpactCardProps {
  totalRecurringExpenses: number
  monthlyIncome: number
  budgetImpactPercentage: number
  impactByBox: Array<{
    boxId: string
    boxName: string
    boxIcon: string
    boxColor: string
    totalAmount: number
    count: number
    budgetAmount: number
    utilizationPercent: number
    isOverBudget: boolean
  }>
  overBudgetBoxes: number
}

export function BudgetImpactCard({
  totalRecurringExpenses,
  monthlyIncome,
  budgetImpactPercentage,
  impactByBox,
  overBudgetBoxes
}: BudgetImpactCardProps) {
  return (
    <Card className="mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Impacto no Orçamento
            </h3>
            <p className="text-gray-600">
              Seus custos recorrentes representam {budgetImpactPercentage.toFixed(1)}% da sua renda mensal
            </p>
          </div>
          {overBudgetBoxes > 0 && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle size={20} />
              <span className="font-medium">
                {overBudgetBoxes} caixa{overBudgetBoxes !== 1 ? 's' : ''} excedida{overBudgetBoxes !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Total Recorrente */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Total Recorrente</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(totalRecurringExpenses)}
            </span>
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gray-800 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(budgetImpactPercentage, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="text-right">
              Renda: {formatCurrency(monthlyIncome)}
            </span>
          </div>
        </div>

        {/* Impacto por Caixa */}
        {impactByBox.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Impacto por Caixa</h4>
            <div className="space-y-4">
              {impactByBox.map((box) => (
                <div key={box.boxId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: box.boxColor }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {box.boxIcon} {box.boxName} ({box.count})
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(box.totalAmount)}
                          </span>
                          <span className={`ml-2 text-sm font-medium ${
                            box.isOverBudget ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {box.utilizationPercent.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Barra de progresso da caixa */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            box.isOverBudget ? 'bg-red-500' : 'bg-gray-800'
                          }`}
                          style={{ width: `${Math.min(box.utilizationPercent, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Orçamento: {formatCurrency(box.budgetAmount)}</span>
                        <span className={box.isOverBudget ? 'text-red-600' : 'text-green-600'}>
                          Disponível: {formatCurrency(Math.max(0, box.budgetAmount - box.totalAmount))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {impactByBox.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <AlertTriangle size={32} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">
              Nenhuma transação recorrente vinculada às caixas de planejamento
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
