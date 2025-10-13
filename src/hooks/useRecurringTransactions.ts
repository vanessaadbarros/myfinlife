import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { useBudgetBoxes } from '@/hooks/useBudgetBoxes'

type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']
type RecurringTransactionInsert = Database['public']['Tables']['recurring_transactions']['Insert']
type RecurringTransactionUpdate = Database['public']['Tables']['recurring_transactions']['Update']

export interface RecurringTransactionStats {
  totalRecurringIncome: number
  totalRecurringExpenses: number
  monthlyBalance: number
  totalRecurringCount: number
  budgetImpactPercentage: number
  overBudgetBoxes: number
}

export interface RecurringTransactionByBox {
  boxId: string
  boxName: string
  boxIcon: string
  boxColor: string
  totalAmount: number
  count: number
  budgetAmount: number
  utilizationPercent: number
  isOverBudget: boolean
}

export function useRecurringTransactions() {
  const { user, profile } = useAuth()
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Buscar transações recorrentes
  const fetchRecurringTransactions = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setRecurringTransactions(data || [])
    } catch (err) {
      setError(err as Error)
      console.error('Erro ao buscar transações recorrentes:', err)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar transação recorrente
  const addRecurringTransaction = async (transaction: Omit<RecurringTransactionInsert, 'user_id'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert([{
          ...transaction,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error

      setRecurringTransactions(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Erro ao adicionar transação recorrente:', err)
      return { data: null, error: err as Error }
    }
  }

  // Atualizar transação recorrente
  const updateRecurringTransaction = async (id: string, updates: RecurringTransactionUpdate) => {
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setRecurringTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? data : transaction
        )
      )

      return { data, error: null }
    } catch (err) {
      console.error('Erro ao atualizar transação recorrente:', err)
      return { data: null, error: err as Error }
    }
  }

  // Deletar transação recorrente
  const deleteRecurringTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      setRecurringTransactions(prev => 
        prev.filter(transaction => transaction.id !== id)
      )

      return { error: null }
    } catch (err) {
      console.error('Erro ao deletar transação recorrente:', err)
      return { error: err as Error }
    }
  }

  // Duplicar transação recorrente
  const duplicateRecurringTransaction = async (id: string) => {
    const original = recurringTransactions.find(t => t.id === id)
    if (!original) throw new Error('Transação não encontrada')

    const duplicate: Omit<RecurringTransactionInsert, 'user_id'> = {
      description: `${original.description} (Cópia)`,
      amount: original.amount,
      category_id: original.category_id,
      budget_box_id: original.budget_box_id,
      frequency: original.frequency,
      start_date: new Date().toISOString().split('T')[0],
      end_date: original.end_date,
      is_active: true,
      type: original.type,
      notes: original.notes
    }

    return addRecurringTransaction(duplicate)
  }

  // Gerar transações do mês a partir dos custos recorrentes
  const generateMonthlyTransactions = async (month: number, year: number) => {
    if (!user) return { error: new Error('Usuário não autenticado') }

    try {
      const firstDay = new Date(year, month - 1, 1)
      const lastDay = new Date(year, month, 0)
      
      // Buscar transações recorrentes ativas para o período
      const activeRecurring = recurringTransactions.filter(rt => {
        const startDate = new Date(rt.start_date)
        const endDate = rt.end_date ? new Date(rt.end_date) : null
        
        // Verifica se a transação está ativa no período
        if (startDate > lastDay) return false
        if (endDate && endDate < firstDay) return false
        
        return rt.is_active
      })

      // Para cada transação recorrente, verificar se já existe transação no mês
      for (const rt of activeRecurring) {
        // Verificar se já existe transação para este custo recorrente no mês
        const { data: existingTransactions } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', user.id)
          .gte('date', firstDay.toISOString().split('T')[0])
          .lte('date', lastDay.toISOString().split('T')[0])
          .eq('description', rt.description)
          .eq('amount', rt.amount)

        // Se não existe, criar a transação
        if (!existingTransactions || existingTransactions.length === 0) {
          // Calcular a data da transação baseado na frequência
          let transactionDate = firstDay

          // Para mensal, usar o dia da data de início
          if (rt.frequency === 'monthly') {
            const startDay = new Date(rt.start_date).getDate()
            transactionDate = new Date(year, month - 1, Math.min(startDay, lastDay.getDate()))
          }

          // Criar a transação
          await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              description: rt.description,
              amount: rt.amount,
              date: transactionDate.toISOString().split('T')[0],
              type: rt.type,
              category_id: rt.category_id,
              budget_box_id: rt.budget_box_id,
              is_recurring: true
            })
        }
      }

      return { error: null }
    } catch (err) {
      console.error('Erro ao gerar transações mensais:', err)
      return { error: err as Error }
    }
  }

  // Calcular estatísticas das transações recorrentes
  const stats = useMemo((): RecurringTransactionStats => {
    const incomes = recurringTransactions.filter(t => t.type === 'income')
    const expenses = recurringTransactions.filter(t => t.type === 'expense')

    const totalRecurringIncome = incomes.reduce((sum, t) => sum + t.amount, 0)
    const totalRecurringExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const monthlyBalance = totalRecurringIncome - totalRecurringExpenses
    const totalRecurringCount = recurringTransactions.length

    // Calcular impacto no orçamento (assumindo que o usuário tem renda mensal configurada)
    const monthlyIncome = (profile?.settings as any)?.monthly_income || 0
    const budgetImpactPercentage = monthlyIncome > 0 ? (totalRecurringExpenses / monthlyIncome) * 100 : 0
    
    // Debug logs
    console.log('🔍 Debug useRecurringTransactions stats:')
    console.log('- monthlyIncome:', monthlyIncome)
    console.log('- totalRecurringExpenses:', totalRecurringExpenses)
    console.log('- budgetImpactPercentage:', budgetImpactPercentage)
    console.log('- profile.settings:', profile?.settings)

    return {
      totalRecurringIncome,
      totalRecurringExpenses,
      monthlyBalance,
      totalRecurringCount,
      budgetImpactPercentage,
      overBudgetBoxes: 0 // Será calculado quando integrarmos com as caixas de planejamento
    }
  }, [recurringTransactions, profile])

  // Filtrar por tipo
  const getByType = (type: 'income' | 'expense') => {
    return recurringTransactions.filter(t => t.type === type)
  }

  // Buscar por caixa de planejamento
  const getByBudgetBox = (budgetBoxId: string) => {
    return recurringTransactions.filter(t => t.budget_box_id === budgetBoxId)
  }

  // Buscar próximas execuções
  const getUpcomingExecutions = (days: number = 30) => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return recurringTransactions.filter(t => {
      if (!t.next_execution) return false
      const nextExec = new Date(t.next_execution)
      return nextExec <= futureDate
    })
  }

  useEffect(() => {
    fetchRecurringTransactions()
  }, [user])

  return {
    recurringTransactions,
    loading,
    error,
    stats,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    duplicateRecurringTransaction,
    generateMonthlyTransactions,
    getByType,
    getByBudgetBox,
    getUpcomingExecutions,
    refresh: fetchRecurringTransactions
  }
}

