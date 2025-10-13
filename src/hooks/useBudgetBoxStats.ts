import { useMemo } from 'react'
import { useBudgetBoxes } from './useBudgetBoxes'
import { useTransactions } from './useTransactions'
import { getCurrentMonthYear } from '@/utils/formatters'

export interface BoxStats {
  id: string
  name: string
  icon: string
  color: string
  percentage: number
  budgetAmount: number
  spentAmount: number
  utilizationPercent: number
}

export function useBudgetBoxStats(monthlyIncome: number = 0) {
  const { budgetBoxes, loading: loadingBoxes } = useBudgetBoxes()
  const { month, year } = getCurrentMonthYear()
  const { transactions, loading: loadingTransactions } = useTransactions(month, year)

  const stats = useMemo((): BoxStats[] => {
    if (!budgetBoxes.length) return []

    // Calcular gastos diretamente das transações vinculadas às caixas
    // Incluir tanto despesas quanto investimentos (ambos consomem orçamento)
    const spentByBox: { [boxId: string]: number } = {}
    transactions
      .filter((t) => (t.type === 'expense' || t.type === 'investment') && t.budget_box_id)
      .forEach((t) => {
        spentByBox[t.budget_box_id!] = (spentByBox[t.budget_box_id!] || 0) + t.amount
      })

    // Calcular gastos por caixa
    return budgetBoxes.map((box) => {
      const budgetAmount = (monthlyIncome * box.percentage) / 100
      const spentAmount = spentByBox[box.id] || 0
      const utilizationPercent = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0

      return {
        id: box.id,
        name: box.name,
        icon: box.icon,
        color: box.color,
        percentage: box.percentage,
        budgetAmount,
        spentAmount,
        utilizationPercent,
      }
    })
  }, [budgetBoxes, transactions, monthlyIncome])

  const totalBudget = useMemo(() => {
    return stats.reduce((sum, box) => sum + box.budgetAmount, 0)
  }, [stats])

  const totalSpent = useMemo(() => {
    return stats.reduce((sum, box) => sum + box.spentAmount, 0)
  }, [stats])

  const totalUtilization = useMemo(() => {
    return totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  }, [totalBudget, totalSpent])

  return {
    stats,
    totalBudget,
    totalSpent,
    totalUtilization,
    loading: loadingBoxes || loadingTransactions,
  }
}

