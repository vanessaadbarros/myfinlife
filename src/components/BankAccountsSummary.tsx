import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatters'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { Building2, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BankAccountsSummaryProps {
  className?: string
}

export function BankAccountsSummary({ className = '' }: BankAccountsSummaryProps) {
  const navigate = useNavigate()
  const { bankAccounts, stats, loading } = useBankAccounts()

  if (loading) {
    return (
      <Card className={`${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-16 bg-gray-200 rounded mb-4"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  const activeAccounts = bankAccounts.filter(account => account.is_active)

  return (
    <Card className={`${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Building2 className="text-cyan-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Contas Bancárias</h3>
              <p className="text-sm text-gray-600">
                {stats.activeAccounts} conta(s) ativa(s)
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/bank-accounts')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Plus size={16} className="mr-2" />
            Gerenciar
          </Button>
        </div>

        {/* Saldo Total */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Total</p>
              <p className={`text-2xl font-bold ${
                stats.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(stats.totalBalance)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              stats.totalBalance >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {stats.totalBalance >= 0 ? (
                <TrendingUp className="text-green-600" size={20} />
              ) : (
                <TrendingDown className="text-red-600" size={20} />
              )}
            </div>
          </div>
        </div>

        {/* Lista de Contas */}
        {activeAccounts.length === 0 ? (
          <div className="text-center py-6">
            <Building2 size={48} className="mx-auto text-gray-400 mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma conta bancária
            </h4>
            <p className="text-gray-600 mb-4">
              Adicione suas contas bancárias para rastrear saldos.
            </p>
            <Button
              onClick={() => navigate('/bank-accounts')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Plus size={16} className="mr-2" />
              Adicionar Conta
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAccounts.slice(0, 3).map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-cyan-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {account.bank_name}
                    </p>
                    {account.account_number && (
                      <p className="text-sm text-gray-500">
                        {account.account_number}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              </div>
            ))}

            {activeAccounts.length > 3 && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/bank-accounts')}
                  className="text-cyan-600 border-cyan-200 hover:bg-cyan-50"
                >
                  Ver todas as {activeAccounts.length} contas
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
