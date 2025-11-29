import { useState, useEffect, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, getMonthName } from '@/utils/formatters'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'
import { useCategories } from '@/hooks/useCategories'
import { Calendar, Tag, TrendingDown, CreditCard, X } from 'lucide-react'

type CreditCard = Database['public']['Tables']['credit_cards']['Row']
type Invoice = Database['public']['Tables']['credit_card_invoices']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  card: CreditCard
  invoiceId?: string | null
}

export function InvoiceModal({ isOpen, onClose, card, invoiceId }: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { categories } = useCategories()

  useEffect(() => {
    if (isOpen && (invoiceId || card.id)) {
      fetchInvoiceData()
    }
  }, [isOpen, invoiceId, card.id])

  const fetchInvoiceData = async () => {
    try {
      setLoading(true)

      if (invoiceId) {
        // Buscar fatura específica
        const { data: invoiceData, error: invError } = await supabase
          .from('credit_card_invoices')
          .select('*')
          .eq('id', invoiceId)
          .single()

        if (invError) throw invError
        await ensureInvoiceTransactions(invoiceData)
        setInvoice(invoiceData)

        // Buscar transações da fatura
        const { data: transData, error: transError } = await supabase
          .from('transactions')
          .select('*')
          .eq('invoice_id', invoiceId)
          .order('date', { ascending: false })

        if (transError) throw transError
        setTransactions(transData || [])
      } else {
        // Buscar fatura atual (mais recente em aberto)
        const { data: invoicesData, error: invError } = await supabase
          .from('credit_card_invoices')
          .select('*')
          .eq('credit_card_id', card.id)
          .in('status', ['open', 'closed'])
          .order('closing_date', { ascending: true })

        if (invError && invError.code !== 'PGRST116') throw invError

        if (invoicesData && invoicesData.length > 0) {
          const today = new Date()
          const upcoming = invoicesData.find((inv) => new Date(inv.closing_date) >= today)
          const selectedInvoice = upcoming ?? invoicesData[invoicesData.length - 1]
          await ensureInvoiceTransactions(selectedInvoice)
          setInvoice(selectedInvoice)

          // Buscar transações da fatura
          const { data: transData, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .eq('invoice_id', selectedInvoice.id)
            .order('date', { ascending: false })

          if (transError) throw transError
          setTransactions(transData || [])
        } else {
          setTransactions([])
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados da fatura:', err)
      setInvoice(null)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }
  const ensureInvoiceTransactions = async (invoiceData: Invoice) => {
    try {
      const startDate = invoiceData.reference_month
      const endDate = invoiceData.closing_date

      const { data: missingTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', invoiceData.user_id)
        .eq('payment_method', 'credit')
        .eq('credit_card_id', card.id)
        .is('invoice_id', null)
        .gte('date', startDate)
        .lte('date', endDate)

      if (missingTransactions && missingTransactions.length > 0) {
        const ids = missingTransactions.map((t) => t.id)

        await supabase
          .from('transactions')
          .update({ invoice_id: invoiceData.id })
          .in('id', ids)

        const { data: invoiceTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('invoice_id', invoiceData.id)

        const total = (invoiceTransactions || []).reduce((sum, t) => sum + t.amount, 0)

        await supabase
          .from('credit_card_invoices')
          .update({ total_amount: total })
          .eq('id', invoiceData.id)
      }
    } catch (err) {
      console.error('Erro ao garantir transações vinculadas à fatura:', err)
    }
  }

  const getCategoryName = (categoryId: string | null) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? `${category.icon} ${category.name}` : 'Sem categoria'
  }

  const stats = useMemo(() => {
    const byCategory: { [key: string]: { name: string; total: number; count: number } } = {}
    
    transactions.forEach(t => {
      const categoryId = t.category_id || 'sem-categoria'
      const categoryName = getCategoryName(t.category_id)
      
      if (!byCategory[categoryId]) {
        byCategory[categoryId] = { name: categoryName, total: 0, count: 0 }
      }
      
      byCategory[categoryId].total += t.amount
      byCategory[categoryId].count += 1
    })

    return Object.values(byCategory).sort((a, b) => b.total - a.total)
  }, [transactions, categories])

  if (!isOpen) return null

  const referenceDate = invoice?.reference_month ? new Date(invoice.reference_month) : null
  const monthName = referenceDate ? getMonthName(referenceDate.getMonth()) : ''
  const year = referenceDate?.getFullYear()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${card.color}20` }}
            >
              {card.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {card.card_name}
              </h2>
              {card.last_four_digits && (
                <p className="text-gray-500">•••• {card.last_four_digits}</p>
              )}
              {invoice && (
                <p className="text-sm text-gray-600 mt-1">
                  Fatura de {monthName} {year}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-gray-500 mt-2">Carregando fatura...</p>
          </div>
        ) : !invoice ? (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma fatura encontrada
            </h3>
            <p className="text-gray-600">
              Ainda não há compras registradas neste cartão.
            </p>
          </div>
        ) : (
          <>
            {/* Resumo da Fatura */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-purple-700 font-medium mb-1">Total da Fatura</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {formatCurrency(invoice.total_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium mb-1">Data de Fechamento</p>
                  <p className="text-xl font-semibold text-purple-900">
                    {formatDate(invoice.closing_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium mb-1">Data de Vencimento</p>
                  <p className="text-xl font-semibold text-purple-900">
                    {formatDate(invoice.due_date)}
                  </p>
                </div>
              </div>

              {/* Barra de progresso do limite */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-purple-700 mb-1">
                  <span>Uso do Limite</span>
                  <span>{((invoice.total_amount / card.credit_limit) * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-purple-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((invoice.total_amount / card.credit_limit) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-purple-700 mt-1">
                  <span>Usado: {formatCurrency(invoice.total_amount)}</span>
                  <span>Limite: {formatCurrency(card.credit_limit)}</span>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    invoice.status === 'closed' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {invoice.status === 'paid' ? '✅ Paga' :
                     invoice.status === 'overdue' ? '⚠️ Vencida' :
                     invoice.status === 'closed' ? '🔒 Fechada' :
                     '📂 Aberta'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-purple-700">
                    {transactions.length} transação(ões)
                  </p>
                </div>
              </div>
            </div>

            {/* Gastos por Categoria */}
            {stats.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Gastos por Categoria
                </h3>
                <div className="space-y-2">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Tag size={18} className="text-gray-500" />
                        <span className="font-medium text-gray-900">{stat.name}</span>
                        <span className="text-sm text-gray-500">({stat.count})</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(stat.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de Transações */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Transações da Fatura
              </h3>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma transação nesta fatura.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          {transaction.installment_number && transaction.total_installments && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              {transaction.installment_number}/{transaction.total_installments}
                            </span>
                          )}
                          {transaction.is_recurring && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                              Recorrente
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(transaction.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag size={14} />
                            {getCategoryName(transaction.category_id)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-semibold text-red-600">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer com ações */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button variant="secondary" onClick={onClose}>
                Fechar
              </Button>
              {invoice.status !== 'paid' && (
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <TrendingDown size={18} className="mr-2" />
                  Pagar Fatura
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

