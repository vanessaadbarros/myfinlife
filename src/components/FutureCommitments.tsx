import { AlertCircle, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useInstallments } from '@/hooks/useInstallments'
import { formatCurrency } from '@/utils/formatters'

interface FutureCommitmentsProps {
  className?: string
}

export function FutureCommitments({ className = '' }: FutureCommitmentsProps) {
  const { 
    getActiveInstallments, 
    getFutureCommitments, 
    getMonthlyCommitment,
    loading 
  } = useInstallments()

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
      </Card>
    )
  }

  const activeInstallments = getActiveInstallments()
  const futureCommitments = getFutureCommitments()
  const monthlyCommitment = getMonthlyCommitment()

  if (activeInstallments.length === 0) {
    return null
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertCircle className="text-yellow-600" size={20} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Compromissos Futuros
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Compromisso Mensal:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(monthlyCommitment)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total a Pagar:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(futureCommitments)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
              <span>{activeInstallments.length} parcelamento{activeInstallments.length !== 1 ? 's' : ''} ativo{activeInstallments.length !== 1 ? 's' : ''}</span>
              <span>
                {activeInstallments.reduce((sum, g) => sum + g.remainingCount, 0)} parcela{activeInstallments.reduce((sum, g) => sum + g.remainingCount, 0) !== 1 ? 's' : ''} restante{activeInstallments.reduce((sum, g) => sum + g.remainingCount, 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Parcelamentos */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
        {activeInstallments.map((group) => (
          <div key={group.id} className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <p className="text-gray-900 font-medium">{group.description}</p>
              <p className="text-xs text-gray-500">
                {group.paidCount}/{group.total_installments} pagas • {formatCurrency(group.installment_amount)}/mês
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {formatCurrency(group.remainingAmount)}
              </p>
              <p className="text-xs text-gray-500">
                {group.remainingCount} restante{group.remainingCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

