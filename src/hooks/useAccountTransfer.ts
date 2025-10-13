import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/types/supabase'

type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

interface TransferParams {
  fromAccountId: string
  toAccountId: string
  amount: number
  description: string
  date: string
}

export function useAccountTransfer() {
  const { user } = useAuth()

  const transferBetweenAccounts = async ({
    fromAccountId,
    toAccountId,
    amount,
    description,
    date,
  }: TransferParams) => {
    if (!user) {
      return { error: new Error('Usuário não autenticado') }
    }

    if (fromAccountId === toAccountId) {
      return { error: new Error('Contas de origem e destino não podem ser iguais') }
    }

    if (amount <= 0) {
      return { error: new Error('Valor deve ser maior que zero') }
    }

    try {
      // Buscar saldo da conta origem
      const { data: fromAccount, error: fromAccountError } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', fromAccountId)
        .single()

      if (fromAccountError) throw fromAccountError

      if (fromAccount.balance < amount) {
        return { error: new Error('Saldo insuficiente na conta de origem') }
      }

      // Criar transação de saída (expense) na conta origem
      const outTransaction: TransactionInsert = {
        user_id: user.id,
        account_id: fromAccountId,
        amount,
        description: `Transferência: ${description}`,
        date,
        type: 'expense',
        payment_method: 'transfer',
        is_transfer: true,
        transfer_to_account_id: toAccountId,
      }

      const { data: outData, error: outError } = await supabase
        .from('transactions')
        .insert([outTransaction])
        .select()
        .single()

      if (outError) throw outError

      // Criar transação de entrada (income) na conta destino
      const inTransaction: TransactionInsert = {
        user_id: user.id,
        account_id: toAccountId,
        amount,
        description: `Transferência recebida: ${description}`,
        date,
        type: 'income',
        payment_method: 'transfer',
        is_transfer: true,
        linked_transaction_id: outData.id,
      }

      const { data: inData, error: inError } = await supabase
        .from('transactions')
        .insert([inTransaction])
        .select()
        .single()

      if (inError) throw inError

      // Vincular a transação de saída com a de entrada
      await supabase
        .from('transactions')
        .update({ linked_transaction_id: inData.id })
        .eq('id', outData.id)

      // Atualizar saldo da conta origem
      await supabase
        .from('bank_accounts')
        .update({ balance: fromAccount.balance - amount })
        .eq('id', fromAccountId)

      // Buscar saldo da conta destino e atualizar
      const { data: toAccount, error: toAccountError } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', toAccountId)
        .single()

      if (toAccountError) throw toAccountError

      await supabase
        .from('bank_accounts')
        .update({ balance: toAccount.balance + amount })
        .eq('id', toAccountId)

      return {
        data: {
          outTransaction: outData,
          inTransaction: inData,
        },
        error: null,
      }
    } catch (err) {
      console.error('Erro ao realizar transferência:', err)
      return { error: err as Error }
    }
  }

  return {
    transferBetweenAccounts,
  }
}

