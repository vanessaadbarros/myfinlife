import { useMemo } from 'react'
import { PiggyBank, Target, Clock, ListChecks } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/Loading'
import { useTransactions } from '@/hooks/useTransactions'
import { useGoals } from '@/hooks/useGoals'
import { formatCurrency, formatDate } from '@/utils/formatters'

const paymentMethodLabels: Record<'cash' | 'debit' | 'credit' | 'pix' | 'transfer' | 'bank_slip', string> = {
  cash: 'Dinheiro',
  debit: 'Cartão de débito',
  credit: 'Cartão de crédito',
  pix: 'PIX',
  transfer: 'Transferência',
  bank_slip: 'Boleto',
}

const typeLabels: Record<'income' | 'expense' | 'investment', string> = {
  income: 'Receita',
  expense: 'Despesa',
  investment: 'Investimento',
}

const typeVariants: Record<'income' | 'expense' | 'investment', 'success' | 'danger' | 'info'> = {
  income: 'success',
  expense: 'danger',
  investment: 'info',
}

export function Investments() {
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions()
  const { goals, loading: goalsLoading, error: goalsError } = useGoals()

  const goalMap = useMemo(() => {
    const map = new Map<string, string>()
    goals.forEach(goal => {
      map.set(goal.id, goal.name)
    })
    return map
  }, [goals])

  const goalTransactions = useMemo(
    () => transactions.filter(transaction => Boolean(transaction.goal_id)),
    [transactions]
  )

  const totalInvested = useMemo(
    () => goalTransactions.reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0),
    [goalTransactions]
  )

  const investedGoalsCount = useMemo(() => {
    const ids = goalTransactions
      .map(transaction => transaction.goal_id)
      .filter((goalId): goalId is string => Boolean(goalId))
    return new Set(ids).size
  }, [goalTransactions])

  const totalContributions = goalTransactions.length

  const lastContributionDate = useMemo(() => {
    if (!goalTransactions.length) return null
    return goalTransactions.reduce((latest, transaction) => {
      return new Date(transaction.date) > new Date(latest) ? transaction.date : latest
    }, goalTransactions[0].date)
  }, [goalTransactions])

  const groupedByGoal = useMemo(() => {
    const groups = new Map<
      string,
      { goalName: string; total: number; count: number; lastDate: string }
    >()

    goalTransactions.forEach(transaction => {
      if (!transaction.goal_id) return

      const existing = groups.get(transaction.goal_id)
      const goalName = goalMap.get(transaction.goal_id) ?? 'Meta removida'

      if (!existing) {
        groups.set(transaction.goal_id, {
          goalName,
          total: transaction.amount ?? 0,
          count: 1,
          lastDate: transaction.date,
        })
      } else {
        const isLatest = new Date(transaction.date) > new Date(existing.lastDate)
        groups.set(transaction.goal_id, {
          goalName,
          total: existing.total + (transaction.amount ?? 0),
          count: existing.count + 1,
          lastDate: isLatest ? transaction.date : existing.lastDate,
        })
      }
    })

    return Array.from(groups.entries())
      .map(([goalId, data]) => ({
        goalId,
        ...data,
      }))
      .sort((a, b) => b.total - a.total)
  }, [goalMap, goalTransactions])

  const isLoading = transactionsLoading || goalsLoading
  const hasError = transactionsError || goalsError

  return (
    <Layout title="Investimentos">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card variant="elevated" padding="lg" className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-montserrat text-myfinlife-blue/70">
                  Total investido em metas
                </p>
                <p className="mt-2 text-3xl font-semibold text-myfinlife-blue">
                  {formatCurrency(totalInvested)}
                </p>
                <p className="mt-1 text-sm text-myfinlife-blue/60">
                  {totalContributions > 0
                    ? `${totalContributions} ${totalContributions === 1 ? 'aplicação registrada' : 'aplicações registradas'}`
                    : 'Nenhum investimento registrado'}
                </p>
              </div>
              <div className="rounded-hex bg-myfinlife-blue p-3 shadow-myfinlife">
                <PiggyBank className="h-6 w-6 text-myfinlife-white" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg" className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-montserrat text-myfinlife-blue/70">
                  Metas com investimentos
                </p>
                <p className="mt-2 text-3xl font-semibold text-myfinlife-blue">
                  {investedGoalsCount}
                </p>
                <p className="mt-1 text-sm text-myfinlife-blue/60">
                  {investedGoalsCount === 0
                    ? 'Aguardando primeiro aporte'
                    : `${investedGoalsCount === 1 ? 'Meta' : 'Metas'} recebendo aportes`}
                </p>
              </div>
              <div className="rounded-hex bg-myfinlife-blue p-3 shadow-myfinlife">
                <Target className="h-6 w-6 text-myfinlife-white" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg" className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-montserrat text-myfinlife-blue/70">
                  Última contribuição
                </p>
                <p className="mt-2 text-3xl font-semibold text-myfinlife-blue">
                  {lastContributionDate ? formatDate(lastContributionDate) : '—'}
                </p>
                <p className="mt-1 text-sm text-myfinlife-blue/60">
                  {lastContributionDate
                    ? 'Mantenha a constância dos aportes'
                    : 'Nenhum aporte realizado até agora'}
                </p>
              </div>
              <div className="rounded-hex bg-myfinlife-blue p-3 shadow-myfinlife">
                <Clock className="h-6 w-6 text-myfinlife-white" />
              </div>
            </div>
          </Card>
        </div>

        <Card variant="elevated" padding="lg">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Transações vinculadas às metas</CardTitle>
              <p className="text-sm font-montserrat text-myfinlife-blue/60">
                Monitoramento em tempo real das aplicações feitas para suas metas financeiras
              </p>
            </div>
            <Badge variant="info" size="sm">
              {totalContributions} {totalContributions === 1 ? 'registro' : 'registros'}
            </Badge>
          </CardHeader>
          <CardContent>
            {hasError && (
              <div className="rounded-hex bg-danger-500/10 p-4 text-danger-500">
                Ocorreu um erro ao carregar as transações vinculadas às metas. Tente novamente.
              </div>
            )}

            {!hasError && (
              <>
                {isLoading ? (
                  <div className="py-10">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : goalTransactions.length === 0 ? (
                  <div className="rounded-hex bg-myfinlife-blue-light/10 p-8 text-center">
                    <ListChecks className="mx-auto mb-3 h-10 w-10 text-myfinlife-blue/70" />
                    <p className="text-lg font-semibold text-myfinlife-blue">
                      Nenhuma transação vinculada a metas ainda
                    </p>
                    <p className="mt-1 text-sm text-myfinlife-blue/60">
                      Registre um investimento vinculando uma transação a uma meta para visualizar os
                      aportes aqui.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-hex border border-myfinlife-blue-light">
                    <table className="min-w-full divide-y divide-myfinlife-blue-light/60 text-left">
                      <thead className="bg-myfinlife-blue-light/20 text-xs font-semibold uppercase text-myfinlife-blue/80">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Meta &amp; descrição</th>
                          <th className="px-4 py-3 font-semibold">Data</th>
                          <th className="px-4 py-3 font-semibold">Método</th>
                          <th className="px-4 py-3 text-right font-semibold">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-myfinlife-blue-light/40">
                        {goalTransactions.map(transaction => {
                          const goalName = transaction.goal_id
                            ? goalMap.get(transaction.goal_id) ?? 'Meta removida'
                            : 'Meta removida'
                          return (
                            <tr
                              key={transaction.id}
                              className="transition-colors hover:bg-myfinlife-blue-light/10"
                            >
                              <td className="px-4 py-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-myfinlife-blue">
                                      {goalName}
                                    </span>
                                    <Badge
                                      variant={typeVariants[transaction.type]}
                                      size="sm"
                                      className="uppercase"
                                    >
                                      {typeLabels[transaction.type]}
                                    </Badge>
                                  </div>
                                  <span className="text-sm text-myfinlife-blue/70">
                                    {transaction.description}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-myfinlife-blue/70">
                                {formatDate(transaction.date)}
                              </td>
                              <td className="px-4 py-4 text-sm text-myfinlife-blue/70">
                                {transaction.payment_method
                                  ? paymentMethodLabels[
                                      transaction.payment_method as keyof typeof paymentMethodLabels
                                    ]
                                  : '—'}
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className="text-lg font-semibold text-myfinlife-blue">
                                  {formatCurrency(transaction.amount ?? 0)}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {groupedByGoal.length > 0 && (
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Resumo por meta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {groupedByGoal.map(group => (
                  <div
                    key={group.goalId}
                    className="rounded-hex border border-myfinlife-blue-light bg-myfinlife-blue-light/10 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-myfinlife-blue">
                          {group.goalName}
                        </p>
                        <p className="mt-1 text-sm text-myfinlife-blue/60">
                          {group.count}{' '}
                          {group.count === 1 ? 'aporte registrado' : 'aportes registrados'}
                        </p>
                      </div>
                      <Badge variant="info" size="md">
                        {formatCurrency(group.total)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-wide text-myfinlife-blue/60">
                      Último aporte: {formatDate(group.lastDate)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
