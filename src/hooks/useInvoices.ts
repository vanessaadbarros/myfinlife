import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { useAuth } from '@/contexts/AuthContext'

type Invoice = Database['public']['Tables']['credit_card_invoices']['Row']
type InvoiceInsert = Database['public']['Tables']['credit_card_invoices']['Insert']
type InvoiceUpdate = Database['public']['Tables']['credit_card_invoices']['Update']
type Transaction = Database['public']['Tables']['transactions']['Row']

export function useInvoices(creditCardId?: string) {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (user) {
      fetchInvoices()
    } else {
      setLoading(false)
    }
  }, [user, creditCardId])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('credit_card_invoices')
        .select('*')
        .eq('user_id', user!.id)

      if (creditCardId) {
        query = query.eq('credit_card_id', creditCardId)
      }

      const { data, error } = await query.order('reference_month', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (err) {
      setError(err as Error)
      console.error('Erro ao buscar faturas:', err)
    } finally {
      setLoading(false)
    }
  }

  // Buscar fatura de um mês específico
  const getInvoiceByMonth = async (cardId: string, referenceMonth: string) => {
    try {
      const { data, error } = await supabase
        .from('credit_card_invoices')
        .select('*')
        .eq('credit_card_id', cardId)
        .eq('reference_month', referenceMonth)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return { data: data || null, error: null }
    } catch (err) {
      console.error('Erro ao buscar fatura do mês:', err)
      return { data: null, error: err as Error }
    }
  }

  // Buscar transações de uma fatura
  const getInvoiceTransactions = async (invoiceId: string): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao buscar transações da fatura:', err)
      return []
    }
  }

  // Calcular total da fatura baseado nas transações
  const calculateInvoiceTotal = async (invoiceId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('invoice_id', invoiceId)
        .eq('payment_method', 'credit')

      if (error) throw error
      return (data || []).reduce((sum, t) => sum + t.amount, 0)
    } catch (err) {
      console.error('Erro ao calcular total da fatura:', err)
      return 0
    }
  }

  // Criar ou atualizar fatura
  const upsertInvoice = async (invoice: Omit<InvoiceInsert, 'user_id'>) => {
    try {
      const { data, error } = await supabase
        .from('credit_card_invoices')
        .upsert([{ ...invoice, user_id: user!.id }], {
          onConflict: 'credit_card_id,reference_month',
        })
        .select()
        .single()

      if (error) throw error
      
      // Atualizar estado local
      setInvoices((prev) => {
        const exists = prev.find((inv) => inv.id === data.id)
        if (exists) {
          return prev.map((inv) => (inv.id === data.id ? data : inv))
        }
        return [...prev, data]
      })

      return { data, error: null }
    } catch (err) {
      console.error('Erro ao salvar fatura:', err)
      return { data: null, error: err as Error }
    }
  }

  // Pagar fatura
  const payInvoice = async (
    invoiceId: string,
    paymentAmount: number,
    paymentTransactionId: string
  ) => {
    try {
      // Buscar fatura atual
      const invoice = invoices.find((inv) => inv.id === invoiceId)
      if (!invoice) throw new Error('Fatura não encontrada')

      const newPaidAmount = invoice.paid_amount + paymentAmount
      const isPaidInFull = newPaidAmount >= invoice.total_amount

      const updates: Partial<InvoiceUpdate> = {
        paid_amount: newPaidAmount,
        status: isPaidInFull ? 'paid' : 'partial',
        payment_transaction_id: paymentTransactionId,
        paid_at: isPaidInFull ? new Date().toISOString() : null,
      }

      const { data, error } = await supabase
        .from('credit_card_invoices')
        .update(updates)
        .eq('id', invoiceId)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? data : inv)))
      return { error: null }
    } catch (err) {
      console.error('Erro ao pagar fatura:', err)
      return { error: err as Error }
    }
  }

  // Buscar faturas próximas do vencimento
  const getUpcomingInvoices = (daysAhead: number = 7) => {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + daysAhead)

    return invoices.filter((invoice) => {
      if (invoice.status === 'paid') return false
      const dueDate = new Date(invoice.due_date)
      return dueDate >= today && dueDate <= futureDate
    })
  }

  // Buscar faturas vencidas
  const getOverdueInvoices = () => {
    const today = new Date()
    return invoices.filter((invoice) => {
      if (invoice.status === 'paid') return false
      const dueDate = new Date(invoice.due_date)
      return dueDate < today
    })
  }

  // Atualizar status de faturas vencidas
  const updateOverdueInvoices = async () => {
    try {
      const { error } = await supabase.rpc('update_overdue_invoices')
      if (error) throw error
      await fetchInvoices()
    } catch (err) {
      console.error('Erro ao atualizar faturas vencidas:', err)
    }
  }

  return {
    invoices,
    loading,
    error,
    getInvoiceByMonth,
    getInvoiceTransactions,
    calculateInvoiceTotal,
    upsertInvoice,
    payInvoice,
    getUpcomingInvoices,
    getOverdueInvoices,
    updateOverdueInvoices,
    refresh: fetchInvoices,
  }
}

