import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Target, TrendingUp, Calendar, DollarSign, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Layout } from '@/components/Layout'
import { GoalCard } from '@/components/GoalCard'
import { GoalModal } from '@/components/GoalModal'
import { useGoals, GoalWithProgress } from '@/hooks/useGoals'
import { formatCurrency } from '@/utils/formatters'

export function Goals() {
  const navigate = useNavigate()
  const { goals, loading, refresh } = useGoals()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<GoalWithProgress | null>(null)

  const handleEditGoal = (goal: GoalWithProgress) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingGoal(null)
    // Força uma atualização dos dados
    refresh()
  }

  const getGoalsStats = () => {
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.progressPercentage >= 100).length
    const totalTargetAmount = goals.reduce((sum, g) => sum + g.target_amount, 0)
    const totalCurrentAmount = goals.reduce((sum, g) => sum + (g.current_amount ?? 0), 0)
    const averageProgress = totalGoals > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0
    
    // Calcular total de contribuição mensal (apenas metas não concluídas)
    const activeGoals = goals.filter(g => g.progressPercentage < 100)
    const totalMonthlyContribution = activeGoals.reduce((sum, g) => sum + g.monthlyContribution, 0)

    return {
      totalGoals,
      completedGoals,
      totalTargetAmount,
      totalCurrentAmount,
      averageProgress,
      totalMonthlyContribution,
      activeGoals: activeGoals.length
    }
  }

  const stats = getGoalsStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Metas</h1>
            <p className="text-gray-600 mt-2">Acompanhe seus objetivos financeiros</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout 
      title="Metas" 
      showBackButton={true}
      onBack={() => navigate('/dashboard')}
    >
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={20} className="mr-2" />
            Nova Meta
          </Button>
        </div>

        {/* Stats Cards */}
        {stats.totalGoals > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Metas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGoals}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progresso Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageProgress.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalCurrentAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    de {formatCurrency(stats.totalTargetAmount)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contribuição Mensal</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalMonthlyContribution)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.activeGoals} meta{stats.activeGoals !== 1 ? 's' : ''} ativa{stats.activeGoals !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Goals Grid */}
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="text-blue-600" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma meta criada
            </h2>
            <p className="text-gray-600 mb-6">
              Comece criando sua primeira meta financeira para acompanhar seus objetivos.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={20} className="mr-2" />
              Criar Primeira Meta
            </Button>
          </Card>
        )}

        {/* Goal Modal */}
        <GoalModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          goal={editingGoal}
        />
      </div>
    </Layout>
  )
}
