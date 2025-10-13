import { useMemo } from 'react'
import { useBudgetBoxes } from '@/hooks/useBudgetBoxes'
import { useBudgetBoxStats } from '@/hooks/useBudgetBoxStats'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency } from '@/utils/formatters'

interface ResumoTableProps {
  monthlyIncome: number
}

export function ResumoTable({ monthlyIncome }: ResumoTableProps) {
  const { budgetBoxes } = useBudgetBoxes()
  const { stats: boxStats } = useBudgetBoxStats(monthlyIncome)
  const { transactions } = useTransactions()

  const tableData = useMemo(() => {
    if (!budgetBoxes.length || !boxStats.length) return []

    // Calcular total gasto primeiro
    const totalSpent = boxStats.reduce((sum, stat) => sum + stat.spentAmount, 0)

    return budgetBoxes
      .sort((a, b) => a.order_index - b.order_index)
      .map(box => {
        const boxStat = boxStats.find(stat => stat.id === box.id)
        const spentAmount = boxStat?.spentAmount || 0
        
        // Percentual em relação ao total gasto
        const percentageOfTotal = totalSpent > 0 ? (spentAmount / totalSpent) * 100 : 0
        
        return {
          id: box.id,
          name: box.name,
          budgetAmount: boxStat?.budgetAmount || 0,
          spentAmount: spentAmount,
          utilizedPercentage: boxStat?.utilizationPercent || 0,
          percentageOfTotal: percentageOfTotal,
          color: box.color,
          icon: box.icon
        }
      })
  }, [budgetBoxes, boxStats, monthlyIncome])

  const totals = useMemo(() => {
    const totalSpent = tableData.reduce((sum, item) => sum + item.spentAmount, 0)
    const totalBudget = tableData.reduce((sum, item) => sum + item.budgetAmount, 0)
    const totalUtilized = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    return {
      totalSpent,
      totalBudget,
      totalUtilized
    }
  }, [tableData])

  if (!budgetBoxes.length) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-400 mb-4">Resumo</h3>
        <div className="text-gray-300 text-center py-8">
          Carregando dados...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-orange-400 mb-4">Resumo</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-2 font-medium">Budget</th>
              <th className="text-right py-3 px-2 font-medium">Valor Gasto</th>
              <th className="text-right py-3 px-2 font-medium">Devo gastar</th>
              <th className="text-right py-3 px-2 font-medium">Utilizado</th>
              <th className="text-right py-3 px-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => (
              <tr key={item.id} className="border-b border-gray-700">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-white font-medium">
                    {formatCurrency(item.spentAmount)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-white font-medium">
                    {formatCurrency(item.budgetAmount)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className={`font-medium ${
                    item.utilizedPercentage > 100 ? 'text-red-400' : 
                    item.utilizedPercentage > 80 ? 'text-yellow-400' : 
                    'text-green-400'
                  }`}>
                    {item.utilizedPercentage.toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-white font-medium">
                    {item.percentageOfTotal.toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-600">
              <td className="py-4 px-2 font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span>Totais</span>
                </div>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-white font-bold">
                  {formatCurrency(totals.totalSpent)}
                </span>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-white font-bold">
                  {formatCurrency(totals.totalBudget)}
                </span>
              </td>
              <td className="py-4 px-2 text-right">
                <span className={`font-bold ${
                  totals.totalUtilized > 100 ? 'text-red-400' : 
                  totals.totalUtilized > 80 ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  {totals.totalUtilized.toFixed(2)}%
                </span>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-white font-bold">
                  100.00%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
