import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCreditCards } from '@/hooks/useCreditCards'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { Database } from '@/types/supabase'

type CreditCard = Database['public']['Tables']['credit_cards']['Row']

interface CreditCardModalProps {
  isOpen: boolean
  onClose: () => void
  card?: CreditCard | null
  onSuccess?: () => void
}

export function CreditCardModal({ isOpen, onClose, card, onSuccess }: CreditCardModalProps) {
  const [formData, setFormData] = useState({
    card_name: '',
    last_four_digits: '',
    card_network: '',
    credit_limit: '',
    closing_day: '',
    due_day: '',
    bank_account_id: '',
    color: '#8b5cf6',
    icon: '💳',
    notes: '',
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { addCreditCard, updateCreditCard } = useCreditCards()
  const { bankAccounts } = useBankAccounts()

  useEffect(() => {
    if (card) {
      setFormData({
        card_name: card.card_name,
        last_four_digits: card.last_four_digits || '',
        card_network: card.card_network || '',
        credit_limit: card.credit_limit.toString(),
        closing_day: card.closing_day.toString(),
        due_day: card.due_day.toString(),
        bank_account_id: card.bank_account_id || '',
        color: card.color,
        icon: card.icon,
        notes: card.notes || '',
        is_active: card.is_active,
      })
    } else {
      setFormData({
        card_name: '',
        last_four_digits: '',
        card_network: '',
        credit_limit: '',
        closing_day: '',
        due_day: '',
        bank_account_id: '',
        color: '#8b5cf6',
        icon: '💳',
        notes: '',
        is_active: true,
      })
    }
    setError('')
  }, [card, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const creditLimit = parseFloat(formData.credit_limit)
    const closingDay = parseInt(formData.closing_day)
    const dueDay = parseInt(formData.due_day)

    // Validações
    if (!formData.card_name.trim()) {
      setError('Nome do cartão é obrigatório')
      setLoading(false)
      return
    }

    if (isNaN(creditLimit) || creditLimit < 0) {
      setError('Limite de crédito inválido')
      setLoading(false)
      return
    }

    if (isNaN(closingDay) || closingDay < 1 || closingDay > 31) {
      setError('Dia de fechamento deve estar entre 1 e 31')
      setLoading(false)
      return
    }

    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      setError('Dia de vencimento deve estar entre 1 e 31')
      setLoading(false)
      return
    }

    try {
      const cardData = {
        card_name: formData.card_name.trim(),
        last_four_digits: formData.last_four_digits.trim() || null,
        card_network: formData.card_network.trim() || null,
        credit_limit: creditLimit,
        closing_day: closingDay,
        due_day: dueDay,
        bank_account_id: formData.bank_account_id || null,
        color: formData.color,
        icon: formData.icon,
        notes: formData.notes.trim() || null,
        is_active: formData.is_active,
      }

      if (card) {
        await updateCreditCard(card.id, cardData)
      } else {
        await addCreditCard(cardData)
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError('Erro ao salvar cartão. Tente novamente.')
      console.error('Erro ao salvar cartão:', err)
    } finally {
      setLoading(false)
    }
  }

  const cardNetworks = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'elo', label: 'Elo' },
    { value: 'amex', label: 'American Express' },
    { value: 'hipercard', label: 'Hipercard' },
    { value: 'other', label: 'Outro' },
  ]

  const cardIcons = ['💳', '💰', '🏦', '💵', '🎴', '💎']
  const cardColors = [
    '#8b5cf6', // purple
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={card ? 'Editar Cartão' : 'Novo Cartão de Crédito'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        {/* Nome do Cartão */}
        <Input
          label="Nome do Cartão *"
          name="card_name"
          value={formData.card_name}
          onChange={handleChange}
          placeholder="Ex: Nubank Platinum"
          required
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Últimos 4 dígitos */}
          <Input
            label="Últimos 4 dígitos"
            name="last_four_digits"
            value={formData.last_four_digits}
            onChange={handleChange}
            placeholder="1234"
            maxLength={4}
            disabled={loading}
          />

          {/* Bandeira */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bandeira</label>
            <select
              name="card_network"
              value={formData.card_network}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              disabled={loading}
            >
              <option value="">Selecione</option>
              {cardNetworks.map((network) => (
                <option key={network.value} value={network.value}>
                  {network.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Limite de Crédito */}
        <Input
          label="Limite de Crédito *"
          name="credit_limit"
          type="number"
          step="0.01"
          min="0"
          value={formData.credit_limit}
          onChange={handleChange}
          placeholder="R$ 0,00"
          required
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Dia de Fechamento */}
          <Input
            label="Dia de Fechamento *"
            name="closing_day"
            type="number"
            min="1"
            max="31"
            value={formData.closing_day}
            onChange={handleChange}
            placeholder="10"
            required
            disabled={loading}
          />

          {/* Dia de Vencimento */}
          <Input
            label="Dia de Vencimento *"
            name="due_day"
            type="number"
            min="1"
            max="31"
            value={formData.due_day}
            onChange={handleChange}
            placeholder="15"
            required
            disabled={loading}
          />
        </div>

        {/* Conta para Pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conta para Pagamento da Fatura
          </label>
          <select
            name="bank_account_id"
            value={formData.bank_account_id}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            disabled={loading}
          >
            <option value="">Selecione uma conta (opcional)</option>
            {bankAccounts
              .filter((account) => account.is_active)
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bank_name} {account.account_number && `- ${account.account_number}`}
                </option>
              ))}
          </select>
        </div>

        {/* Ícone e Cor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
            <div className="flex gap-2">
              {cardIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl transition ${
                    formData.icon === icon
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
            <div className="flex gap-2">
              {cardColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-lg border-2 transition ${
                    formData.color === color ? 'border-gray-700 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={loading}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            placeholder="Informações adicionais sobre o cartão"
            disabled={loading}
          />
        </div>

        {/* Cartão Ativo */}
        <div>
          <label htmlFor="is_active" className="flex items-center text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              disabled={loading}
            />
            Cartão Ativo
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : card ? 'Salvar Alterações' : 'Criar Cartão'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