// Hook específico para estatísticas de impacto por caixa
export function useRecurringTransactionImpact() {
  const { recurringTransactions } = useRecurringTransactions()
  const { budgetBoxes } = useBudgetBoxes()
  const { profile } = useAuth()

  const impactByBox = useMemo((): RecurringTransactionByBox[] => {
    if (!budgetBoxes.length) return []

    const monthlyIncome = (profile?.settings as any)?.monthly_income || 0
    
    // Debug logs
    console.log('🔍 Debug useRecurringTransactionImpact:')
    console.log('- recurringTransactions:', recurringTransactions.length)
    console.log('- budgetBoxes:', budgetBoxes.length)
    console.log('- profile:', profile)
    console.log('- monthlyIncome:', monthlyIncome)
    console.log('- profile.settings:', profile?.settings)

    return budgetBoxes.map(box => {
      const boxTransactions = recurringTransactions.filter(t => t.budget_box_id === box.id)
      const totalAmount = boxTransactions.reduce((sum, t) => sum + t.amount, 0)
      const budgetAmount = (monthlyIncome * box.percentage) / 100
      const utilizationPercent = budgetAmount > 0 ? (totalAmount / budgetAmount) * 100 : 0
      const isOverBudget = totalAmount > budgetAmount

      return {
        boxId: box.id,
        boxName: box.name,
        boxIcon: box.icon,
        boxColor: box.color,
        totalAmount,
        count: boxTransactions.length,
        budgetAmount,
        utilizationPercent,
        isOverBudget
      }
    }).filter(box => box.count > 0) // Apenas caixas com transações recorrentes
  }, [recurringTransactions, budgetBoxes, profile])

  const overBudgetBoxes = impactByBox.filter(box => box.isOverBudget).length

  return {
    impactByBox,
    overBudgetBoxes,
    totalRecurringExpenses: impactByBox.reduce((sum, box) => sum + box.totalAmount, 0)
  }
}
