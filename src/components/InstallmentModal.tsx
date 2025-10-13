import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Loading'
import { BudgetBoxSelector } from '@/components/BudgetBoxSelector'
import { useCategories } from '@/hooks/useCategories'
import { useInstallments } from '@/hooks/useInstallments'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { useCreditCards } from '@/hooks/useCreditCards'
import { formatCurrency, formatDateToInput } from '@/utils/formatters'
import { Wallet, CreditCard, Smartphone, Receipt } from 'lucide-react'

type PaymentMethod = 'cash' | 'debit' | 'credit' | 'pix' | 'bank_slip'

interface InstallmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function InstallmentModal({ isOpen, onClose, onSuccess }: InstallmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debit')
  const { categories } = useCategories('expense')
  const { createInstallment } = useInstallments()
  const { bankAccounts } = useBankAccounts()
  const { creditCards } = useCreditCards()

  const [formData, setFormData] = useState({
    description: '',
    totalAmount: '',
    totalInstallments: '',
    startDate: formatDateToInput(new Date()),
    category_id: '',
    budget_box_id: '',
    account_id: '',
    credit_card_id: '',
  })

  const installmentAmount = formData.totalAmount && formData.totalInstallments
    ? parseFloat(formData.totalAmount) / parseInt(formData.totalInstallments)
    : 0

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setPaymentMethod('debit')
      setFormData({
        description: '',
        totalAmount: '',
        totalInstallments: '',
        startDate: formatDateToInput(new Date()),
        category_id: '',
        budget_box_id: '',
        account_id: '',
        credit_card_id: '',
      })
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (!formData.description || !formData.totalAmount || !formData.totalInstallments) {
      setError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    const totalAmount = parseFloat(formData.totalAmount)
    const totalInstallments = parseInt(formData.totalInstallments)

    if (isNaN(totalAmount) || totalAmount <= 0) {
      setError('Por favor, insira um valor total válido')
      return
    }

    if (isNaN(totalInstallments) || totalInstallments <= 0 || totalInstallments > 120) {
      setError('Número de parcelas deve ser entre 1 e 120')
      return
    }

    // Validar método de pagamento
    if (paymentMethod === 'credit' && !formData.credit_card_id) {
      setError('Selecione um cartão de crédito')
      return
    }

    if (paymentMethod === 'debit' && !formData.account_id) {
      setError('Selecione uma conta bancária')
      return
    }

    setLoading(true)

    try {
      const { error } = await createInstallment(
        formData.description,
        totalAmount,
        totalInstallments,
        formData.startDate,
        formData.category_id || undefined,
        formData.budget_box_id || undefined,
        paymentMethod,
        paymentMethod === 'credit' ? (formData.credit_card_id || undefined) : undefined,
        paymentMethod === 'debit' ? (formData.account_id || undefined) : undefined
      )

      if (error) throw error

      onSuccess?.()
      onClose()
    } catch (err) {
      setError('Erro ao criar parcelamento')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Despesa Parcelada"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💳 Despesas parceladas criam automaticamente uma transação para cada mês,
            influenciando o orçamento dos próximos meses.
          </p>
        </div>

        {/* Método de Pagamento */}
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
              <Wallet size={18} className="mx-auto mb-1" />
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
              <CreditCard size={18} className="mx-auto mb-1" />
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
              <CreditCard size={18} className="mx-auto mb-1" />
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
              <Smartphone size={18} className="mx-auto mb-1" />
              <span className="text-xs font-medium">PIX</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPaymentMethod('bank_slip')
                setFormData({ ...formData, account_id: '', credit_card_id: '' })
              }}
              className={`p-3 rounded-lg border-2 transition ${
                paymentMethod === 'bank_slip'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              disabled={loading}
            >
              <Receipt size={18} className="mx-auto mb-1" />
              <span className="text-xs font-medium">Boleto</span>
            </button>
          </div>
        </div>

        {/* Conta ou Cartão (Condicional) */}
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
                ⚠️ Cadastre um cartão em "Contas e Cartões"
              </p>
            )}
          </div>
        ) : paymentMethod === 'debit' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conta Bancária *
            </label>
            <select
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              disabled={loading}
              required
            >
              <option value="">Selecione uma conta</option>
              {bankAccounts.filter(account => account.is_active).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.icon || '🏦'} {account.bank_name} {account.account_number && `- ${account.account_number}`}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Description */}
        <Input
          label="Descrição"
          type="text"
          placeholder="Ex: Notebook Dell, Sofá, Geladeira"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={loading}
          required
        />

        {/* Amount and Installments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Valor Total"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="R$ 0,00"
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            disabled={loading}
            required
          />

          <Input
            label="Número de Parcelas"
            type="number"
            min="1"
            max="120"
            placeholder="Ex: 12"
            value={formData.totalInstallments}
            onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
            disabled={loading}
            required
          />
        </div>

        {/* Calculated Installment Amount */}
        {installmentAmount > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Valor de cada parcela:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(installmentAmount)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.totalInstallments}x de {formatCurrency(installmentAmount)} = {formatCurrency(parseFloat(formData.totalAmount))}
            </p>
          </div>
        )}

        {/* Start Date */}
        <Input
          label="Data da Primeira Parcela"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          disabled={loading}
          required
        />

        {/* Category */}
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

        {/* Budget Box */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caixa de Planejamento
          </label>
          <BudgetBoxSelector
            value={formData.budget_box_id}
            onChange={(budgetBoxId) => setFormData({ ...formData, budget_box_id: budgetBoxId || '' })}
            disabled={loading}
            placeholder="Selecione uma caixa (opcional)"
            type="expense"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 As parcelas vão consumir o orçamento desta caixa nos próximos meses
          </p>
        </div>

        {/* Future Impact Warning */}
        {formData.totalInstallments && installmentAmount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 font-medium mb-1">
              ⚠️ Impacto no Orçamento Futuro:
            </p>
            <p className="text-xs text-yellow-700">
              • Você terá um compromisso de {formatCurrency(installmentAmount)} por mês
              durante {formData.totalInstallments} meses
            </p>
            <p className="text-xs text-yellow-700">
              • Total comprometido: {formatCurrency(parseFloat(formData.totalAmount) || 0)}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
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
            {loading ? <LoadingSpinner size="sm" /> : 'Criar Parcelamento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

