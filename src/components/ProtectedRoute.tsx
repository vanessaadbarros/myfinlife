import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus'
import { Loading } from '@/components/ui/Loading'

interface ProtectedRouteProps {
  children: ReactNode
  requireOnboarding?: boolean
}

export function ProtectedRoute({ children, requireOnboarding = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const { needsOnboarding, loading: onboardingLoading } = useOnboardingStatus()
  const location = useLocation()

  if (loading || onboardingLoading) {
    return <Loading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Se está na rota de onboarding mas não precisa de onboarding, redirecionar para dashboard
  if (location.pathname === '/onboarding' && needsOnboarding === false) {
    return <Navigate to="/dashboard" replace />
  }

  // Se precisa de onboarding mas não está na rota de onboarding, redirecionar para onboarding
  if (needsOnboarding === true && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  // Se a rota requer onboarding mas o usuário precisa de onboarding e não está na rota de onboarding
  if (requireOnboarding && needsOnboarding === true && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

