import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useOnboardingStatus() {
  const { user } = useAuth()
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setNeedsOnboarding(null)
      return
    }

    checkOnboardingStatus()
  }, [user])

  const checkOnboardingStatus = async () => {
    try {
      setLoading(true)
      
      // Verificar se o usuário tem caixas de planejamento configuradas
      const { data: budgetBoxes, error: budgetError } = await supabase
        .from('budget_boxes')
        .select('percentage')
        .eq('user_id', user!.id)

      if (budgetError) throw budgetError

      // Verificar se as caixas têm percentuais diferentes dos padrão
      // (indicando que o usuário já configurou)
      const hasCustomPercentages = (budgetBoxes ?? []).some((box: { percentage: number }) => 
        box.percentage !== 35 && box.percentage !== 15 && 
        box.percentage !== 10 && box.percentage !== 25 && box.percentage !== 5
      )

      // Verificar se o usuário tem transações (indicando que já começou a usar)
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user!.id)
        .limit(1)

      if (transError) throw transError

      // Se não tem transações E não tem percentuais customizados, precisa de onboarding
      const needsOnboardingCheck = !transactions?.length && !hasCustomPercentages
      
      setNeedsOnboarding(needsOnboardingCheck)
    } catch (error) {
      console.error('Erro ao verificar status do onboarding:', error)
      // Em caso de erro, assumir que precisa de onboarding
      setNeedsOnboarding(true)
    } finally {
      setLoading(false)
    }
  }

  const markOnboardingComplete = async () => {
    try {
      // Marcar que o usuário completou o onboarding
      // Podemos adicionar um campo na tabela users ou criar uma tabela de onboarding_status
      // Por enquanto, vamos apenas atualizar o estado local
      setNeedsOnboarding(false)
    } catch (error) {
      console.error('Erro ao marcar onboarding como completo:', error)
    }
  }

  return {
    needsOnboarding,
    loading,
    checkOnboardingStatus,
    markOnboardingComplete
  }
}
