import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { useAuth } from '@/contexts/AuthContext'

type InstallmentGroup = Database['public']['Tables']['installment_groups']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']

export interface InstallmentGroupWithTransactions extends InstallmentGroup {
  transactions: Transaction[]
  paidCount: number
  remainingCount: number
  paidAmount: number
  remainingAmount: number
  nextInstallmentDate: string | null
  progressPercentage: number
}

export function useInstallments() {
  const { user } = useAuth()
  const [installmentGroups, setInstallmentGroups] = useState<InstallmentGroupWithTransactions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchInstallmentGroups()
  }, [user])

  const fetchInstallmentGroups = async () => {
    try {
      setLoading(true)
      
      // Buscar todos os grupos de parcelamento
      const { data: groups, error: groupsError } = await supabase
        .from('installment_groups')
        .select('*')
        .eq('user_id', user!.id)
        .order('start_date', { ascending: false })

      if (groupsError) throw groupsError

      if (!groups || groups.length === 0) {
        setInstallmentGroups([])
        setLoading(false)
        return
      }

      // Buscar transações de cada grupo
      const groupsWithTransactions: InstallmentGroupWithTransactions[] = await Promise.all(
        groups.map(async (group) => {
          const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .eq('installment_group_id', group.id)
            .order('installment_number')

          if (transactionsError) throw transactionsError

          const today = new Date().toISOString().split('T')[0]
          
          // Calcular estatísticas
          const paidTransactions = transactions?.filter(t => t.date <= today) || []
          const remainingTransactions = transactions?.filter(t => t.date > today) || []
          
          const paidCount = paidTransactions.length
          const remainingCount = remainingTransactions.length
          const paidAmount = paidTransactions.reduce((sum, t) => sum + t.amount, 0)
          const remainingAmount = remainingTransactions.reduce((sum, t) => sum + t.amount, 0)
          
          const nextInstallmentDate = remainingTransactions.length > 0 
            ? remainingTransactions[0].date 
            : null
          
          const progressPercentage = group.total_installments > 0
            ? (paidCount / group.total_installments) * 100
            : 0

          return {
            ...group,
            transactions: transactions || [],
            paidCount,
            remainingCount,
            paidAmount,
            remainingAmount,
            nextInstallmentDate,
            progressPercentage
          }
        })
      )

      setInstallmentGroups(groupsWithTransactions)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const createInstallment = async (
    description: string,
    totalAmount: number,
    totalInstallments: number,
    startDate: string,
    categoryId?: string,
    budgetBoxId?: string,
    paymentMethod?: string,
    creditCardId?: string,
    accountId?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('create_installment_transactions', {
        p_user_id: user!.id,
        p_description: description,
        p_total_amount: totalAmount,
        p_total_installments: totalInstallments,
        p_start_date: startDate,
        p_category_id: categoryId || null,
        p_budget_box_id: budgetBoxId || null,
        p_payment_method: paymentMethod || 'cash',
        p_credit_card_id: creditCardId || null,
        p_account_id: accountId || null
      })

      if (error) throw error

      // Se foi criado no cartão de crédito, vincular parcelas às faturas
      if (paymentMethod === 'credit' && creditCardId && data) {
        await linkInstallmentsToInvoices(data, creditCardId)
      }

      await fetchInstallmentGroups()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Vincular parcelas de um parcelamento às faturas do cartão
  const linkInstallmentsToInvoices = async (groupId: string, creditCardId: string) => {
    try {
      // Buscar todas as transações do grupo
      const { data: installmentTransactions, error: transError } = await supabase
        .from('transactions')
        .select('id, date')
        .eq('installment_group_id', groupId)
        .eq('payment_method', 'credit')

      if (transError) throw transError
      if (!installmentTransactions) return

      // Para cada transação, buscar/criar a fatura do mês e vincular
      for (const transaction of installmentTransactions) {
        // Buscar cartão para pegar closing_day
        const { data: card } = await supabase
          .from('credit_cards')
          .select('closing_day, due_day')
          .eq('id', creditCardId)
          .single()

        if (!card) continue

        const transDate = new Date(transaction.date)
        const transDay = transDate.getDate()

        // Calcular mês de referência da fatura
        let referenceMonth: Date
        if (transDay <= card.closing_day) {
          referenceMonth = new Date(transDate.getFullYear(), transDate.getMonth(), 1)
        } else {
          referenceMonth = new Date(transDate.getFullYear(), transDate.getMonth() + 1, 1)
        }

        const closingDate = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth(), card.closing_day)
        let dueDate = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth(), card.due_day)

        if (dueDate < closingDate) {
          dueDate.setMonth(dueDate.getMonth() + 1)
        }

        // Buscar ou criar fatura
        const { data: invoice, error: invError } = await supabase
          .from('credit_card_invoices')
          .upsert([{
            user_id: user!.id,
            credit_card_id: creditCardId,
            reference_month: referenceMonth.toISOString().split('T')[0],
            closing_date: closingDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            total_amount: 0,
            paid_amount: 0,
            status: 'open'
          }], {
            onConflict: 'credit_card_id,reference_month'
          })
          .select('id')
          .single()

        if (invError) {
          console.error('Erro ao criar fatura:', invError)
          continue
        }

        // Vincular transação à fatura
        await supabase
          .from('transactions')
          .update({ invoice_id: invoice.id })
          .eq('id', transaction.id)

        // Atualizar total da fatura
        const { data: allInvoiceTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('invoice_id', invoice.id)

        const total = (allInvoiceTransactions || []).reduce((sum, t) => sum + t.amount, 0)

        await supabase
          .from('credit_card_invoices')
          .update({ total_amount: total })
          .eq('id', invoice.id)
      }
    } catch (err) {
      console.error('Erro ao vincular parcelas às faturas:', err)
    }
  }

  const cancelInstallment = async (groupId: string) => {
    try {
      const { error } = await supabase.rpc('cancel_installment_group', {
        p_group_id: groupId,
        p_user_id: user!.id
      })

      if (error) throw error

      await fetchInstallmentGroups()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const updateAllInstallments = async (
    groupId: string,
    categoryId?: string,
    budgetBoxId?: string
  ) => {
    try {
      const { error } = await supabase.rpc('update_all_installments', {
        p_group_id: groupId,
        p_user_id: user!.id,
        p_category_id: categoryId || null,
        p_budget_box_id: budgetBoxId || null
      })

      if (error) throw error

      await fetchInstallmentGroups()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const getActiveInstallments = () => {
    return installmentGroups.filter(group => group.status === 'active')
  }

  const getFutureCommitments = () => {
    return getActiveInstallments().reduce((total, group) => {
      return total + group.remainingAmount
    }, 0)
  }

  const getMonthlyCommitment = () => {
    const activeGroups = getActiveInstallments()
    return activeGroups.reduce((total, group) => {
      return total + group.installment_amount
    }, 0)
  }

  return {
    installmentGroups,
    loading,
    error,
    createInstallment,
    cancelInstallment,
    updateAllInstallments,
    getActiveInstallments,
    getFutureCommitments,
    getMonthlyCommitment,
    refresh: fetchInstallmentGroups
  }
}

