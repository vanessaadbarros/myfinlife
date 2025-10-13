import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BankAccountModal } from '@/components/BankAccountModal'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { formatCurrency } from '@/utils/formatters'
import { Database } from '@/types/supabase'
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react'

type BankAccount = Database['public']['Tables']['bank_accounts']['Row']

export function BankAccountsList() {
  const { bankAccounts, loading, addBankAccount, updateBankAccount, deleteBankAccount, recalculateBalance } = useBankAccounts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setIsModalOpen(true)
  }

  const handleDelete = async (account: BankAccount) => {
    if (window.confirm(`Tem certeza que deseja excluir a conta "${account.bank_name}"?`)) {
      setActionLoading(account.id)
      try {
        await deleteBankAccount(account.id)
      } catch (error) {
        console.error('Erro ao excluir conta:', error)
      } finally {
        setActionLoading(null)
      }
    }
  }

  const handleRecalculate = async (account: BankAccount) => {
    setActionLoading(`recalc-${account.id}`)
    try {
      await recalculateBalance(account.id)
      alert('Saldo recalculado com sucesso!')
    } catch (error) {
      console.error('Erro ao recalcular saldo:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSave = async (data: {
    bank_name: string
    account_number: string | null
    balance: number
    is_active: boolean
  }) => {
    setActionLoading('save')
    try {
      if (editingAccount) {
        await updateBankAccount(editingAccount.id, data)
      } else {
        await addBankAccount(data)
      }
      setIsModalOpen(false)
      setEditingAccount(null)
    } catch (error) {
      console.error('Erro ao salvar conta:', error)
      alert('Erro ao salvar conta bancária')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAccount(null)
  }

  const totalBalance = bankAccounts
    .filter(account => account.is_active)
    .reduce((sum, account) => sum + account.balance, 0)

  const activeAccounts = bankAccounts.filter(account => account.is_active)

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Contas Bancárias</h2>
              <p className="text-sm text-gray-600">
                {activeAccounts.length} conta(s) ativa(s) • Saldo total: {formatCurrency(totalBalance)}
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus size={20} className="mr-2" />
              Nova Conta
            </Button>
          </div>

          {bankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma conta bancária cadastrada
              </h3>
              <p className="text-gray-600 mb-4">
                Adicione suas contas bancárias para rastrear saldos e transações.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={20} className="mr-2" />
                Adicionar Primeira Conta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    account.is_active 
                      ? 'bg-white border-gray-200 hover:border-gray-300' 
                      : 'bg-gray-50 border-gray-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          account.is_active ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {account.bank_name}
                          </h3>
                          {account.account_number && (
                            <p className="text-sm text-gray-600">
                              Conta: {account.account_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(account.balance)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {account.is_active ? 'Ativa' : 'Inativa'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRecalculate(account)}
                          disabled={actionLoading === `recalc-${account.id}`}
                          title="Recalcular saldo baseado nas transações"
                        >
                          <RefreshCw 
                            size={16} 
                            className={actionLoading === `recalc-${account.id}` ? 'animate-spin' : ''} 
                          />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(account)}
                          disabled={actionLoading === account.id}
                        >
                          <Edit size={16} />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(account)}
                          disabled={actionLoading === account.id}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <BankAccountModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingAccount={editingAccount}
        loading={actionLoading === 'save'}
      />
    </>
  )
}
