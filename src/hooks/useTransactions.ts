import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { useAuth } from '@/contexts/AuthContext'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

export function useTransactions(month?: number, year?: number) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchTransactions()
  }, [user, month, year])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })

      // Filtrar por mês/ano se fornecido
      if (month !== undefined && year !== undefined) {
        const startDate = new Date(year, month, 1).toISOString().split('T')[0]
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
        query = query.gte('date', startDate).lte('date', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      setTransactions(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular a data da fatura baseado na data da compra e dia de fechamento do cartão
  const calculateInvoiceDates = async (creditCardId: string, purchaseDate: string) => {
    try {
      // Buscar informações do cartão
      const { data: card, error: cardError } = await supabase
        .from('credit_cards')
        .select('closing_day, due_day')
        .eq('id', creditCardId)
        .single()

      if (cardError) throw cardError

      const purchase = new Date(purchaseDate)
      const purchaseDay = purchase.getDate()
      
      // Se a compra foi ANTES do fechamento, vai para a fatura do mês atual
      // Se foi DEPOIS do fechamento, vai para a fatura do próximo mês
      let referenceMonth: Date
      if (purchaseDay <= card.closing_day) {
        // Fatura do mês atual
        referenceMonth = new Date(purchase.getFullYear(), purchase.getMonth(), 1)
      } else {
        // Fatura do próximo mês
        referenceMonth = new Date(purchase.getFullYear(), purchase.getMonth() + 1, 1)
      }

      // Calcular datas de fechamento e vencimento
      const closingDate = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth(), card.closing_day)
      const dueDate = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth(), card.due_day)

      // Se o vencimento é antes do fechamento, é no próximo mês
      if (dueDate < closingDate) {
        dueDate.setMonth(dueDate.getMonth() + 1)
      }

      return {
        referenceMonth: referenceMonth.toISOString().split('T')[0],
        closingDate: closingDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0]
      }
    } catch (err) {
      console.error('Erro ao calcular datas da fatura:', err)
      throw err
    }
  }

  // Buscar ou criar fatura para o cartão no mês
  const getOrCreateInvoice = async (creditCardId: string, purchaseDate: string): Promise<string | null> => {
    try {
      const dates = await calculateInvoiceDates(creditCardId, purchaseDate)

      // Tentar buscar fatura existente
      const { data: existingInvoice, error: fetchError } = await supabase
        .from('credit_card_invoices')
        .select('id')
        .eq('credit_card_id', creditCardId)
        .eq('reference_month', dates.referenceMonth)
        .single()

      if (existingInvoice) {
        return existingInvoice.id
      }

      // Se não existe, criar nova fatura
      const { data: newInvoice, error: createError } = await supabase
        .from('credit_card_invoices')
        .insert([{
          user_id: user!.id,
          credit_card_id: creditCardId,
          reference_month: dates.referenceMonth,
          closing_date: dates.closingDate,
          due_date: dates.dueDate,
          total_amount: 0,
          paid_amount: 0,
          status: 'open'
        }])
        .select('id')
        .single()

      if (createError) throw createError

      return newInvoice.id
    } catch (err) {
      console.error('Erro ao buscar/criar fatura:', err)
      return null
    }
  }

  // Atualizar total da fatura somando todas as transações
  const updateInvoiceTotal = async (invoiceId: string) => {
    try {
      // Buscar todas as transações desta fatura
      const { data: invoiceTransactions, error: transError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('invoice_id', invoiceId)
        .eq('payment_method', 'credit')

      if (transError) throw transError

      const total = (invoiceTransactions || []).reduce((sum, t) => sum + t.amount, 0)

      // Atualizar total na fatura
      await supabase
        .from('credit_card_invoices')
        .update({ total_amount: total })
        .eq('id', invoiceId)
    } catch (err) {
      console.error('Erro ao atualizar total da fatura:', err)
    }
  }

  const addTransaction = async (transaction: Omit<TransactionInsert, 'user_id'>) => {
    try {
      // Se for compra no crédito, calcular invoice_date e buscar/criar fatura
      let invoiceId = null
      if (transaction.payment_method === 'credit' && transaction.credit_card_id) {
        invoiceId = await getOrCreateInvoice(transaction.credit_card_id, transaction.date)
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([{ 
          ...transaction, 
          user_id: user!.id,
          invoice_id: invoiceId
        }])
        .select()
        .single()

      if (error) throw error
      
      // Atualizar saldo da conta se especificada E se NÃO for crédito
      if (data.payment_method !== 'credit' && data.account_id && (data.type === 'income' || data.type === 'expense')) {
        await updateAccountBalance(data.account_id, data.amount, data.type)
      }

      // Se for crédito, atualizar total da fatura
      if (data.payment_method === 'credit' && invoiceId) {
        await updateInvoiceTotal(invoiceId)
      }
      
      setTransactions((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      // Buscar transação atual para comparar mudanças
      const currentTransaction = transactions.find(t => t.id === id)
      
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      
      // Atualizar saldos se houve mudança na conta, valor ou tipo (E não for crédito)
      if (currentTransaction && data.payment_method !== 'credit' && data.account_id && (data.type === 'income' || data.type === 'expense')) {
        // Reverter saldo da transação anterior
        if (currentTransaction.payment_method !== 'credit' && currentTransaction.account_id && (currentTransaction.type === 'income' || currentTransaction.type === 'expense')) {
          const oldAmount = currentTransaction.type === 'income' ? -currentTransaction.amount : currentTransaction.amount
          await updateAccountBalance(currentTransaction.account_id, oldAmount, currentTransaction.type)
        }
        
        // Aplicar nova transação
        await updateAccountBalance(data.account_id, data.amount, data.type)
      }

      // Atualizar totais das faturas se necessário
      if (currentTransaction?.invoice_id && currentTransaction.invoice_id !== data.invoice_id) {
        // Atualizar fatura antiga
        await updateInvoiceTotal(currentTransaction.invoice_id)
      }
      if (data.invoice_id) {
        // Atualizar fatura nova
        await updateInvoiceTotal(data.invoice_id)
      }
      
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? data : t))
      )
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      // Buscar a transação antes de deletar para atualizar o saldo e fatura
      const transaction = transactions.find(t => t.id === id)
      let goalIdToUpdate: string | null = null
      let goalAmountToSubtract = 0

      if (transaction?.goal_id) {
        goalIdToUpdate = transaction.goal_id
        goalAmountToSubtract = transaction.amount ?? 0

        // Remover contribuições vinculadas a esta transação
        await supabase
          .from('goal_contributions')
          .delete()
          .eq('transaction_id', id)
      }
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error
      
      // Reverter o saldo da conta se a transação afetava uma conta (e não era crédito)
      if (transaction?.payment_method !== 'credit' && transaction?.account_id && (transaction.type === 'income' || transaction.type === 'expense')) {
        const amount = transaction.type === 'income' ? -transaction.amount : transaction.amount
        await updateAccountBalance(transaction.account_id, amount, transaction.type)
      }

      // Atualizar total da fatura se era compra no crédito
      if (transaction?.invoice_id && transaction.payment_method === 'credit') {
        await updateInvoiceTotal(transaction.invoice_id)
      }

      if (goalIdToUpdate) {
        const { data: goal } = await supabase
          .from('goals')
          .select('current_amount')
          .eq('id', goalIdToUpdate)
          .single()

        const currentAmount = goal?.current_amount ?? 0
        const newAmount = Math.max(currentAmount - goalAmountToSubtract, 0)

        await supabase
          .from('goals')
          .update({ current_amount: newAmount })
          .eq('id', goalIdToUpdate)
      }
      
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  // Função para atualizar saldo da conta
  const updateAccountBalance = async (accountId: string, amount: number, type: 'income' | 'expense') => {
    try {
      // Buscar saldo atual da conta
      const { data: account, error: fetchError } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', accountId)
        .single()

      if (fetchError) throw fetchError

      // Calcular novo saldo
      const currentBalance = account.balance
      const newBalance = type === 'income' 
        ? currentBalance + amount 
        : currentBalance - amount

      // Atualizar saldo na conta
      const { error: updateError } = await supabase
        .from('bank_accounts')
        .update({ balance: newBalance })
        .eq('id', accountId)

      if (updateError) throw updateError
    } catch (err) {
      console.error('Erro ao atualizar saldo da conta:', err)
    }
  }

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: fetchTransactions,
  }
}

