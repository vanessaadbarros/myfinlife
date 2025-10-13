import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { useCreditCards } from '@/hooks/useCreditCards'
import { BudgetBoxSelector } from '@/components/BudgetBoxSelector'
import { Database } from '@/types/supabase'
import { Wallet, CreditCard, Smartphone, ArrowLeftRight, Receipt } from 'lucide-react'

type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']
type PaymentMethod = 'cash' | 'debit' | 'credit' | 'pix' | 'transfer' | 'bank_slip'

interface RecurringTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  transaction?: RecurringTransaction | null
}

export function RecurringTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction = null
}: RecurringTransactionModalProps) {
  const { addRecurringTransaction, updateRecurringTransaction, loading } = useRecurringTransactions()
  const { categories } = useCategories()
  const { bankAccounts } = useBankAccounts()
  const { creditCards } = useCreditCards()
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    budget_box_id: '',
    account_id: '',
    credit_card_id: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        // Modo edição
        setPaymentMethod(transaction.payment_method || 'cash')
        setFormData({
          type: transaction.type,
          description: transaction.description,
          amount: transaction.amount.toString(),
          date: transaction.start_date,
          category_id: transaction.category_id || '',
          budget_box_id: transaction.budget_box_id || '',
          account_id: transaction.account_id || '',
          credit_card_id: transaction.credit_card_id || '',
          frequency: transaction.frequency,
          notes: transaction.notes || ''
        })
      } else {
        // Modo criação
        setPaymentMethod('cash')
        setFormData({
          type: 'expense',
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category_id: '',
          budget_box_id: '',
          account_id: '',
          credit_card_id: '',
          frequency: 'monthly',
          notes: ''
        })
      }
    }
  }, [isOpen, transaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description.trim() || !formData.amount) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)

    try {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Valor deve ser um número positivo')
      }

      const transactionData = {
        type: formData.type,
        description: formData.description.trim(),
        amount,
        category_id: formData.category_id || null,
        budget_box_id: formData.budget_box_id || null,
        account_id: paymentMethod === 'credit' ? null : (formData.account_id || null),
        credit_card_id: paymentMethod === 'credit' ? (formData.credit_card_id || null) : null,
        payment_method: paymentMethod,
        frequency: formData.frequency,
        start_date: formData.date,
        notes: formData.notes.trim() || null
      }

      if (transaction) {
        // Atualizar transação existente
        const { error } = await updateRecurringTransaction(transaction.id, transactionData)
        if (error) throw error
      } else {
        // Criar nova transação
        const { error } = await addRecurringTransaction(transactionData)
        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Erro ao salvar transação recorrente:', error)
      alert('Erro ao salvar transação recorrente. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const frequencyOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' }
  ]

  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Editar Custo Recorrente' : 'Novo Custo Recorrente'}
    >
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {transaction 
            ? 'Edite as informações da sua transação recorrente'
            : 'Adicione uma despesa ou receita que se repete periodicamente'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Transação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                formData.type === 'expense'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                formData.type === 'income'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Receita
            </button>
          </div>
        </div>

        {/* Método de Pagamento */}
        {formData.type === 'expense' && (
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
              >
                <Smartphone size={18} className="mx-auto mb-1" />
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
              >
                <ArrowLeftRight size={18} className="mx-auto mb-1" />
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
              >
                <Receipt size={18} className="mx-auto mb-1" />
                <span className="text-xs font-medium">Boleto</span>
              </button>
            </div>
          </div>
        )}

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
              required
            >
              <option value="">Selecione um cartão</option>
              {creditCards.filter(card => card.is_active).map((card) => (
                <option key={card.id} value={card.id}>
                  {card.icon} {card.card_name} {card.last_four_digits && `•••• ${card.last_four_digits}`}
                </option>
              ))}
            </select>
          </div>
        ) : (paymentMethod === 'debit' || paymentMethod === 'pix' || formData.type === 'income') ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conta Bancária {formData.type !== 'income' && '*'}
            </label>
            <select
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required={formData.type !== 'income' && (paymentMethod === 'debit' || paymentMethod === 'pix')}
            >
              <option value="">Selecione uma conta{formData.type === 'income' ? ' (opcional)' : ''}</option>
              {bankAccounts.filter(account => account.is_active).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.icon || '🏦'} {account.bank_name} {account.account_number && `- ${account.account_number}`}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição *
          </label>
          <Input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ex: Aluguel, Salário, Supermercado..."
            required
          />
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor *
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0,00"
            required
          />
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Início *
          </label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Selecione uma categoria</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Caixa de Planejamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caixa de Planejamento
          </label>
          <BudgetBoxSelector
            value={formData.budget_box_id}
            onChange={(value) => setFormData({ ...formData, budget_box_id: value || '' })}
            placeholder="Selecione uma caixa"
            type={formData.type}
          />
          <p className="text-xs text-gray-500 mt-1">
            Cada {formData.type === 'income' ? 'receita' : 'despesa'} deve ser alocada a uma caixa de planejamento
          </p>
        </div>

        {/* Frequência */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequência *
          </label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            {frequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Adicione detalhes sobre esta transação..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || loading}
            className="bg-gray-900 hover:bg-gray-800"
          >
            {isSubmitting ? 'Salvando...' : transaction ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
