import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { useAuth } from '@/contexts/AuthContext'

type Goal = Database['public']['Tables']['goals']['Row']
type GoalInsert = Database['public']['Tables']['goals']['Insert']
type GoalUpdate = Database['public']['Tables']['goals']['Update']

export interface GoalWithProgress extends Goal {
  progressPercentage: number
  monthsRemaining: number
  monthlyContribution: number
  isOnTrack: boolean
}

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<GoalWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchGoals()
  }, [user])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calcular progresso para cada meta
      const goalsWithProgress = data?.map(calculateGoalProgress) || []
      setGoals(goalsWithProgress)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const calculateGoalProgress = (goal: Goal): GoalWithProgress => {
    const now = new Date()
    const targetDate = new Date(goal.target_date)
    const currentAmount = goal.current_amount ?? 0
    const targetAmount = goal.target_amount
    const annualInterestRate = goal.annual_interest_rate ?? 0
    
    // Calcular progresso percentual
    const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
    
    // Calcular meses restantes
    const monthsRemaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    
    // Calcular contribuição mensal com juros compostos
    let monthlyContribution = 0
    if (monthsRemaining > 0) {
      const remainingAmount = targetAmount - currentAmount
      
      if (annualInterestRate > 0) {
        // Fórmula de juros compostos com aportes mensais:
        // M = C(1+i)^t + A * [((1+i)^t - 1) / i]
        // Onde:
        // M = Montante final (target_amount)
        // C = Capital inicial (current_amount)
        // i = Taxa de juros mensal (taxa anual / 12 / 100)
        // t = Tempo em meses (monthsRemaining)
        // A = Aporte mensal (monthlyContribution - o que queremos calcular)
        
        // Isolando A na fórmula:
        // A = (M - C(1+i)^t) / [((1+i)^t - 1) / i]
        
        const monthlyRate = annualInterestRate / 100 / 12
        const totalPeriods = monthsRemaining
        
        if (monthlyRate > 0) {
          const futureValueOfCurrentAmount = currentAmount * Math.pow(1 + monthlyRate, totalPeriods)
          const remainingToAchieve = targetAmount - futureValueOfCurrentAmount
          
          // Calcular aporte mensal necessário
          const annuityFactor = (Math.pow(1 + monthlyRate, totalPeriods) - 1) / monthlyRate
          monthlyContribution = remainingToAchieve / annuityFactor
        } else {
          monthlyContribution = remainingAmount / monthsRemaining
        }
      } else {
        // Sem juros - divisão simples
        monthlyContribution = remainingAmount / monthsRemaining
      }
    }
    
    // Verificar se está no prazo (tem pelo menos 3 meses restantes)
    const isOnTrack = monthsRemaining >= 3 || progressPercentage >= 100

    return {
      ...goal,
      progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
      monthsRemaining,
      monthlyContribution: Math.max(0, monthlyContribution),
      isOnTrack
    }
  }

  const addGoal = async (goal: Omit<GoalInsert, 'user_id'>) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{ ...goal, user_id: user!.id }])
        .select()
        .single()

      if (error) throw error
      
      const goalWithProgress = calculateGoalProgress(data)
      setGoals(prev => [goalWithProgress, ...prev])
      return { data: goalWithProgress, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateGoal = async (id: string, updates: GoalUpdate) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      
      const goalWithProgress = calculateGoalProgress(data)
      setGoals(prev => prev.map(goal => goal.id === id ? goalWithProgress : goal).sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime()))
      return { data: goalWithProgress, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error
      setGoals(prev => prev.filter(goal => goal.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const addContribution = async (
    goalId: string, 
    amount: number, 
    description?: string,
    budgetBoxId?: string
  ) => {
    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) throw new Error('Meta não encontrada')

      // 1. Criar transação de investimento
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user!.id,
          amount,
          description: description || `Investimento: ${goal.name}`,
          goal_id: goalId,
          budget_box_id: budgetBoxId || null,
          date: new Date().toISOString(),
          type: 'investment',
          is_recurring: false
        }])
        .select()
        .single()

      if (transactionError) throw transactionError

      // 2. Criar contribuição vinculada à transação
      const { error: contributionError } = await supabase
        .from('goal_contributions')
        .insert([{
          goal_id: goalId,
          amount,
          date: new Date().toISOString(),
          description: description || 'Contribuição para meta',
          source_type: 'transaction',
          transaction_id: transactionData.id
        }])

      if (contributionError) throw contributionError

      // 3. Atualizar valor atual da meta
      const newCurrentAmount = (goal.current_amount || 0) + amount
      await updateGoal(goalId, { current_amount: newCurrentAmount })

      return { error: null, transactionId: transactionData.id }
    } catch (err) {
      return { error: err as Error, transactionId: null }
    }
  }

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    refresh: fetchGoals,
  }
}
