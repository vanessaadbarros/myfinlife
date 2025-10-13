import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Loading'
import { BudgetBoxSelector } from '@/components/BudgetBoxSelector'
import { useCategories } from '@/hooks/useCategories'
import { useTransactions } from '@/hooks/useTransactions'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { useCreditCards } from '@/hooks/useCreditCards'
import { formatDateToInput } from '@/utils/formatters'
import { Database } from '@/types/supabase'
import { Wallet, CreditCard, Smartphone, ArrowLeftRight, Receipt } from 'lucide-react'

type Transaction = Database['public']['Tables']['transactions']['Row']
type PaymentMethod = 'cash' | 'debit' | 'credit' | 'pix' | 'transfer' | 'bank_slip'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction | null
  onSuccess?: () => void
}

export function TransactionModal({ isOpen, onClose, transaction, onSuccess }: TransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense' | 'investment'>('expense')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { categories } = useCategories(type === 'investment' ? 'expense' : type)
  const { addTransaction, updateTransaction } = useTransactions()
  const { bankAccounts } = useBankAccounts()
  const { creditCards } = useCreditCards()

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    budget_box_id: '',
    account_id: '',
    credit_card_id: '',
    date: formatDateToInput(new Date()),
  })

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setPaymentMethod(transaction.payment_method || 'cash')
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        category_id: transaction.category_id || '',
        budget_box_id: transaction.budget_box_id || '',
        account_id: transaction.account_id || '',
        credit_card_id: transaction.credit_card_id || '',
        date: transaction.date,
      })
    } else {
      // Reset form for new transaction
      setType('expense')
      setPaymentMethod('cash')
      setFormData({
        amount: '',
        description: '',
        category_id: '',
        budget_box_id: '',
        account_id: '',
        credit_card_id: '',
        date: formatDateToInput(new Date()),
      })
    }
  }, [transaction, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.amount || !formData.description || !formData.category_id) {
      setError('Por favor, preencha todos os campos')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Por favor, insira um valor válido')
      return
    }

    setLoading(true)

    // Validar método de pagamento
    if (paymentMethod === 'credit' && !formData.credit_card_id) {
      setError('Selecione um cartão de crédito')
      setLoading(false)
      return
    }

    if ((paymentMethod === 'debit' || paymentMethod === 'pix') && !formData.account_id) {
      setError('Selecione uma conta bancária')
      setLoading(false)
      return
    }

    try {
      const transactionData = {
        amount,
        description: formData.description,
        category_id: formData.category_id,
        budget_box_id: formData.budget_box_id || null,
        account_id: paymentMethod === 'credit' ? null : (formData.account_id || null),
        credit_card_id: paymentMethod === 'credit' ? (formData.credit_card_id || null) : null,
        payment_method: paymentMethod,
        date: formData.date,
        type,
      }

      if (transaction) {
        // Update existing transaction
        await updateTransaction(transaction.id, transactionData)
      } else {
        // Create new transaction
        await addTransaction({
          ...transactionData,
          is_recurring: false,
        })
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError('Erro ao salvar transação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Editar Transação' : 'Nova Transação'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              type === 'income'
                ? 'bg-success-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={loading}
          >
            Receita
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              type === 'expense'
                ? 'bg-danger-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={loading}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setType('investment')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              type === 'investment'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={loading}
          >
            Investimento
          </button>
        </div>

        {/* Payment Method Selector */}
        {type !== 'income' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cash')
                  setFormData({ ...formData, account_id: '', credit_card_id: '' })
                }}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'cash'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              >
                <Wallet size={20} className="mx-auto mb-1" />
                <span className="text-xs font-medium">Dinheiro</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('debit')
                  setFormData({ ...formData, credit_card_id: '' })
                }}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'debit'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              >
                <CreditCard size={20} className="mx-auto mb-1" />
                <span className="text-xs font-medium">Débito</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('credit')
                  setFormData({ ...formData, account_id: '' })
                }}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'credit'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              >
                <CreditCard size={20} className="mx-auto mb-1" />
                <span className="text-xs font-medium">Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('pix')
                  setFormData({ ...formData, credit_card_id: '' })
                }}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'pix'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              >
                <Smartphone size={20} className="mx-auto mb-1" />
                <span className="text-xs font-medium">PIX</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('transfer')
                  setFormData({ ...formData, credit_card_id: '' })
                }}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'transfer'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              >
                <ArrowLeftRight size={20} className="mx-auto mb-1" />
                <span className="text-xs font-medium">Transfer.</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('bank_slip')
                  setFormData({ ...formData, credit_card_id: '' })
                }}
                className={`p-3 rounded-lg border-2 transition ${
                  paymentMethod === 'bank_slip'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              >
                <Receipt size={20} className="mx-auto mb-1" />
                <span className="text-xs font-medium">Boleto</span>
              </button>
            </div>
          </div>
        )}

        <Input
          label="Valor"
          type="number"
          step="0.01"
          min="0"
          placeholder="R$ 0,00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          disabled={loading}
        />

        <Input
          label="Descrição"
          type="text"
          placeholder="Ex: Almoço no shopping"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            disabled={loading}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor Condicional: Conta ou Cartão */}
        {paymentMethod === 'credit' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cartão de Crédito *
            </label>
            <select
              value={formData.credit_card_id}
              onChange={(e) => setFormData({ ...formData, credit_card_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              disabled={loading}
              required
            >
              <option value="">Selecione um cartão</option>
              {creditCards.filter(card => card.is_active).map((card) => (
                <option key={card.id} value={card.id}>
                  {card.icon} {card.card_name} {card.last_four_digits && `•••• ${card.last_four_digits}`}
                </option>
              ))}
            </select>
            {creditCards.filter(card => card.is_active).length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Você precisa cadastrar um cartão de crédito primeiro em "Contas e Cartões"
              </p>
            )}
          </div>
        ) : (paymentMethod === 'debit' || paymentMethod === 'pix' || type === 'income') ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conta Bancária {type !== 'income' && '*'}
            </label>
            <select
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              disabled={loading}
              required={type !== 'income' && (paymentMethod === 'debit' || paymentMethod === 'pix')}
            >
              <option value="">Selecione uma conta{type === 'income' ? ' (opcional)' : ''}</option>
              {bankAccounts.filter(account => account.is_active).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.icon || '🏦'} {account.bank_name} {account.account_number && `- ${account.account_number}`}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caixa de Planejamento
          </label>
          <BudgetBoxSelector
            value={formData.budget_box_id}
            onChange={(budgetBoxId) => setFormData({ ...formData, budget_box_id: budgetBoxId || '' })}
            disabled={loading}
            placeholder="Selecione uma caixa (opcional)"
            type={type}
          />
          <p className="text-xs text-gray-500 mt-1">
            Vincule esta transação a uma caixa de planejamento para acompanhar os gastos
          </p>
        </div>

        <Input
          label="Data"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          disabled={loading}
        />

        {error && (
          <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

