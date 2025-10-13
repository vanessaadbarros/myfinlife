import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type BankAccount = Database['public']['Tables']['bank_accounts']['Row']
type BankAccountInsert = Database['public']['Tables']['bank_accounts']['Insert']
type BankAccountUpdate = Database['public']['Tables']['bank_accounts']['Update']

export interface BankAccountStats {
  totalBalance: number
  activeAccounts: number
  totalAccounts: number
}

export function useBankAccounts() {
  const { user } = useAuth()
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Buscar contas bancárias
  const fetchBankAccounts = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setBankAccounts(data || [])
    } catch (err) {
      console.error('Erro ao buscar contas bancárias:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar nova conta bancária
  const addBankAccount = async (account: Omit<BankAccountInsert, 'user_id'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          ...account,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      setBankAccounts(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Erro ao adicionar conta bancária:', err)
      return { data: null, error: err as Error }
    }
  }

  // Atualizar conta bancária
  const updateBankAccount = async (id: string, updates: BankAccountUpdate) => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setBankAccounts(prev => 
        prev.map(account => 
          account.id === id ? data : account
        )
      )

      return { data, error: null }
    } catch (err) {
      console.error('Erro ao atualizar conta bancária:', err)
      return { data: null, error: err as Error }
    }
  }

  // Deletar conta bancária
  const deleteBankAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setBankAccounts(prev => prev.filter(account => account.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Erro ao deletar conta bancária:', err)
      return { error: err as Error }
    }
  }

  // Atualizar saldo da conta
  const updateAccountBalance = async (accountId: string, newBalance: number) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ balance: newBalance })
        .eq('id', accountId)

      if (error) throw error

      setBankAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, balance: newBalance }
            : account
        )
      )

      return { error: null }
    } catch (err) {
      console.error('Erro ao atualizar saldo da conta:', err)
      return { error: err as Error }
    }
  }

  // Recalcular saldo baseado nas transações
  const recalculateAccountBalance = async (accountId: string) => {
    if (!user) return { error: new Error('Usuário não autenticado') }

    try {
      // Buscar todas as transações desta conta
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('account_id', accountId)

      if (error) throw error

      // Calcular saldo baseado nas transações
      let balance = 0
      transactions?.forEach(transaction => {
        if (transaction.type === 'income') {
          balance += transaction.amount
        } else if (transaction.type === 'expense') {
          balance -= transaction.amount
        }
        // Investimentos não afetam o saldo da conta
      })

      // Atualizar saldo na conta
      await updateAccountBalance(accountId, balance)

      return { error: null }
    } catch (err) {
      console.error('Erro ao recalcular saldo da conta:', err)
      return { error: err as Error }
    }
  }

  // Buscar contas ativas
  const getActiveAccounts = () => {
    return bankAccounts.filter(account => account.is_active)
  }

  // Buscar conta por ID
  const getAccountById = (id: string) => {
    return bankAccounts.find(account => account.id === id)
  }

  // Calcular estatísticas
  const stats: BankAccountStats = {
    totalBalance: bankAccounts
      .filter(account => account.is_active)
      .reduce((sum, account) => sum + account.balance, 0),
    activeAccounts: bankAccounts.filter(account => account.is_active).length,
    totalAccounts: bankAccounts.length
  }

  useEffect(() => {
    fetchBankAccounts()
  }, [user])

  return {
    bankAccounts,
    loading,
    error,
    stats,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    updateAccountBalance,
    recalculateAccountBalance,
    getActiveAccounts,
    getAccountById,
    refresh: fetchBankAccounts
  }
}
