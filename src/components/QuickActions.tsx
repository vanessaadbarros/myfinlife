import { useNavigate } from 'react-router-dom'
import { Plus, Wallet, TrendingUp, Target, FileText, CreditCard, Repeat } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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
      color: 'bg-myfinlife-blue',
      onClick: () => {
        onNewTransaction?.()
      }
    },
    {
      id: 'new-installment',
      title: 'Despesa Parcelada',
      description: 'Parcelar compra em vários meses',
      icon: <CreditCard size={20} />,
      color: 'bg-myfinlife-blue',
      onClick: () => {
        onNewInstallment?.()
      }
    },
    {
      id: 'recurring-costs',
      title: 'Custos Recorrentes',
      description: 'Gerenciar despesas fixas',
      icon: <Repeat size={20} />,
      color: 'bg-myfinlife-blue',
      onClick: () => {
        navigate('/recurring')
      }
    },
    {
      id: 'planning',
      title: 'Planejamento',
      description: 'Ver caixas de orçamento',
      icon: <Wallet size={20} />,
      color: 'bg-myfinlife-blue',
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
      color: 'bg-myfinlife-blue',
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
      color: 'bg-myfinlife-blue',
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
      color: 'bg-myfinlife-blue',
      onClick: () => {
        // TODO: Navegar para página de relatórios
        navigate('/reports')
      }
    }
  ]

  return (
    <Card variant="elevated">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-myfinlife-blue">Ações Rápidas</h3>
          <p className="text-sm text-myfinlife-blue/70">Acesso rápido às principais funcionalidades</p>
        </div>
        
        <div className="space-y-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              onClick={action.onClick}
              variant="ghost"
              className="w-full flex items-center gap-3 p-3 rounded-hex hover:bg-myfinlife-blue-light transition-all text-left justify-start group"
            >
              <div className={`w-10 h-10 ${action.color} rounded-hex flex items-center justify-center text-myfinlife-white group-hover:scale-105 transition-transform`}>
                {action.icon}
              </div>
              <div>
                <p className="font-medium text-myfinlife-blue group-hover:text-myfinlife-blue/80">
                  {action.title}
              </p>
                <p className="text-sm text-myfinlife-blue/70">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
