import { useNavigate } from 'react-router-dom'
import { Plus, Wallet, TrendingUp, Target, FileText, CreditCard, Repeat } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  onClick: () => void
}

interface QuickActionsProps {
  onNewTransaction?: () => void
  onNewInstallment?: () => void
}

export function QuickActions({ onNewTransaction, onNewInstallment }: QuickActionsProps) {
  const navigate = useNavigate()

  const quickActions: QuickAction[] = [
    {
      id: 'new-transaction',
      title: 'Nova Transação',
      description: 'Adicionar receita ou despesa',
      icon: <Plus size={20} />,
      color: 'bg-blue-500',
      onClick: () => {
        onNewTransaction?.()
      }
    },
    {
      id: 'new-installment',
      title: 'Despesa Parcelada',
      description: 'Parcelar compra em vários meses',
      icon: <CreditCard size={20} />,
      color: 'bg-indigo-500',
      onClick: () => {
        onNewInstallment?.()
      }
    },
    {
      id: 'recurring-costs',
      title: 'Custos Recorrentes',
      description: 'Gerenciar despesas fixas',
      icon: <Repeat size={20} />,
      color: 'bg-teal-500',
      onClick: () => {
        navigate('/recurring')
      }
    },
    {
      id: 'planning',
      title: 'Planejamento',
      description: 'Ver caixas de orçamento',
      icon: <Wallet size={20} />,
      color: 'bg-blue-500',
      onClick: () => {
        // TODO: Navegar para página de planejamento ou abrir modal
        console.log('Planejamento')
      }
    },
    {
      id: 'investments',
      title: 'Investimentos',
      description: 'Gerenciar portfólio',
      icon: <TrendingUp size={20} />,
      color: 'bg-green-500',
      onClick: () => {
        // TODO: Navegar para página de investimentos
        navigate('/investments')
      }
    },
    {
      id: 'goals',
      title: 'Metas',
      description: 'Acompanhar objetivos',
      icon: <Target size={20} />,
      color: 'bg-purple-500',
      onClick: () => {
        // TODO: Navegar para página de metas
        navigate('/goals')
      }
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Ver análises detalhadas',
      icon: <FileText size={20} />,
      color: 'bg-orange-500',
      onClick: () => {
        // TODO: Navegar para página de relatórios
        navigate('/reports')
      }
    }
  ]

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
        <p className="text-sm text-gray-600">Acesso rápido às principais funcionalidades</p>
      </div>
      
      <div className="space-y-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform`}>
              {action.icon}
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-gray-700">
                {action.title}
              </p>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}
