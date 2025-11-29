import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
import {
  Home,
  CreditCard,
  Target,
  TrendingUp,
  FileText,
  Settings,
  Repeat,
  Building2,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: number
  color?: string
}

export function Sidebar({ isOpen, onToggle, isCollapsed: externalCollapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  
  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed))

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home size={20} />,
      path: '/dashboard',
      color: 'text-blue-600'
    },
    {
      id: 'transactions',
      label: 'Transações',
      icon: <CreditCard size={20} />,
      path: '/transactions',
      color: 'text-green-600'
    },
    {
      id: 'recurring',
      label: 'Custos Recorrentes',
      icon: <Repeat size={20} />,
      path: '/recurring',
      color: 'text-orange-600'
    },
    {
      id: 'bank-accounts',
      label: 'Contas e Cartões',
      icon: <Building2 size={20} />,
      path: '/bank-accounts',
      color: 'text-cyan-600'
    },
    {
      id: 'goals',
      label: 'Metas',
      icon: <Target size={20} />,
      path: '/goals',
      color: 'text-purple-600'
    },
    {
      id: 'investments',
      label: 'Investimentos',
      icon: <TrendingUp size={20} />,
      path: '/investments',
      color: 'text-emerald-600'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: <FileText size={20} />,
      path: '/reports',
      color: 'text-indigo-600'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings size={20} />,
      path: '/settings',
      color: 'text-gray-600'
    }
  ]

  const handleNavigate = (path: string) => {
    navigate(path)
    // Fechar sidebar no mobile após navegação
    if (window.innerWidth < 768) {
      onToggle()
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-myfinlife-white border-r border-myfinlife-blue-light z-50 transition-all duration-300 shadow-myfinlife-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        md:translate-x-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-myfinlife-blue-light bg-myfinlife-gray-light">
          {!isCollapsed ? (
            <Logo size="md" />
          ) : (
            <LogoIcon size="md" className="mx-auto" />
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-2 rounded-hex hover:bg-myfinlife-blue-light transition-colors"
              title={isCollapsed ? 'Expandir' : 'Recolher'}
            >
              <Menu size={16} className="text-myfinlife-blue" />
            </button>
            <button
              onClick={onToggle}
              className="md:hidden p-2 rounded-hex hover:bg-myfinlife-blue-light transition-colors"
            >
              <X size={16} className="text-myfinlife-blue" />
            </button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-myfinlife-blue-light bg-myfinlife-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-myfinlife-blue-light rounded-full flex items-center justify-center">
                <User size={20} className="text-myfinlife-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-myfinlife-blue truncate">
                  {profile?.name || 'Usuário'}
                </p>
                <p className="text-sm text-myfinlife-blue/70 truncate">
                  {profile?.email || 'email@exemplo.com'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-hex transition-all duration-200
                    ${isActive(item.path) 
                      ? 'bg-myfinlife-blue-light text-myfinlife-blue border-r-2 border-myfinlife-blue shadow-myfinlife' 
                      : 'text-myfinlife-blue/70 hover:bg-myfinlife-blue-light hover:text-myfinlife-blue'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className={isActive(item.path) ? 'text-myfinlife-blue' : 'text-myfinlife-blue/60'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto bg-danger-500 text-myfinlife-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-myfinlife-blue-light bg-myfinlife-gray-light">
          {!isCollapsed ? (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-hex text-myfinlife-blue/70 hover:bg-danger-500 hover:text-myfinlife-white transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Sair</span>
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center p-2.5 rounded-hex text-myfinlife-blue/70 hover:bg-danger-500 hover:text-myfinlife-white transition-all duration-200"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
