import { useMemo } from 'react'
import { useBudgetBoxes } from '@/hooks/useBudgetBoxes'
import { useBudgetBoxStats } from '@/hooks/useBudgetBoxStats'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency } from '@/utils/formatters'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

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
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Resumo das Caixas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-myfinlife-blue/70 text-center py-8">
            Carregando dados...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Resumo das Caixas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-myfinlife-blue-light">
                <th className="text-left py-3 px-2 font-medium text-myfinlife-blue">Budget</th>
                <th className="text-right py-3 px-2 font-medium text-myfinlife-blue">Valor Gasto</th>
                <th className="text-right py-3 px-2 font-medium text-myfinlife-blue">Devo gastar</th>
                <th className="text-right py-3 px-2 font-medium text-myfinlife-blue">Utilizado</th>
                <th className="text-right py-3 px-2 font-medium text-myfinlife-blue">Total</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item) => (
                <tr key={item.id} className="border-b border-myfinlife-blue-light/30">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-myfinlife-blue">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-myfinlife-blue font-medium">
                      {formatCurrency(item.spentAmount)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="text-myfinlife-blue font-medium">
                      {formatCurrency(item.budgetAmount)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Badge 
                      variant={
                        item.utilizedPercentage > 100 ? 'danger' : 
                        item.utilizedPercentage > 80 ? 'warning' : 
                        'success'
                      } 
                      size="sm"
                    >
                      {item.utilizedPercentage.toFixed(2)}%
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Badge variant="info" size="sm">
                      {item.percentageOfTotal.toFixed(2)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-myfinlife-blue">
                <td className="py-4 px-2 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <span className="text-myfinlife-blue">Totais</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <span className="text-myfinlife-blue font-bold">
                    {formatCurrency(totals.totalSpent)}
                  </span>
                </td>
                <td className="py-4 px-2 text-right">
                  <span className="text-myfinlife-blue font-bold">
                    {formatCurrency(totals.totalBudget)}
                  </span>
                </td>
                <td className="py-4 px-2 text-right">
                  <Badge 
                    variant={
                      totals.totalUtilized > 100 ? 'danger' : 
                      totals.totalUtilized > 80 ? 'warning' : 
                      'success'
                    } 
                    size="md"
                  >
                    {totals.totalUtilized.toFixed(2)}%
                  </Badge>
                </td>
                <td className="py-4 px-2 text-right">
                  <Badge variant="info" size="md">
                    100.00%
                  </Badge>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
