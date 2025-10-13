import { useState, useEffect } from 'react'
import { Check, ChevronRight, ChevronLeft, DollarSign, Target, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useBudgetBoxes } from '@/hooks/useBudgetBoxes'
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/utils/formatters'
import { BudgetBoxesManager } from '@/components/BudgetBoxesManager'

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [boxPercentages, setBoxPercentages] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const { budgetBoxes, updateBudgetBox, loading: budgetBoxesLoading } = useBudgetBoxes()
  const { markOnboardingComplete } = useOnboardingStatus()
  const { profile, updateProfile } = useAuth()

  const totalSteps = 3

  // Inicializar percentuais padrão
  useEffect(() => {
    if (budgetBoxes.length > 0 && Object.keys(boxPercentages).length === 0) {
      const defaultPercentages: Record<string, number> = {}
      budgetBoxes.forEach(box => {
        defaultPercentages[box.id] = box.percentage
      })
      setBoxPercentages(defaultPercentages)
    }
  }, [budgetBoxes])

  const handleIncomeChange = (value: string) => {
    // Permitir apenas números e vírgula/ponto
    const cleanValue = value.replace(/[^\d.,]/g, '')
    setMonthlyIncome(cleanValue)
  }

  const handlePercentageChange = (boxId: string, value: string) => {
    const percentage = parseFloat(value) || 0
    setBoxPercentages(prev => ({
      ...prev,
      [boxId]: percentage
    }))
  }

  const getTotalPercentage = () => {
    return Object.values(boxPercentages).reduce((sum, val) => sum + val, 0)
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return monthlyIncome && parseFloat(monthlyIncome.replace(',', '.')) > 0
      case 2:
        const total = getTotalPercentage()
        return total === 100 && Object.values(boxPercentages).every(p => p >= 0)
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // Salvar renda mensal nas configurações do usuário
      const incomeAmount = parseIncome()
      if (incomeAmount > 0) {
        const currentSettings = profile?.settings as any || {}
        await updateProfile({
          settings: {
            ...currentSettings,
            monthly_income: incomeAmount
          }
        })
      }

      // Atualizar percentuais das caixas
      for (const [boxId, percentage] of Object.entries(boxPercentages)) {
        await updateBudgetBox(boxId, { percentage })
      }
      
      // Marcar onboarding como completo
      await markOnboardingComplete()
      
      onComplete()
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const parseIncome = () => {
    return parseFloat(monthlyIncome.replace(',', '.')) || 0
  }

  const getBoxAmount = (percentage: number) => {
    return (parseIncome() * percentage) / 100
  }

  const renderStep1 = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <DollarSign className="text-blue-600" size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Qual é sua renda mensal?
      </h2>
      <p className="text-gray-600 mb-8">
        Para calcularmos automaticamente seus orçamentos, precisamos saber sua renda mensal.
      </p>
      
      <div className="max-w-sm mx-auto">
        <Input
          type="text"
          value={monthlyIncome}
          onChange={(e) => handleIncomeChange(e.target.value)}
          placeholder="Ex: 5000,00"
          className="text-center text-2xl font-bold"
        />
        {parseIncome() > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            Renda: {formatCurrency(parseIncome())}
          </p>
        )}
      </div>
    </div>
  )

  const renderStep2 = () => {

    return (
      <BudgetBoxesManager>
        <div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Configure suas caixas de planejamento
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            Defina a porcentagem da sua renda para cada caixa. O total deve ser 100%.
          </p>

          <div className="space-y-4 max-w-2xl mx-auto">
            {budgetBoxes.map((box) => (
          <Card key={box.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{box.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{box.name}</h3>
                  <p className="text-sm text-gray-600">
                    {boxPercentages[box.id] ? formatCurrency(getBoxAmount(boxPercentages[box.id])) : 'R$ 0,00'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={boxPercentages[box.id] || ''}
                  onChange={(e) => handlePercentageChange(box.id, e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-20 text-center"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
            </div>
          </Card>
        ))}
        
        <Card className={`p-4 ${getTotalPercentage() === 100 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className={`font-bold ${getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
              {getTotalPercentage().toFixed(1)}%
            </span>
          </div>
          {getTotalPercentage() !== 100 && (
            <p className="text-sm text-red-600 mt-1">
              O total deve ser exatamente 100%
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const defaultPercentages: Record<string, number> = {}
                budgetBoxes.forEach(box => {
                  defaultPercentages[box.id] = box.percentage
                })
                setBoxPercentages(defaultPercentages)
              }}
              className="text-xs"
            >
              Resetar para valores padrão
            </Button>
          </div>
        </Card>
      </div>
    </div>
      </BudgetBoxesManager>
    )
  }

  const renderStep3 = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="text-purple-600" size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Tudo pronto!
      </h2>
      <p className="text-gray-600 mb-8">
        Suas caixas de planejamento foram configuradas. Agora você pode começar a usar o FinanceFlow.
      </p>

      <div className="max-w-md mx-auto space-y-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <DollarSign className="text-blue-600" size={24} />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Renda Mensal</p>
              <p className="text-blue-600 font-bold">{formatCurrency(parseIncome())}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {budgetBoxes.map((box) => (
            <Card key={box.id} className="p-3">
              <div className="flex items-center gap-2">
                <span>{box.icon}</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{box.name}</p>
                  <p className="text-xs text-gray-600">
                    {boxPercentages[box.id]?.toFixed(1)}% - {formatCurrency(getBoxAmount(boxPercentages[box.id] || 0))}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo ao FinanceFlow, {profile?.name}! 👋
            </h1>
            <span className="text-sm text-gray-600">
              Passo {currentStep} de {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8">
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft size={20} className="mr-2" />
            Voltar
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
            >
              Continuar
              <ChevronRight size={20} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Finalizando...
                </>
              ) : (
                <>
                  <Check size={20} className="mr-2" />
                  Finalizar
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
