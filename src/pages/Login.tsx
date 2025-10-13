import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Loading'

export function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    setLoading(true)

    const { error } = await signIn(formData.email, formData.password)

    if (error) {
      setError('Email ou senha incorretos')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">Fin</h1>
          <p className="text-gray-600">Bem-vindo de volta!</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Sua senha"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
          />

          {error && (
            <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="text-right">
            <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
              Esqueceu sua senha?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Entrar'}
          </Button>
        </form>

        {/* Link para cadastro */}
        <p className="text-center text-gray-600 mt-6">
          Ainda não tem uma conta?{' '}
          <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}

