import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useBudgetBoxes } from '@/hooks/useBudgetBoxes'
import { useTransactions } from '@/hooks/useTransactions'

export interface BudgetBoxSpending {
  id: string
  name: string
  icon: string
  color: string
  percentage: number
  budgetAmount: number // Valor calculado baseado na renda mensal
  spentAmount: number // Valor gasto no período
  remainingAmount: number // Valor restante
  spentPercentage: number // Percentual do orçamento gasto
  isOverBudget: boolean // Se excedeu o orçamento
}

export function useBudgetBoxSpending(month?: number, year?: number) {
  const { user } = useAuth()
  const { budgetBoxes, loading: boxesLoading } = useBudgetBoxes()
  const { transactions, loading: transactionsLoading } = useTransactions(month, year)
  const [spending, setSpending] = useState<BudgetBoxSpending[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user || boxesLoading || transactionsLoading) {
      setLoading(boxesLoading || transactionsLoading)
      return
    }
    fetchBudgetBoxSpending()
  }, [user, month, year, budgetBoxes, boxesLoading, transactions, transactionsLoading])

  const fetchBudgetBoxSpending = () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar renda mensal do usuário (simplificado)
      const monthlyIncome = user?.settings?.monthly_income || 0

      if (monthlyIncome === 0) {
        // Se não há renda configurada, retorna caixas sem dados de gasto
        const emptySpending = budgetBoxes.map(box => ({
          id: box.id,
          name: box.name,
          icon: box.icon,
          color: box.color,
          percentage: box.percentage,
          budgetAmount: 0,
          spentAmount: 0,
          remainingAmount: 0,
          spentPercentage: 0,
          isOverBudget: false,
        }))
        setSpending(emptySpending)
        setLoading(false)
        return
      }

      // Calcular gastos por caixa usando transações já carregadas
      const spendingByBox = new Map<string, number>()
      
      // Inicializar todas as caixas
      budgetBoxes.forEach(box => {
        spendingByBox.set(box.id, 0)
      })

      // Somar gastos por caixa
      transactions
        .filter(t => t.type === 'expense' && t.budget_box_id)
        .forEach(transaction => {
          const currentSpending = spendingByBox.get(transaction.budget_box_id!) || 0
          spendingByBox.set(transaction.budget_box_id!, currentSpending + transaction.amount)
        })

      // Calcular estatísticas finais
      const spendingData = budgetBoxes.map(box => {
        const budgetAmount = (monthlyIncome * box.percentage) / 100
        const spentAmount = spendingByBox.get(box.id) || 0
        const remainingAmount = Math.max(0, budgetAmount - spentAmount)
        const spentPercentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0
        const isOverBudget = spentAmount > budgetAmount

        return {
          id: box.id,
          name: box.name,
          icon: box.icon,
          color: box.color,
          percentage: box.percentage,
          budgetAmount,
          spentAmount,
          remainingAmount,
          spentPercentage,
          isOverBudget,
        }
      })

      setSpending(spendingData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalSpent = () => {
    return spending.reduce((total, box) => total + box.spentAmount, 0)
  }

  const getTotalBudget = () => {
    return spending.reduce((total, box) => total + box.budgetAmount, 0)
  }

  const getOverBudgetBoxes = () => {
    return spending.filter(box => box.isOverBudget)
  }

  const getBoxSpending = (boxId: string) => {
    return spending.find(box => box.id === boxId)
  }

  return {
    spending,
    loading,
    error,
    getTotalSpent,
    getTotalBudget,
    getOverBudgetBoxes,
    getBoxSpending,
    refresh: fetchBudgetBoxSpending,
  }
}
