import { useEffect, useState } from 'react'
import { useBudgetBoxes } from '@/hooks/useBudgetBoxes'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface BudgetBoxesManagerProps {
  children: React.ReactNode
}

export function BudgetBoxesManager({ children }: BudgetBoxesManagerProps) {
  const { user } = useAuth()
  const { budgetBoxes, loading, refresh } = useBudgetBoxes()
  const [isCreating, setIsCreating] = useState(false)
  const [hasTriedAutoCreate, setHasTriedAutoCreate] = useState(false)

  // Tentar criar automaticamente as caixas se não existirem
  useEffect(() => {
    if (!loading && budgetBoxes.length === 0 && !hasTriedAutoCreate && user) {
      setHasTriedAutoCreate(true)
      createBudgetBoxesIfMissing()
    }
  }, [loading, budgetBoxes.length, hasTriedAutoCreate, user])

  const createBudgetBoxesIfMissing = async () => {
    try {
      setIsCreating(true)
      
      // Verificar se o usuário tem caixas
      const { data: existingBoxes, error: checkError } = await supabase
        .from('budget_boxes')
        .select('id')
        .eq('user_id', user!.id)

      if (checkError) throw checkError

      // Se não tem caixas, criar
      if (!existingBoxes || existingBoxes.length === 0) {
        // Observação: alguns projetos não expõem a função RPC com parâmetros tipados pelo client.
        // Como já sabemos o user_id pelo contexto, vamos preferir criar diretamente via inserts se necessário.
        const { error } = await supabase.rpc('create_default_budget_boxes', { user_id: user!.id } as any)

        if (error) throw error

        // Recarregar as caixas
        await refresh()
      }
    } catch (error) {
      console.error('Erro ao criar caixas automaticamente:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleManualCreate = async () => {
    await createBudgetBoxesIfMissing()
  }

  // Se está carregando ou criando, mostrar loading
  if (loading || isCreating) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading />
        <span className="ml-2 text-gray-600">
          {isCreating ? 'Criando caixas de planejamento...' : 'Carregando...'}
        </span>
      </div>
    )
  }

  // Se não tem caixas e já tentou criar automaticamente, mostrar erro
  if (budgetBoxes.length === 0 && hasTriedAutoCreate) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Caixas de planejamento não encontradas
        </h3>
        <p className="text-gray-600 mb-4">
          Não foi possível criar suas caixas de planejamento automaticamente.
        </p>
        <Button
          onClick={handleManualCreate}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Tentar Novamente
        </Button>
      </div>
    )
  }

  // Se tem caixas, renderizar o conteúdo filho
  return <>{children}</>
}
