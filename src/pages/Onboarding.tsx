import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingWizard } from '@/components/OnboardingWizard'

export function Onboarding() {
  const [isCompleted, setIsCompleted] = useState(false)
  const navigate = useNavigate()

  const handleComplete = () => {
    setIsCompleted(true)
    // Redirecionar para o dashboard após 2 segundos
    setTimeout(() => {
      navigate('/dashboard')
    }, 2000)
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-myfinlife-gray-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-success-500/10 rounded-hex flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-myfinlife-blue mb-2 font-montserrat">
            Configuração concluída! 🎉
          </h2>
          <p className="text-myfinlife-blue/70 font-montserrat">
            Redirecionando para o dashboard...
          </p>
        </div>
      </div>
    )
  }

  return <OnboardingWizard onComplete={handleComplete} />
}