import { useState } from 'react'
import { Edit, Trash2, Plus, Target, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BudgetBoxSelector } from '@/components/BudgetBoxSelector'
import { useGoals, GoalWithProgress } from '@/hooks/useGoals'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface GoalCardProps {
  goal: GoalWithProgress
  onEdit: (goal: GoalWithProgress) => void
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { addContribution, deleteGoal } = useGoals()
  const [isAddingContribution, setIsAddingContribution] = useState(false)
  const [contributionAmount, setContributionAmount] = useState('')
  const [contributionDescription, setContributionDescription] = useState('')
  const [selectedBoxId, setSelectedBoxId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = () => {
    if (goal.progressPercentage >= 100) return 'bg-green-500'
    if (goal.isOnTrack) return 'bg-blue-500'
    if (goal.monthsRemaining <= 3) return 'bg-red-500'
    return 'bg-yellow-500'
  }

  const getStatusText = () => {
    if (goal.progressPercentage >= 100) return 'Concluída'
    if (goal.isOnTrack) return 'No prazo'
    if (goal.monthsRemaining <= 3) return 'Atrasada'
    return 'Em andamento'
  }

  const handleAddContribution = async () => {
    const amount = parseFloat(contributionAmount)
    if (!amount || amount <= 0) return

    setIsLoading(true)
    try {
      const { error, transactionId } = await addContribution(
        goal.id, 
        amount, 
        contributionDescription || undefined,
        selectedBoxId || undefined
      )
      if (error) throw error
      
      // Mostrar mensagem de sucesso
      if (transactionId) {
        alert('✅ Contribuição registrada!\n💰 Transação de investimento criada automaticamente.')
      }
      
      setContributionAmount('')
      setContributionDescription('')
      setSelectedBoxId('')
      setIsAddingContribution(false)
    } catch (error) {
      console.error('Erro ao adicionar contribuição:', error)
      alert('Erro ao adicionar contribuição. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return
    
    setIsLoading(true)
    try {
      const { error } = await deleteGoal(goal.id)
      if (error) throw error
    } catch (error) {
      console.error('Erro ao excluir meta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(goal)}
            disabled={isLoading}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso</span>
          <span className="text-sm font-bold text-gray-900">
            {goal.progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getStatusColor()}`}
            style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{formatCurrency(goal.current_amount ?? 0)}</span>
          <span>{formatCurrency(goal.target_amount)}</span>
        </div>
      </div>

      {/* Goal Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-500" size={16} />
          <div>
            <p className="text-xs text-gray-600">Prazo</p>
            <p className="text-sm font-medium">{formatDate(goal.target_date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="text-gray-500" size={16} />
          <div>
            <p className="text-xs text-gray-600">Mensal</p>
            <p className="text-sm font-medium">{formatCurrency(goal.monthlyContribution)}</p>
          </div>
        </div>
      </div>

      {/* Taxa de Juros */}
      {goal.annual_interest_rate > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={16} />
              <div>
                <p className="text-xs text-blue-700">Taxa de Juros</p>
                <p className="text-sm font-semibold text-blue-800">
                  {goal.annual_interest_rate}% a.a.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-700">Rendimento Mensal</p>
              <p className="text-sm font-medium text-blue-800">
                {(goal.annual_interest_rate / 12).toFixed(2)}%
              </p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            💡 Com juros compostos, você precisa contribuir menos por mês!
          </p>
        </div>
      )}

      {/* Add Contribution */}
      {goal.progressPercentage < 100 && (
        <div className="border-t pt-4">
          {!isAddingContribution ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingContribution(true)}
              className="w-full"
            >
              <Plus size={16} className="mr-2" />
              Adicionar Contribuição
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="Valor (R$)"
                  step="0.01"
                  min="0.01"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  size="sm"
                  onClick={handleAddContribution}
                  disabled={isLoading || !contributionAmount}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Adicionando...' : 'Adicionar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingContribution(false)
                    setContributionAmount('')
                    setContributionDescription('')
                    setSelectedBoxId('')
                  }}
                >
                  Cancelar
                </Button>
              </div>
              <input
                type="text"
                value={contributionDescription}
                onChange={(e) => setContributionDescription(e.target.value)}
                placeholder="Descrição (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <BudgetBoxSelector
                  value={selectedBoxId}
                  onChange={(boxId) => setSelectedBoxId(boxId || '')}
                  placeholder="Selecione a caixa que vai consumir (opcional)"
                  type="expense"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Este investimento vai consumir o orçamento desta caixa
                </p>
              </div>
              {contributionAmount && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <p>💰 Valor: {formatCurrency(parseFloat(contributionAmount))}</p>
                  <p>📈 Novo total: {formatCurrency((goal.current_amount || 0) + parseFloat(contributionAmount))}</p>
                  <p>🎯 Progresso: {(((goal.current_amount || 0) + parseFloat(contributionAmount)) / goal.target_amount * 100).toFixed(1)}%</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
