import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { BankAccountsList } from '@/components/BankAccountsList'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CreditCardModal } from '@/components/CreditCardModal'
import { InvoiceModal } from '@/components/InvoiceModal'
import { useBankAccounts } from '@/hooks/useBankAccounts'
import { useCreditCards } from '@/hooks/useCreditCards'
import { useInvoices } from '@/hooks/useInvoices'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, TrendingDown, Building2, CreditCard as CreditCardIcon, FileText } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { Database } from '@/types/supabase'
import { supabase } from '@/lib/supabase'

type CreditCard = Database['public']['Tables']['credit_cards']['Row']

export function BankAccounts() {
  const navigate = useNavigate()
  const { bankAccounts } = useBankAccounts()
  const { creditCards, loading: cardsLoading, deleteCreditCard } = useCreditCards()
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)
  const [selectedCardForInvoice, setSelectedCardForInvoice] = useState<CreditCard | null>(null)
  const [activeTab, setActiveTab] = useState<'accounts' | 'cards'>('accounts')
  const [cardInvoices, setCardInvoices] = useState<{ [cardId: string]: number }>({})

  // Buscar faturas atuais de todos os cartões
  useEffect(() => {
    const fetchCardInvoices = async () => {
      if (creditCards.length === 0) return

      const invoiceTotals: { [cardId: string]: number } = {}

      for (const card of creditCards) {
        // Buscar fatura atual (aberta ou fechada) do cartão
        const { data: invoice } = await supabase
          .from('credit_card_invoices')
          .select('total_amount')
          .eq('credit_card_id', card.id)
          .in('status', ['open', 'closed'])
          .order('reference_month', { ascending: false })
          .limit(1)
          .single()

        invoiceTotals[card.id] = invoice?.total_amount || 0
      }

      setCardInvoices(invoiceTotals)
    }

    fetchCardInvoices()
  }, [creditCards])

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card)
    setIsCardModalOpen(true)
  }

  const handleDeleteCard = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cartão? Todas as transações vinculadas a ele permanecerão.')) {
      await deleteCreditCard(id)
    }
  }

  const handleCardModalClose = () => {
    setIsCardModalOpen(false)
    setEditingCard(null)
  }

  const handleViewInvoice = (card: CreditCard) => {
    setSelectedCardForInvoice(card)
    setIsInvoiceModalOpen(true)
  }

  const handleInvoiceModalClose = () => {
    setIsInvoiceModalOpen(false)
    setSelectedCardForInvoice(null)
  }

  const getAccountName = (accountId: string | null) => {
    if (!accountId) return 'Não definida'
    const account = bankAccounts.find((acc) => acc.id === accountId)
    return account ? `${account.bank_name}${account.account_number ? ` - ${account.account_number}` : ''}` : 'Conta não encontrada'
  }

  return (
    <Layout 
      title="Contas e Cartões" 
      showBackButton={true}
      onBack={() => navigate('/dashboard')}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'accounts'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Building2 size={18} />
              <span>Contas Bancárias</span>
              <span className={`
                ml-2 py-0.5 px-2 rounded-full text-xs font-semibold
                ${activeTab === 'accounts'
                  ? 'bg-cyan-100 text-cyan-600'
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {bankAccounts.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('cards')}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'cards'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <CreditCardIcon size={18} />
              <span>Cartões de Crédito</span>
              <span className={`
                ml-2 py-0.5 px-2 rounded-full text-xs font-semibold
                ${activeTab === 'cards'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {creditCards.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'accounts' ? (
          <BankAccountsList />
        ) : (
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Meus Cartões de Crédito</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Gerencie seus cartões e controle suas faturas
                </p>
              </div>
              <Button
                onClick={() => setIsCardModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus size={20} className="mr-2" />
                Novo Cartão
              </Button>
            </div>

            {/* Cards List */}
            {cardsLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="text-gray-500">Carregando cartões...</div>
              </div>
            ) : creditCards.length === 0 ? (
              <Card className="p-12 text-center">
                <CreditCardIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum cartão cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Cadastre seu primeiro cartão de crédito para começar a controlar suas faturas
                </p>
                <Button
                  onClick={() => setIsCardModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus size={20} className="mr-2" />
                  Adicionar Cartão
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creditCards.map((card) => (
                  <Card
                    key={card.id}
                    className="p-6 hover:shadow-lg transition-shadow"
                    style={{ borderLeft: `4px solid ${card.color}` }}
                  >
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${card.color}20` }}
                        >
                          {card.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{card.card_name}</h3>
                          {card.last_four_digits && (
                            <p className="text-sm text-gray-500">•••• {card.last_four_digits}</p>
                          )}
                        </div>
                      </div>
                      {!card.is_active && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                          Inativo
                        </span>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Limite:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(card.credit_limit)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fechamento:</span>
                        <span className="text-sm text-gray-900">Dia {card.closing_day}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Vencimento:</span>
                        <span className="text-sm text-gray-900">Dia {card.due_day}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pago por:</span>
                        <span className="text-sm text-gray-900 truncate max-w-[150px]" title={getAccountName(card.bank_account_id)}>
                          {getAccountName(card.bank_account_id)}
                        </span>
                      </div>

                      {card.card_network && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Bandeira:</span>
                          <span className="text-sm text-gray-900 capitalize">
                            {card.card_network}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Fatura Atual */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-purple-700 font-medium">Fatura Atual:</span>
                        <TrendingDown size={14} className="text-purple-600" />
                      </div>
                      <p className="text-lg font-bold text-purple-900">
                        {formatCurrency(cardInvoices[card.id] || 0)}
                      </p>
                      {cardInvoices[card.id] > 0 && (
                        <div className="mt-2 bg-purple-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all" 
                            style={{ width: `${Math.min((cardInvoices[card.id] / card.credit_limit) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                      <p className="text-xs text-purple-700 mt-1">
                        {((cardInvoices[card.id] / card.credit_limit) * 100).toFixed(1)}% do limite usado
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInvoice(card)}
                        className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100"
                      >
                        <FileText size={16} className="mr-2" />
                        Ver Fatura Detalhada
                      </Button>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCard(card)}
                          className="flex-1"
                        >
                          <Edit size={16} className="mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCard(card.id)}
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>

                    {card.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 italic">{card.notes}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Credit Card Modal */}
        <CreditCardModal
          isOpen={isCardModalOpen}
          onClose={handleCardModalClose}
          card={editingCard}
          onSuccess={handleCardModalClose}
        />

        {/* Invoice Modal */}
        {selectedCardForInvoice && (
          <InvoiceModal
            isOpen={isInvoiceModalOpen}
            onClose={handleInvoiceModalClose}
            card={selectedCardForInvoice}
          />
        )}
      </div>
    </Layout>
  )
}
