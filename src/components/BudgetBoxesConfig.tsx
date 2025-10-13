import { useState } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { useBudgetBoxes } from '@/hooks/useBudgetBoxes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Database } from '@/types/supabase'

type BudgetBox = Database['public']['Tables']['budget_boxes']['Row']

export function BudgetBoxesConfig() {
  const { budgetBoxes, loading, addBudgetBox, updateBudgetBox, deleteBudgetBox } = useBudgetBoxes()
  const [editingBox, setEditingBox] = useState<BudgetBox | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    percentage: '',
    color: '#6366f1',
    icon: '📦',
  })

  const handleStartEdit = (box: BudgetBox) => {
    setEditingBox(box)
    setFormData({
      name: box.name,
      percentage: box.percentage.toString(),
      color: box.color || '#6366f1',
      icon: box.icon || '📦',
    })
    setIsAdding(false)
  }

  const handleStartAdd = () => {
    setIsAdding(true)
    setEditingBox(null)
    setFormData({
      name: '',
      percentage: '',
      color: '#6366f1',
      icon: '📦',
    })
    setError('')
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingBox(null)
    setFormData({
      name: '',
      percentage: '',
      color: '#6366f1',
      icon: '📦',
    })
    setError('')
  }

  const handleSave = async () => {
    setError('')

    if (!formData.name || !formData.percentage) {
      setError('Nome e percentual são obrigatórios')
      return
    }

    const percentage = parseFloat(formData.percentage)
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError('Percentual deve ser entre 0 e 100')
      return
    }

    setIsSaving(true)

    try {
      if (editingBox) {
        // Update existing box
        const { error } = await updateBudgetBox(editingBox.id, {
          name: formData.name,
          percentage,
          color: formData.color,
          icon: formData.icon,
        })

        if (error) throw error
      } else {
        // Add new box
        const orderIndex = budgetBoxes.length
        const { error } = await addBudgetBox({
          name: formData.name,
          percentage,
          color: formData.color,
          icon: formData.icon,
          order_index: orderIndex,
        })

        if (error) throw error
      }

      handleCancel()
    } catch (err) {
      setError('Erro ao salvar caixa')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta caixa de planejamento?')) {
      const { error } = await deleteBudgetBox(id)
      if (error) {
        alert('Erro ao excluir caixa')
      }
    }
  }

  const totalPercentage = budgetBoxes.reduce((sum, box) => sum + box.percentage, 0)

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Caixas de Planejamento
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure as caixas para organizar seus gastos mensais
          </p>
        </div>
        {!isAdding && !editingBox && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleStartAdd}
          >
            <Plus size={18} className="mr-2" />
            Nova Caixa
          </Button>
        )}
      </div>

      {/* Total Percentage Warning */}
      {totalPercentage !== 100 && budgetBoxes.length > 0 && (
        <div className={`mb-4 p-3 rounded-lg border ${
          totalPercentage > 100 
            ? 'bg-red-50 border-red-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <p className={`text-sm ${
            totalPercentage > 100 ? 'text-red-800' : 'text-yellow-800'
          }`}>
            ⚠️ Total de percentuais: {totalPercentage.toFixed(2)}%
            {totalPercentage > 100 
              ? ' (Excede 100%!)' 
              : ` (Faltam ${(100 - totalPercentage).toFixed(2)}%)`
            }
          </p>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingBox) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">
            {editingBox ? 'Editar Caixa' : 'Nova Caixa'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Nome"
                type="text"
                placeholder="Ex: Custos Fixos"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSaving}
              />
            </div>

            <div>
              <Input
                label="Percentual (%)"
                type="number"
                placeholder="Ex: 50"
                min="0"
                max="100"
                step="0.01"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                disabled={isSaving}
              />
            </div>

            <div>
              <Input
                label="Emoji/Ícone"
                type="text"
                placeholder="📦"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                disabled={isSaving}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X size={16} className="mr-2" />
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Budget Boxes List */}
      <div className="space-y-3">
        {budgetBoxes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">Nenhuma caixa de planejamento configurada</p>
            <p className="text-xs mt-1">Clique em "Nova Caixa" para começar</p>
          </div>
        ) : (
          budgetBoxes
            .sort((a, b) => a.order_index - b.order_index)
            .map((box) => (
              <div
                key={box.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  editingBox?.id === box.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{box.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{box.name}</h4>
                    <p className="text-sm text-gray-500">
                      {box.percentage}% da renda mensal
                    </p>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: box.color }}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartEdit(box)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    disabled={isAdding || editingBox !== null}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(box.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    disabled={isAdding || editingBox !== null}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Summary */}
      {budgetBoxes.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Total de Percentuais:</span>
            <span className={`text-lg font-bold ${
              totalPercentage === 100 
                ? 'text-green-600' 
                : totalPercentage > 100 
                  ? 'text-red-600' 
                  : 'text-yellow-600'
            }`}>
              {totalPercentage.toFixed(2)}%
            </span>
          </div>
          {totalPercentage === 100 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Perfeito! A soma dos percentuais está em 100%
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
