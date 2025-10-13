import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Database } from '@/types/supabase'

type BankAccount = Database['public']['Tables']['bank_accounts']['Row']

interface BankAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    bank_name: string
    account_number: string | null
    balance: number
    is_active: boolean
  }) => Promise<void>
  editingAccount?: BankAccount | null
  loading?: boolean
}

export function BankAccountModal({
  isOpen,
  onClose,
  onSave,
  editingAccount,
  loading = false
}: BankAccountModalProps) {
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    balance: 0,
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingAccount) {
      setFormData({
        bank_name: editingAccount.bank_name,
        account_number: editingAccount.account_number || '',
        balance: editingAccount.balance,
        is_active: editingAccount.is_active
      })
    } else {
      setFormData({
        bank_name: '',
        account_number: '',
        balance: 0,
        is_active: true
      })
    }
    setErrors({})
  }, [editingAccount, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'Nome do banco é obrigatório'
    }

    if (formData.balance < 0) {
      newErrors.balance = 'Saldo não pode ser negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSave({
        bank_name: formData.bank_name.trim(),
        account_number: formData.account_number.trim() || null,
        balance: formData.balance,
        is_active: formData.is_active
      })
      onClose()
    } catch (error) {
      console.error('Erro ao salvar conta bancária:', error)
    }
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAccount ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Banco *
          </label>
          <Input
            id="bank_name"
            type="text"
            value={formData.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
            placeholder="Ex: Banco do Brasil, Itaú, Nubank..."
            className={errors.bank_name ? 'border-red-500' : ''}
          />
          {errors.bank_name && (
            <p className="text-red-500 text-sm mt-1">{errors.bank_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-1">
            Número da Conta
          </label>
          <Input
            id="account_number"
            type="text"
            value={formData.account_number}
            onChange={(e) => handleChange('account_number', e.target.value)}
            placeholder="Ex: 12345-6"
          />
        </div>

        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
            Saldo Inicial
          </label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            min="0"
            value={formData.balance}
            onChange={(e) => handleChange('balance', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className={errors.balance ? 'border-red-500' : ''}
          />
          {errors.balance && (
            <p className="text-red-500 text-sm mt-1">{errors.balance}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Conta ativa
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Salvando...' : editingAccount ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
