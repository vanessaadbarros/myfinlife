import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { useAuth } from '@/contexts/AuthContext'

type CreditCard = Database['public']['Tables']['credit_cards']['Row']
type CreditCardInsert = Database['public']['Tables']['credit_cards']['Insert']
type CreditCardUpdate = Database['public']['Tables']['credit_cards']['Update']

export function useCreditCards() {
  const { user } = useAuth()
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (user) {
      fetchCreditCards()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchCreditCards = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user!.id)
        .order('card_name', { ascending: true })

      if (error) throw error
      setCreditCards(data || [])
    } catch (err) {
      setError(err as Error)
      console.error('Erro ao buscar cartões:', err)
    } finally {
      setLoading(false)
    }
  }

  const addCreditCard = async (card: Omit<CreditCardInsert, 'user_id'>) => {
    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .insert([{ ...card, user_id: user!.id }])
        .select()
        .single()

      if (error) throw error
      setCreditCards((prev) => [...prev, data])
      return { data, error: null }
    } catch (err) {
      console.error('Erro ao adicionar cartão:', err)
      return { data: null, error: err as Error }
    }
  }

  const updateCreditCard = async (id: string, updates: Partial<CreditCardUpdate>) => {
    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      setCreditCards((prev) => prev.map((card) => (card.id === id ? data : card)))
      return { error: null }
    } catch (err) {
      console.error('Erro ao atualizar cartão:', err)
      return { error: err as Error }
    }
  }

  const deleteCreditCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error
      setCreditCards((prev) => prev.filter((card) => card.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Erro ao excluir cartão:', err)
      return { error: err as Error }
    }
  }

  // Buscar resumo do cartão com limite disponível
  const getCardSummary = async (cardId: string) => {
    try {
      // Buscar fatura atual (aberta ou fechada)
      const { data: currentInvoice } = await supabase
        .from('credit_card_invoices')
        .select('total_amount, due_date, status')
        .eq('credit_card_id', cardId)
        .in('status', ['open', 'closed'])
        .order('reference_month', { ascending: false })
        .limit(1)
        .single()

      // Buscar o cartão
      const card = creditCards.find((c) => c.id === cardId)
      if (!card) return null

      const currentInvoiceAmount = currentInvoice?.total_amount || 0
      const availableLimit = card.credit_limit - currentInvoiceAmount

      return {
        card,
        currentInvoice: currentInvoice || null,
        availableLimit,
        usedPercentage: (currentInvoiceAmount / card.credit_limit) * 100,
      }
    } catch (err) {
      console.error('Erro ao buscar resumo do cartão:', err)
      return null
    }
  }

  return {
    creditCards,
    loading,
    error,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    getCardSummary,
    refresh: fetchCreditCards,
  }
}

