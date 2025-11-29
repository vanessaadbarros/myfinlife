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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-myfinlife-blue-light/20 to-myfinlife-blue/10 px-4">
      <div className="max-w-md w-full bg-myfinlife-white rounded-hex shadow-myfinlife-lg p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-myfinlife-blue mb-2 font-montserrat">myfinlife</h1>
          <p className="text-myfinlife-blue/70 font-montserrat">Gestor Financeiro Pessoal</p>
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
            <div className="bg-danger-500/10 text-danger-500 px-4 py-3 rounded-hex text-sm font-montserrat">
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
        <p className="text-center text-myfinlife-blue/70 mt-6 font-montserrat">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-myfinlife-blue hover:text-myfinlife-blue/80 font-medium font-montserrat">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  )
}

