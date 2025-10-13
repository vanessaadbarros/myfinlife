import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Loading'

export function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos')
      return
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    const { error } = await signUp(formData.email, formData.password, formData.name)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Redirecionar para onboarding após cadastro
      navigate('/onboarding')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">Fin</h1>
          <p className="text-gray-600">Gestor Financeiro Pessoal</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            type="text"
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
          />

          <Input
            label="Confirmar Senha"
            type="password"
            placeholder="Digite a senha novamente"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            disabled={loading}
          />

          {error && (
            <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Cadastrar'}
          </Button>
        </form>

        {/* Link para login */}
        <p className="text-center text-gray-600 mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  )
}

