import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Trash2, User, Package } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCategories } from '@/hooks/useCategories'
import { useBudgetBoxes } from '@/hooks/useBudgetBoxes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Layout } from '@/components/Layout'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/Loading'
import { BudgetBoxesConfig } from '@/components/BudgetBoxesConfig'

type TabType = 'profile' | 'categories' | 'budget-boxes'

export function Settings() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useAuth()
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  const { budgetBoxes } = useBudgetBoxes()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
  })

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: '📦',
    color: '#6366f1',
    box_id: '',
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await updateProfile({ name: profileForm.name })

    if (error) {
      setError('Erro ao atualizar perfil')
      setLoading(false)
    } else {
      setIsProfileModalOpen(false)
      setLoading(false)
    }
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryForm)
      } else {
        await addCategory(categoryForm)
      }
      handleCloseCategoryModal()
    } catch (err) {
      setError('Erro ao salvar categoria')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      await deleteCategory(id)
    }
  }

  const handleEditCategory = (category: any) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      box_id: category.box_id || '',
    })
    setIsCategoryModalOpen(true)
  }

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false)
    setEditingCategory(null)
    setCategoryForm({
      name: '',
      type: 'expense',
      icon: '📦',
      color: '#6366f1',
      box_id: '',
    })
    setError('')
  }

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  return (
    <Layout 
      title="Configurações" 
      showBackButton={true}
      onBack={() => navigate('/dashboard')}
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <User size={18} />
                Perfil
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Package size={18} />
                Categorias
              </button>
              <button
                onClick={() => setActiveTab('budget-boxes')}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'budget-boxes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Package size={18} />
                Caixas de Planejamento
              </button>
            </nav>
          </div>
        </div>

        {/* Profile Section */}
        {activeTab === 'profile' && (
          <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User size={20} />
              Perfil
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setProfileForm({ name: profile?.name || '' })
                setIsProfileModalOpen(true)
              }}
            >
              <Edit size={18} />
            </Button>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="font-medium text-gray-900">{profile?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{profile?.email}</p>
            </div>
          </div>
        </Card>
        )}

        {/* Categories Section */}
        {activeTab === 'categories' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Gerenciar Categorias
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              <Plus size={18} className="mr-2" />
              Nova Categoria
            </Button>
          </div>

          {/* Expense Categories */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Categorias de Despesas</h3>
            <div className="space-y-2">
              {expenseCategories.map((category) => {
                const box = budgetBoxes.find(b => b.id === category.box_id)
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                        {box && (
                          <div className="text-xs text-gray-500 mt-1">
                            {box.icon} {box.name}
                          </div>
                        )}
                      </div>
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                )
              })}
            </div>
          </div>

          {/* Income Categories */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Categorias de Receitas</h3>
            <div className="space-y-2">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        )}

        {/* Budget Boxes Section */}
        {activeTab === 'budget-boxes' && (
          <BudgetBoxesConfig />
        )}

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Editar Perfil"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Nome"
            type="text"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ name: e.target.value })}
            disabled={loading}
          />

          {error && (
            <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsProfileModalOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Nome"
            type="text"
            placeholder="Ex: Alimentação"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            disabled={loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={categoryForm.type}
              onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as 'income' | 'expense' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              disabled={loading}
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>

          {/* Campo de Caixa de Planejamento (apenas para despesas) */}
          {categoryForm.type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caixa de Planejamento
              </label>
              <select
                value={categoryForm.box_id}
                onChange={(e) => setCategoryForm({ ...categoryForm, box_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                disabled={loading}
              >
                <option value="">Sem caixa</option>
                {budgetBoxes.map((box) => (
                  <option key={box.id} value={box.id}>
                    {box.icon} {box.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Vincule esta categoria a uma caixa de planejamento
              </p>
            </div>
          )}

          <Input
            label="Emoji/Ícone"
            type="text"
            placeholder="📦"
            value={categoryForm.icon}
            onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
            disabled={loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor
            </label>
            <input
              type="color"
              value={categoryForm.color}
              onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
              className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseCategoryModal}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </Layout>
  )
}

