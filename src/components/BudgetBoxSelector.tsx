import { useState } from 'react'
import { Database } from '@/types/supabase'
import { useBudgetBoxes } from '@/hooks/useBudgetBoxes'

type BudgetBox = Database['public']['Tables']['budget_boxes']['Row']

interface BudgetBoxSelectorProps {
  value?: string | null
  onChange: (budgetBoxId: string | null) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  type?: 'income' | 'expense'
}

export function BudgetBoxSelector({
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecione uma caixa de planejamento',
  className = '',
  type = 'expense'
}: BudgetBoxSelectorProps) {
  const { budgetBoxes, loading } = useBudgetBoxes()
  const [isOpen, setIsOpen] = useState(false)

  const selectedBox = budgetBoxes.find(box => box.id === value)

  const handleSelect = (boxId: string | null) => {
    onChange(boxId)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left border border-gray-300 rounded-md 
          bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          flex items-center justify-between
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          {selectedBox ? (
            <>
              <span className="text-lg">{selectedBox.icon}</span>
              <span className="text-sm font-medium text-gray-900">
                {selectedBox.name}
              </span>
              <span className="text-xs text-gray-500">
                ({selectedBox.percentage}%)
              </span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Option: Sem caixa */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={`
              w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2
              ${!value ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
            `}
          >
            <span className="text-sm text-gray-400">🚫</span>
            <span className="text-sm">Sem caixa específica</span>
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Budget Boxes Options */}
          {budgetBoxes.map((box) => (
            <button
              key={box.id}
              type="button"
              onClick={() => handleSelect(box.id)}
              className={`
                w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between
                ${value === box.id ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{box.icon}</span>
                <span className="text-sm font-medium">{box.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{box.percentage}%</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: box.color }}
                ></div>
              </div>
            </button>
          ))}

          {/* Empty State */}
          {budgetBoxes.length === 0 && (
            <div className="px-3 py-4 text-center text-gray-500">
              <p className="text-sm">Nenhuma caixa de planejamento encontrada</p>
              <p className="text-xs mt-1">
                Configure suas caixas nas configurações
              </p>
            </div>
          )}
        </div>
      )}

      {/* Click Outside Handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Hook personalizado para obter informações da caixa selecionada
export function useBudgetBoxInfo(budgetBoxId: string | null) {
  const { budgetBoxes } = useBudgetBoxes()
  
  return budgetBoxes.find(box => box.id === budgetBoxId) || null
}

// Componente para exibir informações da caixa selecionada
interface BudgetBoxInfoProps {
  budgetBoxId: string | null
  showPercentage?: boolean
  showColor?: boolean
  className?: string
}

export function BudgetBoxInfo({
  budgetBoxId,
  showPercentage = true,
  showColor = true,
  className = ''
}: BudgetBoxInfoProps) {
  const boxInfo = useBudgetBoxInfo(budgetBoxId)

  if (!boxInfo) {
    return (
      <span className={`text-gray-500 text-sm ${className}`}>
        Sem caixa específica
      </span>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg">{boxInfo.icon}</span>
      <span className="text-sm font-medium text-gray-900">
        {boxInfo.name}
      </span>
      {showPercentage && (
        <span className="text-xs text-gray-500">
          ({boxInfo.percentage}%)
        </span>
      )}
      {showColor && (
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: boxInfo.color }}
        ></div>
      )}
    </div>
  )
}
