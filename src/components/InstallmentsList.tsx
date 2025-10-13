import { useState } from 'react'
import { Edit, Trash2, Calendar, DollarSign, CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { BudgetBoxSelector } from '@/components/BudgetBoxSelector'
import { useInstallments, InstallmentGroupWithTransactions } from '@/hooks/useInstallments'
import { useCategories } from '@/hooks/useCategories'
import { useBudgetBoxes } from '@/hooks/useBudgetBoxes'
import { formatCurrency, formatDate } from '@/utils/formatters'

export function InstallmentsList() {
  const { installmentGroups, loading, cancelInstallment, updateAllInstallments } = useInstallments()
  const { categories } = useCategories('expense')
  const { budgetBoxes } = useBudgetBoxes()
  const [editingGroup, setEditingGroup] = useState<InstallmentGroupWithTransactions | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editForm, setEditForm] = useState({
    category_id: '',
    budget_box_id: ''
  })

  const activeGroups = installmentGroups.filter(g => g.status === 'active')

  const handleEdit = (group: InstallmentGroupWithTransactions) => {
    setEditingGroup(group)
    setEditForm({
      category_id: group.category_id || '',
      budget_box_id: group.budget_box_id || ''
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingGroup) return

    setIsSaving(true)
    try {
      const { error } = await updateAllInstallments(
        editingGroup.id,
        editForm.category_id || undefined,
        editForm.budget_box_id || undefined
      )

      if (error) throw error

      setIsEditModalOpen(false)
      setEditingGroup(null)
    } catch (err) {
      alert('Erro ao atualizar parcelamento')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = async (groupId: string, description: string) => {
    if (!confirm(`Tem certeza que deseja cancelar o parcelamento "${description}"?\n\nIsso irá remover todas as parcelas futuras.`)) {
      return
    }

    try {
      const { error } = await cancelInstallment(groupId)
      if (error) throw error
      alert('Parcelamento cancelado com sucesso!')
    } catch (err) {
      alert('Erro ao cancelar parcelamento')
      console.error(err)
    }
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Sem categoria'
    const category = categories.find(c => c.id === categoryId)
    return category ? `${category.icon} ${category.name}` : 'Sem categoria'
  }

  const getBoxName = (boxId: string | null) => {
    if (!boxId) return null
    const box = budgetBoxes.find(b => b.id === boxId)
    return box ? `${box.icon} ${box.name}` : null
  }

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    )
  }

  if (activeGroups.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">Nenhuma despesa parcelada ativa</p>
          <p className="text-gray-500 text-sm mt-1">
            Compras parceladas aparecerão aqui
          </p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Despesas Parceladas</h3>
          <p className="text-sm text-gray-600">
            {activeGroups.length} parcelamento{activeGroups.length !== 1 ? 's' : ''} ativo{activeGroups.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="space-y-4">
          {activeGroups.map((group) => {
            const boxName = getBoxName(group.budget_box_id)
            
            return (
              <div
                key={group.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {group.description}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span>{getCategoryName(group.category_id)}</span>
                      {boxName && (
                        <>
                          <span>•</span>
                          <span>{boxName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(group)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar todas as parcelas"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleCancel(group.id, group.description)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Cancelar parcelamento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Valor Total</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(group.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor da Parcela</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(group.installment_amount)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{group.paidCount}/{group.total_installments} pagas</span>
                    <span>{group.progressPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${group.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between text-sm">
                  {group.nextInstallmentDate ? (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar size={14} />
                      <span>Próxima: {formatDate(group.nextInstallmentDate)}</span>
                    </div>
                  ) : (
                    <span className="text-green-600 font-medium">✓ Totalmente pago</span>
                  )}
                  
                  {group.remainingCount > 0 && (
                    <span className="text-xs text-gray-500">
                      {group.remainingCount} parcela{group.remainingCount !== 1 ? 's' : ''} restante{group.remainingCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Amounts */}
                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Pago até agora</p>
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(group.paidAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Falta pagar</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(group.remainingAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Parcelamento"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 As alterações serão aplicadas em todas as parcelas deste parcelamento
            </p>
          </div>

          {editingGroup && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">{editingGroup.description}</p>
              <p className="text-xs text-gray-600">
                {editingGroup.total_installments}x de {formatCurrency(editingGroup.installment_amount)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={editForm.category_id}
              onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              disabled={isSaving}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caixa de Planejamento
            </label>
            <BudgetBoxSelector
              value={editForm.budget_box_id}
              onChange={(budgetBoxId) => setEditForm({ ...editForm, budget_box_id: budgetBoxId || '' })}
              disabled={isSaving}
              placeholder="Selecione uma caixa (opcional)"
              type="expense"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSaving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

