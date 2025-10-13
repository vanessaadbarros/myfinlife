import { useState, useEffect } from 'react'
import { X, Target, Calendar, DollarSign } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useGoals, GoalWithProgress } from '@/hooks/useGoals'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  goal?: GoalWithProgress | null
}

export function GoalModal({ isOpen, onClose, goal }: GoalModalProps) {
  const { addGoal, updateGoal } = useGoals()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    target_date: '',
    annual_interest_rate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    current_amount: ''
  })

  const isEditing = !!goal

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        description: goal.description ?? '',
        target_amount: goal.target_amount.toString(),
        target_date: goal.target_date.split('T')[0], // Format for date input
        annual_interest_rate: (goal.annual_interest_rate ?? 0).toString(),
        priority: (goal.priority ?? 'medium') as 'low' | 'medium' | 'high',
        current_amount: (goal.current_amount ?? 0).toString()
      })
    } else {
      setFormData({
        name: '',
        description: '',
        target_amount: '',
        target_date: '',
        annual_interest_rate: '0',
        priority: 'medium',
        current_amount: '0'
      })
    }
  }, [goal, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.target_amount || !formData.target_date) {
      return
    }

    setIsLoading(true)
    try {
      // Observação: o banco atual (segundo o SQL enviado) não possui a coluna "description" na tabela goals.
      // Para garantir que a criação funcione imediatamente, NÃO enviaremos a propriedade description no insert/update.
      // Se você adicionar a coluna (rodando fix-goals-description.sql), podemos voltar a enviar a descrição.
      const goalData = {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        target_date: new Date(formData.target_date).toISOString(),
        annual_interest_rate: parseFloat(formData.annual_interest_rate) || 0,
        priority: formData.priority,
        current_amount: parseFloat(formData.current_amount) || 0,
        status: 'active' as const,
      }

      if (isEditing) {
        const { error } = await updateGoal(goal!.id, goalData)
        if (error) throw error
      } else {
        const { error } = await addGoal(goalData)
        if (error) throw error
      }

      onClose()
    } catch (error) {
      console.error('Erro ao salvar meta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Editar Meta' : 'Nova Meta'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Atualize os dados da sua meta' : 'Crie uma nova meta financeira'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0"
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Meta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Meta *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Reserva de Emergência"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva sua meta..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Valor Alvo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-1" />
                Valor Alvo *
              </label>
              <Input
                type="number"
                value={formData.target_amount}
                onChange={(e) => handleInputChange('target_amount', e.target.value)}
                placeholder="0,00"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Data Alvo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Data Alvo *
              </label>
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => handleInputChange('target_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Valor Atual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Atual
              </label>
              <Input
                type="number"
                value={formData.current_amount}
                onChange={(e) => handleInputChange('current_amount', e.target.value)}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>

            {/* Taxa de Juros Anual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taxa de Juros Anual (%)
              </label>
              <Input
                type="number"
                value={formData.annual_interest_rate}
                onChange={(e) => handleInputChange('annual_interest_rate', e.target.value)}
                placeholder="0,00"
                min="0"
                max="100"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Rendimento esperado dos investimentos
              </p>
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
