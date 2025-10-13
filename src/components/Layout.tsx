import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Sidebar } from '@/components/Sidebar'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function Layout({ 
  children, 
  title, 
  showBackButton = false, 
  onBack 
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content - Adjusts margin based on sidebar state */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                onClick={toggleSidebar}
                className="md:hidden p-2"
              >
                <Menu size={20} />
              </Button>

              {/* Page Title */}
              {title && (
                <div>
                  {showBackButton && onBack && (
                    <Button
                      variant="ghost"
                      onClick={onBack}
                      className="mb-2 flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      ← Voltar
                    </Button>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                </div>
              )}
            </div>

            {/* Right side actions can be added here */}
            <div className="flex items-center gap-3">
              {/* User info or other actions */}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
