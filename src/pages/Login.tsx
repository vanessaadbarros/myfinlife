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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-myfinlife-blue-light/20 to-myfinlife-blue/10 px-4">
      <div className="max-w-md w-full bg-myfinlife-white rounded-hex shadow-myfinlife-lg p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-myfinlife-blue mb-2 font-montserrat">myfinlife</h1>
          <p className="text-myfinlife-blue/70 font-montserrat">Bem-vindo de volta!</p>
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
            <div className="bg-danger-500/10 text-danger-500 px-4 py-3 rounded-hex text-sm font-montserrat">
              {error}
            </div>
          )}

          <div className="text-right">
            <a href="#" className="text-sm text-myfinlife-blue hover:text-myfinlife-blue/80 font-montserrat">
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
        <p className="text-center text-myfinlife-blue/70 mt-6 font-montserrat">
          Ainda não tem uma conta?{' '}
          <Link to="/signup" className="text-myfinlife-blue hover:text-myfinlife-blue/80 font-medium font-montserrat">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}

