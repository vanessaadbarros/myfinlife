import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { useAuth } from '@/contexts/AuthContext'

type BudgetBox = Database['public']['Tables']['budget_boxes']['Row']
type BudgetBoxInsert = Database['public']['Tables']['budget_boxes']['Insert']

export function useBudgetBoxes() {
  const { user } = useAuth()
  const [budgetBoxes, setBudgetBoxes] = useState<BudgetBox[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchBudgetBoxes()
  }, [user])

  const fetchBudgetBoxes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('budget_boxes')
        .select('*')
        .eq('user_id', user!.id)
        .order('order_index')

      if (error) throw error
      setBudgetBoxes(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const addBudgetBox = async (budgetBox: Omit<BudgetBoxInsert, 'user_id'>) => {
    try {
      const { data, error} = await supabase
        .from('budget_boxes')
        .insert([{ ...budgetBox, user_id: user!.id }])
        .select()
        .single()

      if (error) throw error
      setBudgetBoxes((prev) => [...prev, data].sort((a, b) => a.order_index - b.order_index))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateBudgetBox = async (id: string, updates: Partial<BudgetBox>) => {
    try {
      const { data, error } = await supabase
        .from('budget_boxes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      setBudgetBoxes((prev) =>
        prev.map((b) => (b.id === id ? data : b)).sort((a, b) => a.order_index - b.order_index)
      )
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const deleteBudgetBox = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budget_boxes')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error
      setBudgetBoxes((prev) => prev.filter((b) => b.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    budgetBoxes,
    loading,
    error,
    addBudgetBox,
    updateBudgetBox,
    deleteBudgetBox,
    refresh: fetchBudgetBoxes,
  }
}

